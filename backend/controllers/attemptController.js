const db = require('../config/db');

// START ATTEMPT
async function startAttempt(req, res) {
    try {
        const userId = req.user.id;
        const { quiz_id } = req.body;

        if (!quiz_id) return res.status(400).json({ status: 'FAIL', message: 'Quiz ID required' });

        // Get Quiz
        const quizRes = await db.query('SELECT * FROM quizzes WHERE id = $1 AND status = $2', [quiz_id, 'PUBLISHED']);
        if (quizRes.rows.length === 0) return res.status(404).json({ status: 'FAIL', message: 'Quiz not found or not published' });
        const quiz = quizRes.rows[0];

        // Check Max Attempts
        const pastAttempts = await db.query('SELECT count(*) FROM attempts WHERE quiz_id = $1 AND user_id = $2 AND status != $3', [quiz_id, userId, 'IN_PROGRESS']);
        if (parseInt(pastAttempts.rows[0].count) >= quiz.max_attempts) {
            return res.status(400).json({ status: 'FAIL', message: 'You have reached the maximum allowed attempts for this quiz.' });
        }

        // Cancel any IN_PROGRESS attempts for this user and quiz
        await db.query(`UPDATE attempts SET status = 'FAILED' WHERE quiz_id = $1 AND user_id = $2 AND status = 'IN_PROGRESS'`, [quiz_id, userId]);

        // Start new attempt
        const durationMinutes = quiz.duration_minutes || 15;
        const insertAttempt = await db.query(`
            INSERT INTO attempts (quiz_id, user_id, status, started_at, expires_at)
            VALUES ($1, $2, 'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + interval '${durationMinutes} minutes')
            RETURNING id, expires_at
        `, [quiz_id, userId]);

        const attempt = insertAttempt.rows[0];

        // Fetch Questions and Options (excluding is_correct and explanations for security)
        const qRes = await db.query('SELECT id, question_text, marks FROM questions WHERE quiz_id = $1', [quiz_id]);
        const questions = qRes.rows;
        
        for (let q of questions) {
            const optRes = await db.query('SELECT id, option_text FROM options WHERE question_id = $1', [q.id]);
            q.options = optRes.rows;
        }

        return res.status(201).json({
            status: 'SUCCESS',
            data: {
                attempt_id: attempt.id,
                expires_at: attempt.expires_at,
                questions
            }
        });

    } catch (error) {
        console.error('START ATTEMPT ERROR:', error);
        return res.status(500).json({ status: 'ERROR', message: 'Server error' });
    }
}

// SUBMIT ATTEMPT
async function submitAttempt(req, res) {
    try {
        const userId = req.user.id;
        const { attempt_id, answers } = req.body; // answers: [{ question_id, selected_option_id }]

        if (!attempt_id || !Array.isArray(answers)) {
            return res.status(400).json({ status: 'FAIL', message: 'attempt_id and answers array required' });
        }

        const attRes = await db.query('SELECT * FROM attempts WHERE id = $1 AND user_id = $2', [attempt_id, userId]);
        if (attRes.rows.length === 0) return res.status(404).json({ status: 'FAIL', message: 'Attempt not found' });
        const attempt = attRes.rows[0];

        if (attempt.status !== 'IN_PROGRESS') {
            return res.status(400).json({ status: 'FAIL', message: 'Attempt already submitted or invalid' });
        }

        const quizRes = await db.query('SELECT * FROM quizzes WHERE id = $1', [attempt.quiz_id]);
        const quiz = quizRes.rows[0] || {};

        // Calculate score
        let score = 0;
        let totalMarks = 0;
        let correct_answers = 0;
        let incorrect_answers = 0;
        let unanswered = 0;

        const qRes = await db.query('SELECT * FROM questions WHERE quiz_id = $1', [attempt.quiz_id]);
        const questions = qRes.rows;

        // prepare answers for DB insertion
        const answersToInsert = [];

        for (const q of questions) {
            const qMarks = Number(q.marks) || 5;
            totalMarks += qMarks;
            const userAns = answers.find(a => Number(a.question_id) === Number(q.id));
            
            if (!userAns || !userAns.selected_option_id) {
                unanswered++;
                answersToInsert.push({ qId: q.id, optId: null, is_correct: false });
            } else {
                const optRes = await db.query('SELECT is_correct FROM options WHERE id = $1', [userAns.selected_option_id]);
                if (optRes.rows.length > 0 && optRes.rows[0].is_correct) {
                    correct_answers++;
                    score += qMarks;
                    answersToInsert.push({ qId: q.id, optId: userAns.selected_option_id, is_correct: true });
                } else {
                    incorrect_answers++;
                    const negMark = Number(quiz.negative_marks || 0);
                    score -= negMark; // Apply negative marking
                    answersToInsert.push({ qId: q.id, optId: userAns.selected_option_id, is_correct: false });
                }
            }
        }

        const negativeDeductions = incorrect_answers * Number(quiz.negative_marks || 0);
        score = Math.max(0, Number(score.toFixed(2))); // Clamp score at 0
        const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
        const passingScore = Number(quiz.passing_score) || 70;
        
        // Exact TASK 1 rule: When percentage >= quiz.passing_score, set status = 'PASSED', else 'FAILED'
        const finalStatus = percentage >= passingScore ? 'PASSED' : 'FAILED';

        const startTime = attempt.started_at ? new Date(attempt.started_at) : new Date();
        const timeTakenSeconds = Math.max(0, Math.floor((new Date() - startTime) / 1000));

        // Update Attempt in Database
        await db.query(`
            UPDATE attempts 
            SET score = $1, percentage = $2, correct_answers = $3, incorrect_answers = $4, 
                unanswered = $5, time_taken_seconds = $6, status = $7, completed_at = CURRENT_TIMESTAMP,
                negative_deductions = $8
            WHERE id = $9
        `, [score, percentage, correct_answers, incorrect_answers, unanswered, timeTakenSeconds, finalStatus, negativeDeductions, attempt_id]);

        // Insert Answers
        for (const ans of answersToInsert) {
            await db.query(`
                INSERT INTO answers (attempt_id, question_id, selected_option_id, is_correct) 
                VALUES ($1, $2, $3, $4)
            `, [attempt_id, ans.qId, ans.optId, ans.is_correct]);
        }

        const updatedAttempt = {
            id: attempt_id,
            quiz_id: attempt.quiz_id,
            user_id: userId,
            score,
            percentage,
            passing_score: passingScore,
            correct_answers,
            incorrect_answers,
            unanswered,
            negative_deductions: negativeDeductions,
            time_taken_seconds: timeTakenSeconds,
            status: finalStatus,
            passed: finalStatus === 'PASSED',
            completed_at: new Date()
        };

        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Attempt submitted successfully',
            data: { 
                attempt_id,
                attempt: updatedAttempt
            }
        });

    } catch (error) {
        console.error('SUBMIT ATTEMPT ERROR:', error);
        return res.status(500).json({ status: 'ERROR', message: 'Server error during attempt submission' });
    }
}

// GET ATTEMPT BY ID
async function getAttemptById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const attRes = await db.query(`
            SELECT a.*, q.title as quiz_title, q.passing_score, q.negative_marks 
            FROM attempts a 
            JOIN quizzes q ON a.quiz_id = q.id 
            WHERE a.id = $1 AND a.user_id = $2
        `, [id, userId]);

        if (attRes.rows.length === 0) return res.status(404).json({ status: 'FAIL', message: 'Attempt not found' });
        const attempt = attRes.rows[0];

        // Ensure calculated passed flag and numbers
        const passingScore = Number(attempt.passing_score) || 70;
        const percentage = Number(attempt.percentage) || 0;
        attempt.passed = attempt.status === 'PASSED' || percentage >= passingScore;

        // Fetch questions, options, explanations, and user answer
        const qRes = await db.query('SELECT * FROM questions WHERE quiz_id = $1', [attempt.quiz_id]);
        const questions = qRes.rows;

        const resultQuestions = [];
        for (const q of questions) {
            const optRes = await db.query('SELECT id, option_text, is_correct FROM options WHERE question_id = $1', [q.id]);
            const ansRes = await db.query('SELECT selected_option_id FROM answers WHERE attempt_id = $1 AND question_id = $2', [id, q.id]);
            
            resultQuestions.push({
                ...q,
                options: optRes.rows,
                user_selected_option_id: ansRes.rows.length > 0 ? ansRes.rows[0].selected_option_id : null
            });
        }

        return res.status(200).json({
            status: 'SUCCESS',
            data: {
                attempt,
                questions: resultQuestions
            }
        });

    } catch (error) {
        console.error('GET ATTEMPT ERROR:', error);
        return res.status(500).json({ status: 'ERROR', message: 'Server error' });
    }
}

// GET USER ATTEMPTS
async function getUserAttempts(req, res) {
    try {
        const userId = req.user.id;
        const attRes = await db.query(`
            SELECT a.*, q.title as quiz_title 
            FROM attempts a 
            JOIN quizzes q ON a.quiz_id = q.id 
            WHERE a.user_id = $1 
            ORDER BY a.started_at DESC
        `, [userId]);

        return res.status(200).json({
            status: 'SUCCESS',
            data: { attempts: attRes.rows }
        });

    } catch (error) {
        console.error('GET USER ATTEMPTS ERROR:', error);
        return res.status(500).json({ status: 'ERROR', message: 'Server error' });
    }
}

module.exports = {
    startAttempt,
    submitAttempt,
    getAttemptById,
    getUserAttempts
};

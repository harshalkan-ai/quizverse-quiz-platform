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

        // Check past completed attempts (single attempt restriction)
        const pastAttempts = await db.query('SELECT count(*) FROM attempts WHERE quiz_id = $1 AND user_id = $2 AND status != $3', [quiz_id, userId, 'IN_PROGRESS']);
        if (parseInt(pastAttempts.rows[0].count) > 0) {
            return res.status(400).json({ status: 'FAIL', message: 'You have already submitted this quiz and cannot attempt it again.' });
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

        // ── Build a String-keyed Map to safely handle UUID vs numeric IDs ──
        const submittedAnswersMap = new Map();
        (answers || []).forEach(a => {
            const qId   = String(a.question_id  || a.questionId  || '');
            const optId = String(a.selected_option_id || a.selectedOptionId || '');
            if (qId && optId) submittedAnswersMap.set(qId, optId);
        });

        // ── Scoring variables ──
        let obtainedMarks         = 0;
        let totalMarks            = 0;
        let correctAnswersCount   = 0;
        let incorrectAnswersCount = 0;
        let unansweredCount       = 0;

        const qRes = await db.query('SELECT * FROM questions WHERE quiz_id = $1', [attempt.quiz_id]);
        const questions = qRes.rows;

        // prepare answers for DB insertion
        const answersToInsert = [];

        for (const q of questions) {
            const qMarks    = Number(q.marks) || 5;
            totalMarks     += qMarks;

            const qIdStr    = String(q.id);
            const userOptStr = submittedAnswersMap.get(qIdStr);

            // Get the correct option for this question
            const correctOptRes = await db.query(
                'SELECT id FROM options WHERE question_id = $1 AND is_correct = true LIMIT 1',
                [q.id]
            );
            const correctOptStr = correctOptRes.rows.length > 0
                ? String(correctOptRes.rows[0].id)
                : null;

            if (!userOptStr) {
                unansweredCount++;
                answersToInsert.push({ qId: q.id, optId: null, is_correct: false });
            } else if (correctOptStr && userOptStr === correctOptStr) {
                obtainedMarks += qMarks;
                correctAnswersCount++;
                answersToInsert.push({ qId: q.id, optId: userOptStr, is_correct: true });
            } else {
                incorrectAnswersCount++;
                obtainedMarks -= Number(quiz.negative_marks || 0);
                answersToInsert.push({ qId: q.id, optId: userOptStr, is_correct: false });
            }
        }

        const negativeDeductions = incorrectAnswersCount * Number(quiz.negative_marks || 0);
        const clampedScore = Math.max(0, obtainedMarks);
        const score        = Number(clampedScore.toFixed(2));
        const percentage   = totalMarks > 0
            ? Number(((clampedScore / totalMarks) * 100).toFixed(2))
            : 0;
        attempt.passing_score = attempt.passing_score || quiz.passing_score || 70;
        const isPassed = percentage >= Number(attempt.passing_score || 70);
        const finalStatus = isPassed ? 'PASSED' : 'FAILED';

        const startTime        = attempt.started_at ? new Date(attempt.started_at) : new Date();
        const timeTakenSeconds = Math.max(0, Math.floor((new Date() - startTime) / 1000));

        // Update Attempt in Database
        await db.query(`
            UPDATE attempts 
            SET score = $1, percentage = $2, correct_answers = $3, incorrect_answers = $4, 
                unanswered = $5, time_taken_seconds = $6, status = $7, completed_at = CURRENT_TIMESTAMP,
                negative_deductions = $8
            WHERE id = $9
        `, [score, percentage, correctAnswersCount, incorrectAnswersCount, unansweredCount, timeTakenSeconds, finalStatus, negativeDeductions, attempt_id]);

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
            passing_score: attempt.passing_score,
            correct_answers:     correctAnswersCount,
            incorrect_answers:   incorrectAnswersCount,
            unanswered:          unansweredCount,
            negative_deductions: negativeDeductions,
            time_taken_seconds:  timeTakenSeconds,
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
        
        // Force status evaluation:
        const isPassed = percentage >= passingScore;
        attempt.status = isPassed ? 'PASSED' : 'FAILED';
        attempt.passed = isPassed;

        // Fetch questions, options, explanations, and user answer
        const qRes = await db.query('SELECT * FROM questions WHERE quiz_id = $1', [attempt.quiz_id]);
        const questions = qRes.rows;

        const resultQuestions = [];
        for (const q of questions) {
            const optRes = await db.query('SELECT id, option_text, is_correct FROM options WHERE question_id = $1', [q.id]);
            const ansRes = await db.query('SELECT selected_option_id, is_correct FROM answers WHERE attempt_id = $1 AND question_id = $2', [id, q.id]);
            
            const user_answer = ansRes.rows.length > 0 ? {
                selected_option_id: ansRes.rows[0].selected_option_id,
                is_correct: ansRes.rows[0].is_correct === true || ansRes.rows[0].is_correct === 'true'
            } : null;

            resultQuestions.push({
                ...q,
                options: optRes.rows,
                user_selected_option_id: user_answer ? user_answer.selected_option_id : null,
                user_answer: user_answer
            });
        }

        // Dynamically compute correct answers count if 0
        const correctCount = resultQuestions.filter(q => q.user_answer && q.user_answer.is_correct === true).length;
        const incorrectCount = resultQuestions.filter(q => q.user_answer && q.user_answer.is_correct === false).length;
        const unansweredCount = resultQuestions.filter(q => !q.user_answer || !q.user_answer.selected_option_id).length;

        attempt.correct_answers = Number(attempt.correct_answers) || correctCount;
        attempt.incorrect_answers = Number(attempt.incorrect_answers) || incorrectCount;
        attempt.unanswered = Number(attempt.unanswered) || unansweredCount;

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

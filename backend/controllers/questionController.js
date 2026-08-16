const db = require('../config/db');

// 1. ADD QUESTION WITH 4 OPTIONS (Admin Only)
async function addQuestion(req, res) {
    try {
        const { quiz_id, question_text, marks, explanation, options } = req.body || {};

        if (!quiz_id || !question_text || !options || options.length < 2) {
            return res.status(400).json({
                status: 'FAIL',
                message: 'quiz_id, question_text, and at least 2 options are required.'
            });
        }

        // Insert Question
        const questionResult = await db.query(
            `INSERT INTO questions (quiz_id, question_text, marks, explanation) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
            [quiz_id, question_text, marks || 1, explanation || '']
        );

        const question = questionResult.rows[0];

        // Insert Options linked to question.id
        const insertedOptions = [];
        for (const opt of options) {
            const optResult = await db.query(
                `INSERT INTO options (question_id, option_text, is_correct) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
                [question.id, opt.option_text, opt.is_correct || false]
            );
            insertedOptions.push(optResult.rows[0]);
        }

        return res.status(201).json({
            status: 'SUCCESS',
            message: 'Question and options added successfully',
            data: {
                question,
                options: insertedOptions
            }
        });

    } catch (error) {
        console.error('Add Question Error:', error);
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}

// 2. GET QUESTIONS FOR A QUIZ (Anti-Cheat: Hide `is_correct` if student)
async function getQuizQuestions(req, res) {
    try {
        const { quizId } = req.params;
        const isAdmin = req.user && req.user.role === 'ADMIN';

        const questionsResult = await db.query(
            'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY created_at ASC',
            [quizId]
        );

        const questions = questionsResult.rows;

        for (let q of questions) {
            // Security Check: If user is STUDENT, hide `is_correct` field from JSON response!
            const optionQuery = isAdmin
                ? 'SELECT id, option_text, is_correct FROM options WHERE question_id = $1'
                : 'SELECT id, option_text FROM options WHERE question_id = $1';

            const optionsResult = await db.query(optionQuery, [q.id]);
            q.options = optionsResult.rows;
        }

        return res.status(200).json({
            status: 'SUCCESS',
            data: { questions }
        });

    } catch (error) {
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}

// 3. DELETE QUESTION (Admin Only)
async function deleteQuestion(req, res) {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM questions WHERE id = $1', [id]);
        return res.status(200).json({ status: 'SUCCESS', message: 'Question deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}

module.exports = {
    addQuestion,
    getQuizQuestions,
    deleteQuestion
};
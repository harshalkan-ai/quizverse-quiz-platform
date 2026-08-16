const db = require('../config/db');

// 1. CREATE QUIZ (Admin Only - Defaults to 'DRAFT')
async function createQuiz(req, res) {
    try {
        const { title, description, category_id, difficulty, duration_minutes, passing_score, max_attempts } = req.body || {};

        if (!title || !duration_minutes || !passing_score) {
            return res.status(400).json({ status: 'FAIL', message: 'Title, duration_minutes, and passing_score are required.' });
        }

        const result = await db.query(
            `INSERT INTO quizzes 
       (title, description, category_id, difficulty, duration_minutes, passing_score, max_attempts, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'DRAFT') 
       RETURNING *`,
            [
                title,
                description || '',
                category_id || null,
                difficulty || 'EASY',
                duration_minutes,
                passing_score,
                max_attempts || 1
            ]
        );

        return res.status(201).json({
            status: 'SUCCESS',
            message: 'Quiz created in DRAFT status',
            data: { quiz: result.rows[0] }
        });
    } catch (error) {
        console.error('Create Quiz Error:', error);
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}

// 2. GET ALL QUIZZES (Students see PUBLISHED only; Admins see all)
async function getAllQuizzes(req, res) {
    try {
        const isStudent = req.user && req.user.role?.toUpperCase() === 'STUDENT';
        let query = `
            SELECT q.*, c.name as category_name, (SELECT COUNT(*)::int FROM questions WHERE quiz_id = q.id) as total_questions
            FROM quizzes q
            LEFT JOIN categories c ON q.category_id = c.id
        `;

        if (isStudent) {
            query += ` WHERE q.status = 'PUBLISHED'`;
        }

        query += ` ORDER BY q.created_at DESC`;

        const result = await db.query(query);
        return res.status(200).json({ status: 'SUCCESS', data: { quizzes: result.rows } });
    } catch (error) {
        console.error('getAllQuizzes Error:', error);
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}

// 3. TOGGLE PUBLISH STATUS (Admin Only)
async function togglePublishQuiz(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'PUBLISHED', 'UNPUBLISHED', or 'DRAFT'

        if (!['DRAFT', 'PUBLISHED', 'UNPUBLISHED'].includes(status)) {
            return res.status(400).json({ status: 'FAIL', message: 'Invalid quiz status.' });
        }

        const result = await db.query(
            'UPDATE quizzes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'FAIL', message: 'Quiz not found.' });
        }

        return res.status(200).json({
            status: 'SUCCESS',
            message: `Quiz status updated to ${status}`,
            data: { quiz: result.rows[0] }
        });
    } catch (error) {
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}

// 4. DELETE QUIZ (Admin Only)
async function deleteQuiz(req, res) {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM quizzes WHERE id = $1', [id]);
        return res.status(200).json({ status: 'SUCCESS', message: 'Quiz deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}

module.exports = {
    createQuiz,
    getAllQuizzes,
    togglePublishQuiz,
    deleteQuiz
};
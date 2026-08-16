const db = require('../config/db');

// TASK 1: GET ADMIN ANALYTICS
async function getAdminAnalytics(req, res) {
    try {
        // 1. Total Students with attempts (COUNT(DISTINCT user_id) WHERE role = 'STUDENT')
        const studentsRes = await db.query(`
            SELECT COUNT(DISTINCT a.user_id)::int as count 
            FROM attempts a 
            JOIN users u ON a.user_id = u.id 
            WHERE u.role = 'STUDENT'
        `);
        const totalStudents = studentsRes.rows[0]?.count || 0;

        // Total registered students count as helper statistic
        const regRes = await db.query(`
            SELECT COUNT(*)::int as count 
            FROM users 
            WHERE role = 'STUDENT'
        `);
        const totalRegisteredStudents = regRes.rows[0]?.count || 0;

        // 2. Total Quizzes
        const quizzesRes = await db.query('SELECT COUNT(*)::int as count FROM quizzes');
        const totalQuizzes = quizzesRes.rows[0]?.count || 0;

        // 3. Total Attempts & Platform Average Score %
        const attemptsRes = await db.query(`
            SELECT COUNT(*)::int as total_attempts, 
                   ROUND(AVG(percentage), 2) as avg_score 
            FROM attempts 
            WHERE status != 'IN_PROGRESS'
        `);
        const totalAttempts = attemptsRes.rows[0]?.total_attempts || 0;
        const avgScore = parseFloat(attemptsRes.rows[0]?.avg_score || 0);

        // 4. Total Passed vs Total Failed attempts count
        const passedRes = await db.query("SELECT COUNT(*)::int as count FROM attempts WHERE status = 'PASSED'");
        const totalPassed = passedRes.rows[0]?.count || 0;

        const failedRes = await db.query("SELECT COUNT(*)::int as count FROM attempts WHERE status IN ('FAILED', 'TIMED_OUT')");
        const totalFailed = failedRes.rows[0]?.count || 0;

        // 5. Category Performance Breakdown (GROUP BY c.name)
        const categoryRes = await db.query(`
            SELECT c.name as name, 
                   COUNT(a.id)::int as attempts_count, 
                   ROUND(AVG(a.percentage), 2) as avg_score 
            FROM attempts a 
            JOIN quizzes q ON a.quiz_id = q.id 
            JOIN categories c ON q.category_id = c.id 
            WHERE a.status != 'IN_PROGRESS' 
            GROUP BY c.name
            ORDER BY attempts_count DESC
        `);

        return res.status(200).json({
            status: 'SUCCESS',
            data: {
                totalStudents,
                totalRegisteredStudents,
                totalQuizzes,
                totalAttempts,
                avgScore,
                totalPassed,
                totalFailed,
                categoryBreakdown: categoryRes.rows
            }
        });
    } catch (error) {
        console.error('getAdminAnalytics error:', error);
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}

// TASK 2: GET LEADERBOARD
async function getLeaderboard(req, res) {
    try {
        const { category_id } = req.query;

        let query = `
            SELECT u.id, 
                   u.name, 
                   COUNT(a.id)::int as total_taken, 
                   ROUND(AVG(a.percentage), 2) as avg_score, 
                   MAX(a.percentage) as highest_score 
            FROM users u 
            JOIN attempts a ON u.id = a.user_id 
        `;

        const params = [];
        
        // If filtering by category, we need to join quizzes and check category_id
        if (category_id) {
            query += ` JOIN quizzes q ON a.quiz_id = q.id `;
        }

        query += ` WHERE a.status != 'IN_PROGRESS' AND u.role = 'STUDENT' `;

        if (category_id) {
            params.push(category_id);
            query += ` AND q.category_id = $${params.length} `;
        }

        query += `
            GROUP BY u.id, u.name 
            ORDER BY avg_score DESC, total_taken DESC 
            LIMIT 10
        `;

        const result = await db.query(query, params);

        return res.status(200).json({
            status: 'SUCCESS',
            data: {
                leaderboard: result.rows
            }
        });
    } catch (error) {
        console.error('getLeaderboard error:', error);
        return res.status(500).json({ status: 'ERROR', message: error.message });
    }
}

module.exports = {
    getAdminAnalytics,
    getLeaderboard
};

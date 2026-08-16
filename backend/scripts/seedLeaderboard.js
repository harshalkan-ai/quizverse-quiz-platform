const bcrypt = require('bcryptjs');
const db = require('../config/db');

const STUDENTS = [
    { name: "Rahul Sharma", email: "rahul@gmail.com", scores: [95.00, 90.00] },
    { name: "Priya Patel", email: "priya@gmail.com", scores: [92.00, 88.00] },
    { name: "Amit Kumar", email: "amit@gmail.com", scores: [85.00, 75.00] },
    { name: "Swastik Kanojiya", email: "swastik@gmail.com", scores: [98.00, 95.00] },
    { name: "Gansur Verma", email: "gansur@gmail.com", scores: [70.00, 65.00] },
    { name: "Vikram Singh", email: "vikram@gmail.com", scores: [80.00, 85.00] },
    { name: "Ananya Gupta", email: "ananya@gmail.com", scores: [94.00, 92.00] },
    { name: "Sneha Reddy", email: "sneha@gmail.com", scores: [88.00, 82.00] },
    { name: "Rohan Mehta", email: "rohan@gmail.com", scores: [75.00, 70.00] },
    { name: "Neha Joshi", email: "neha@gmail.com", scores: [60.00, 78.00] },
    { name: "Karan Kapoor", email: "karan@gmail.com", scores: [50.00, 72.00] },
    { name: "Pooja Malhotra", email: "pooja@gmail.com", scores: [86.00, 84.00] }
];

async function seedLeaderboard() {
    try {
        console.log('🌱 Starting Student Leaderboard Seeding...');
        
        // Get published quizzes to link attempts
        const quizzesRes = await db.query("SELECT id, title, passing_score FROM quizzes WHERE status = 'PUBLISHED'");
        const quizzes = quizzesRes.rows;
        if (quizzes.length === 0) {
            console.warn('⚠️ No published quizzes found. Please seed quizzes first!');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Password123', salt);

        for (const student of STUDENTS) {
            // 1. Create or fetch student user
            let userId;
            const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [student.email]);
            if (userCheck.rows.length === 0) {
                const insertUser = await db.query(
                    `INSERT INTO users (name, email, password_hash, role) 
                     VALUES ($1, $2, $3, 'STUDENT') 
                     RETURNING id`,
                    [student.name, student.email, passwordHash]
                );
                userId = insertUser.rows[0].id;
                console.log(`👤 Student Account Seeded: ${student.name} (${student.email})`);
            } else {
                userId = userCheck.rows[0].id;
            }

            // 2. Create attempts
            // Check if student already has attempts
            const attemptsCheck = await db.query('SELECT COUNT(*) FROM attempts WHERE user_id = $1', [userId]);
            if (parseInt(attemptsCheck.rows[0].count) === 0) {
                for (let i = 0; i < student.scores.length; i++) {
                    const scorePercentage = student.scores[i];
                    // Pick a quiz (round-robin style or random)
                    const quiz = quizzes[i % quizzes.length];
                    const status = scorePercentage >= quiz.passing_score ? 'PASSED' : 'FAILED';
                    
                    // Assume quiz has 100 max score for simplicity
                    const marksObtained = (scorePercentage / 100) * 100;
                    const incorrectCount = Math.floor((100 - scorePercentage) / 5);
                    const correctCount = 20 - incorrectCount; // 20 questions total

                    await db.query(
                        `INSERT INTO attempts 
                         (quiz_id, user_id, score, percentage, correct_answers, incorrect_answers, unanswered, time_taken_seconds, status, started_at, expires_at, completed_at) 
                         VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, CURRENT_TIMESTAMP - interval '1 day', CURRENT_TIMESTAMP - interval '23 hours', CURRENT_TIMESTAMP - interval '23 hours 45 minutes')`,
                        [
                            quiz.id,
                            userId,
                            marksObtained,
                            scorePercentage,
                            correctCount,
                            incorrectCount,
                            Math.floor(200 + Math.random() * 300), // Time taken in seconds
                            status
                        ]
                    );
                }
                console.log(`📈 Attempts created for ${student.name}`);
            }
        }
        console.log('✅ Student Leaderboard Seeding Completed Successfully!');
    } catch (err) {
        console.error('❌ Leaderboard seeding error:', err);
    }
}

module.exports = seedLeaderboard;

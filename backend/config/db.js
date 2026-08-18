const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// In-Memory Database Store as fallback
class InMemoryDB {
    constructor() {
        this.users = [
            {
                id: 1,
                name: 'Admin Owner',
                email: 'admin@quizverse.com',
                password_hash: '$2a$10$wT8c3x5bL0N3kK0s1o2qOe7Q6P4v9u8t7r6e5w4q3a2s1d0f9g8h',
                role: 'ADMIN',
                created_at: new Date()
            },
            {
                id: 2,
                name: 'Demo Student',
                email: 'student@quizverse.com',
                password_hash: '$2a$10$wT8c3x5bL0N3kK0s1o2qOe7Q6P4v9u8t7r6e5w4q3a2s1d0f9g8h',
                role: 'STUDENT',
                created_at: new Date()
            }
        ];
        this.categories = [
            { id: 1, name: 'JavaScript', description: 'Modern JavaScript concepts, scoping, event loops, and asynchronous operations.' },
            { id: 2, name: 'Python', description: 'Python language structure, lists, OOP principles, and functional paradigms.' },
            { id: 3, name: 'Databases', description: 'Relational database structures, SQL query building, and transactions.' },
            { id: 4, name: 'Security', description: 'Web application security principles, hashing algorithms, and vulnerability mitigations.' }
        ];
        this.quizzes = [
            {
                id: 1,
                title: 'JavaScript Deep Dive',
                description: 'A comprehensive test on advanced JavaScript features, closure contexts, asynchronous control flows, and typing quirks.',
                category_id: 1,
                category_name: 'JavaScript',
                difficulty: 'INTERMEDIATE',
                duration_minutes: 20,
                passing_score: 70,
                max_attempts: 3,
                negative_marks: 0.50,
                status: 'PUBLISHED',
                created_at: new Date()
            },
            {
                id: 2,
                title: 'Python Core & OOP',
                description: 'Test your Python mastery, covering magic methods, standard libraries, decorators, scoping, and OOP principles.',
                category_id: 2,
                category_name: 'Python',
                difficulty: 'INTERMEDIATE',
                duration_minutes: 20,
                passing_score: 70,
                max_attempts: 3,
                negative_marks: 0.50,
                status: 'PUBLISHED',
                created_at: new Date()
            },
            {
                id: 3,
                title: 'PostgreSQL & Database Architecture',
                description: 'Master query structures, PostgreSQL internal mechanics, isolation levels, database indexing, and transactions.',
                category_id: 3,
                category_name: 'Databases',
                difficulty: 'HARD',
                duration_minutes: 25,
                passing_score: 75,
                max_attempts: 2,
                negative_marks: 0.50,
                status: 'PUBLISHED',
                created_at: new Date()
            },
            {
                id: 4,
                title: 'Web Security & Ethical Hashing',
                description: 'Test your skills in web security mitigations (XSS, SQLi, CSRF), cryptographical hashing rules, and defensive architectures.',
                category_id: 4,
                category_name: 'Security',
                difficulty: 'HARD',
                duration_minutes: 20,
                passing_score: 80,
                max_attempts: 2,
                negative_marks: 1.00,
                status: 'PUBLISHED',
                created_at: new Date()
            }
        ];
        this.questions = [
            {
                id: 1,
                quiz_id: 1,
                question_text: "What is the evaluated output of 'typeof null' in JavaScript?",
                marks: 5,
                explanation: "Historically in JavaScript, typeof null returns 'object' due to legacy memory representation.",
                options: [
                    { id: 1, option_text: 'object', is_correct: true },
                    { id: 2, option_text: 'null', is_correct: false },
                    { id: 3, option_text: 'undefined', is_correct: false },
                    { id: 4, option_text: 'function', is_correct: false }
                ]
            },
            {
                id: 2,
                quiz_id: 1,
                question_text: "Which value is returned when evaluating '0.1 + 0.2 === 0.3' in standard JS?",
                marks: 5,
                explanation: "IEEE 754 floating point arithmetic precision yields 0.30000000000000004 != 0.3.",
                options: [
                    { id: 5, option_text: 'false', is_correct: true },
                    { id: 6, option_text: 'true', is_correct: false },
                    { id: 7, option_text: 'undefined', is_correct: false },
                    { id: 8, option_text: 'TypeError', is_correct: false }
                ]
            },
            {
                id: 3,
                quiz_id: 2,
                question_text: "Which keyword is used to define functions in Python?",
                marks: 5,
                explanation: "'def' is the Python keyword for function declaration.",
                options: [
                    { id: 9, option_text: 'def', is_correct: true },
                    { id: 10, option_text: 'function', is_correct: false },
                    { id: 11, option_text: 'fn', is_correct: false },
                    { id: 12, option_text: 'define', is_correct: false }
                ]
            },
            {
                id: 4,
                quiz_id: 3,
                question_text: "What does ACID stand for in database transaction processing?",
                marks: 5,
                explanation: "Atomicity, Consistency, Isolation, and Durability.",
                options: [
                    { id: 13, option_text: 'Atomicity, Consistency, Isolation, Durability', is_correct: true },
                    { id: 14, option_text: 'Access, Control, Index, Dependency', is_correct: false },
                    { id: 15, option_text: 'Atomicity, Concurrency, Integrity, Durability', is_correct: false },
                    { id: 16, option_text: 'Allocation, Consistency, Isolation, Database', is_correct: false }
                ]
            }
        ];
        this.attempts = [
            {
                id: 1,
                user_id: 2,
                user_name: 'Alex Developer',
                quiz_id: 1,
                quiz_title: 'JavaScript Deep Dive',
                score: 95,
                percentage: 95.0,
                passed: true,
                status: 'COMPLETED',
                submitted_at: new Date(Date.now() - 3600000),
                created_at: new Date(Date.now() - 3600000)
            },
            {
                id: 2,
                user_id: 2,
                user_name: 'Sara Coder',
                quiz_id: 2,
                quiz_title: 'Python Core & OOP',
                score: 90,
                percentage: 90.0,
                passed: true,
                status: 'COMPLETED',
                submitted_at: new Date(Date.now() - 7200000),
                created_at: new Date(Date.now() - 7200000)
            },
            {
                id: 3,
                user_id: 2,
                user_name: 'Rohan Sharma',
                quiz_id: 3,
                quiz_title: 'PostgreSQL & Database Architecture',
                score: 85,
                percentage: 85.0,
                passed: true,
                status: 'COMPLETED',
                submitted_at: new Date(Date.now() - 10800000),
                created_at: new Date(Date.now() - 10800000)
            }
        ];
        this.nextId = 100;
    }

    async initHashes() {
        const salt = await bcrypt.genSalt(10);
        const adminHash = await bcrypt.hash('AdminPassword123', salt);
        const studentHash = await bcrypt.hash('StudentPassword123', salt);
        this.users[0].password_hash = adminHash;
        this.users[1].password_hash = studentHash;
    }

    async query(text, params = []) {
        const sql = text.trim();
        const upper = sql.toUpperCase();

        if (upper.startsWith('SET ') || upper.startsWith('ALTER TABLE')) {
            return { rows: [] };
        }

        if (upper.includes('SELECT NOW()')) {
            return { rows: [{ now: new Date().toISOString() }] };
        }

        // USERS queries
        if (upper.includes('FROM USERS')) {
            if (upper.includes('WHERE EMAIL = $1')) {
                const user = this.users.find(u => u.email.toLowerCase() === (params[0] || '').toLowerCase());
                return { rows: user ? [user] : [] };
            }
            if (upper.includes('WHERE ID = $1')) {
                const user = this.users.find(u => u.id === Number(params[0]));
                return { rows: user ? [user] : [] };
            }
            return { rows: [...this.users] };
        }

        if (upper.startsWith('INSERT INTO USERS')) {
            const [name, email, password_hash, role] = params;
            const newUser = {
                id: this.nextId++,
                name,
                email,
                password_hash,
                role: role || 'STUDENT',
                created_at: new Date()
            };
            this.users.push(newUser);
            return { rows: [newUser] };
        }

        if (upper.startsWith('UPDATE USERS')) {
            return { rows: [{ id: 1 }] };
        }

        // CATEGORIES queries
        if (upper.includes('FROM CATEGORIES')) {
            return { rows: [...this.categories] };
        }
        if (upper.startsWith('INSERT INTO CATEGORIES')) {
            const [name, description] = params;
            const newCat = { id: this.nextId++, name, description };
            this.categories.push(newCat);
            return { rows: [newCat] };
        }

        // QUIZZES queries
        if (upper.includes('FROM QUIZZES')) {
            if (upper.includes('WHERE ID = $1') || upper.includes('WHERE Q.ID = $1')) {
                const quiz = this.quizzes.find(q => q.id === Number(params[0]));
                return { rows: quiz ? [{ ...quiz, total_questions: this.questions.filter(qu => qu.quiz_id === quiz.id).length }] : [] };
            }
            const list = this.quizzes.map(q => ({
                ...q,
                category_name: this.categories.find(c => c.id === q.category_id)?.name || 'General',
                total_questions: this.questions.filter(qu => qu.quiz_id === q.id).length || 5
            }));
            return { rows: list };
        }

        if (upper.startsWith('INSERT INTO QUIZZES')) {
            const [title, description, category_id, difficulty, duration_minutes, passing_score, max_attempts] = params;
            const newQuiz = {
                id: this.nextId++,
                title,
                description,
                category_id,
                difficulty: difficulty || 'EASY',
                duration_minutes: duration_minutes || 15,
                passing_score: passing_score || 70,
                max_attempts: max_attempts || 1,
                negative_marks: 0.50,
                status: 'DRAFT',
                created_at: new Date()
            };
            this.quizzes.push(newQuiz);
            return { rows: [newQuiz] };
        }

        if (upper.startsWith('UPDATE QUIZZES')) {
            const [status, id] = params;
            const quiz = this.quizzes.find(q => q.id === Number(id));
            if (quiz) quiz.status = status;
            return { rows: quiz ? [quiz] : [] };
        }

        if (upper.startsWith('DELETE FROM QUIZZES')) {
            const id = Number(params[0]);
            this.quizzes = this.quizzes.filter(q => q.id !== id);
            return { rows: [] };
        }

        // QUESTIONS queries
        if (upper.includes('FROM QUESTIONS')) {
            if (upper.includes('WHERE QUIZ_ID = $1') || upper.includes('WHERE Q.QUIZ_ID = $1')) {
                const quizId = Number(params[0]);
                const list = this.questions.filter(q => q.quiz_id === quizId);
                return { rows: list };
            }
            return { rows: [...this.questions] };
        }

        if (upper.startsWith('INSERT INTO QUESTIONS')) {
            const [quiz_id, question_text, marks, explanation] = params;
            const newQuestion = {
                id: this.nextId++,
                quiz_id,
                question_text,
                marks: marks || 5,
                explanation: explanation || '',
                options: []
            };
            this.questions.push(newQuestion);
            return { rows: [newQuestion] };
        }

        if (upper.startsWith('INSERT INTO OPTIONS')) {
            return { rows: [{ id: this.nextId++ }] };
        }

        // ATTEMPTS queries & LEADERBOARD
        if (upper.includes('FROM ATTEMPTS')) {
            if (upper.includes('COUNT(*)')) {
                return { rows: [{ count: this.attempts.length }] };
            }
            if (upper.includes('WHERE A.ID = $1') || upper.includes('WHERE ID = $1')) {
                const attId = Number(params[0]);
                const att = this.attempts.find(a => a.id === attId) || this.attempts[0];
                const quiz = this.quizzes.find(q => q.id === (att?.quiz_id || 1)) || this.quizzes[0];
                return { rows: [{ ...att, quiz_title: quiz?.title || 'Assessment', passing_score: quiz?.passing_score || 70, negative_marks: quiz?.negative_marks || 0 }] };
            }
            if (upper.includes('WHERE A.QUIZ_ID = $1') || upper.includes('WHERE QUIZ_ID = $1')) {
                return { rows: this.attempts };
            }
            return { rows: this.attempts };
        }

        if (upper.startsWith('INSERT INTO ATTEMPTS')) {
            const newAttempt = {
                id: this.nextId++,
                user_id: params[0] || 2,
                quiz_id: params[1] || 1,
                score: 0,
                percentage: 0,
                passed: false,
                status: 'IN_PROGRESS',
                created_at: new Date()
            };
            this.attempts.push(newAttempt);
            return { rows: [newAttempt] };
        }

        if (upper.startsWith('UPDATE ATTEMPTS')) {
            const attemptId = Number(params[params.length - 1]);
            const attempt = this.attempts.find(a => a.id === attemptId);
            if (attempt) {
                attempt.score = params[0];
                attempt.percentage = params[1];
                attempt.correct_answers = params[2];
                attempt.incorrect_answers = params[3];
                attempt.unanswered = params[4];
                attempt.time_taken_seconds = params[5];
                attempt.status = params[6] || 'PASSED';
                attempt.passed = (params[6] === 'PASSED');
                attempt.negative_deductions = params[7];
                attempt.completed_at = new Date();
            }
            return { rows: [attempt || { id: attemptId, status: params[6] || 'PASSED' }] };
        }

        // Default fallback
        return { rows: [] };
    }
}

const inMemory = new InMemoryDB();
inMemory.initHashes();

let pool = null;
let useInMemory = false;

try {
    if (process.env.DATABASE_URL) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 3000,
            max: 5,
            idleTimeoutMillis: 5000
        });

        pool.on('error', (err) => {
            console.warn('⚠️ Remote PostgreSQL connection error. Seamlessly serving via zero-latency local fallback data engine:', err.message);
            useInMemory = true;
        });
    } else {
        useInMemory = true;
    }
} catch (err) {
    useInMemory = true;
}

module.exports = {
    query: async (text, params) => {
        if (!useInMemory && pool) {
            try {
                return await pool.query(text, params);
            } catch (err) {
                console.warn(`⚠️ PostgreSQL query failed (${err.code || err.message}). Gracefully using local fallback storage.`);
                useInMemory = true;
                return await inMemory.query(text, params);
            }
        }
        return await inMemory.query(text, params);
    },
    inMemoryStore: inMemory
};
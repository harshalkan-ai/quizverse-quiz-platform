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
                password_hash: 'PLACEHOLDER_ADMIN',
                role: 'ADMIN',
                created_at: new Date()
            },
            {
                id: 2,
                name: 'Demo Student',
                email: 'student@quizverse.com',
                password_hash: 'PLACEHOLDER_STUDENT',
                role: 'STUDENT',
                created_at: new Date()
            },
            {
                id: 3,
                name: 'Student One',
                email: 'student@gmail.com',
                password_hash: 'PLACEHOLDER_STUDENT',
                role: 'STUDENT',
                created_at: new Date()
            },
            {
                id: 4,
                name: 'Gansur Student',
                email: 'gansur123@gmail.com',
                password_hash: 'PLACEHOLDER_STUDENT',
                role: 'STUDENT',
                created_at: new Date()
            },
            {
                id: 5,
                name: 'Swastik Student',
                email: 'swastik@gmail.com',
                password_hash: 'PLACEHOLDER_STUDENT',
                role: 'STUDENT',
                created_at: new Date()
            }
        ];
        this.categories = [
            { id: 1, name: 'JavaScript', description: 'Modern JavaScript concepts, scoping, event loops, and asynchronous operations.' },
            { id: 2, name: 'Python', description: 'Python language structure, lists, OOP principles, and functional paradigms.' },
            { id: 3, name: 'Databases', description: 'Relational database structures, SQL query building, and transactions.' },
            { id: 4, name: 'Security', description: 'Web application security principles, hashing algorithms, and vulnerability mitigations.' },
            { id: 5, name: 'React', description: 'React design patterns, rendering lifecycles, and component state managers.' },
            { id: 6, name: 'Computer Science', description: 'Basic and advanced computer science data structures and sorting algorithms.' },
            { id: 7, name: 'Cloud Computing', description: 'Amazon Web Services (AWS) solutions architecture, instances, and storage buckets.' }
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
                max_attempts: 1,
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
                max_attempts: 1,
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
                max_attempts: 1,
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
                max_attempts: 1,
                negative_marks: 1.00,
                status: 'PUBLISHED',
                created_at: new Date()
            },
            {
                id: 5,
                title: 'React & Frontend Architecture',
                description: 'Verify your proficiency in modern single page React applications, state handlers, hooks, and Virtual DOM reconciliations.',
                category_id: 5,
                category_name: 'React',
                difficulty: 'INTERMEDIATE',
                duration_minutes: 15,
                passing_score: 70,
                max_attempts: 1,
                negative_marks: 0.25,
                status: 'PUBLISHED',
                created_at: new Date()
            },
            {
                id: 6,
                title: 'Data Structures & Algorithms',
                description: 'Evaluate your algorithm problem-solving abilities, covering stack structures, queues, trees, and algorithmic complexity.',
                category_id: 6,
                category_name: 'Computer Science',
                difficulty: 'HARD',
                duration_minutes: 30,
                passing_score: 75,
                max_attempts: 1,
                negative_marks: 0.50,
                status: 'PUBLISHED',
                created_at: new Date()
            },
            {
                id: 7,
                title: 'Cloud Computing & AWS',
                description: 'Accredit your knowledge in Amazon Web Services (AWS) deployment environments, scalable compute nodes, and object stores.',
                category_id: 7,
                category_name: 'Cloud Computing',
                difficulty: 'INTERMEDIATE',
                duration_minutes: 20,
                passing_score: 70,
                max_attempts: 1,
                negative_marks: 0.50,
                status: 'PUBLISHED',
                created_at: new Date()
            }
        ];

        this.questions = [];
        let optionIdCounter = 1;
        let questionIdCounter = 1;

        const templates = {
            1: [
                { text: "What is the evaluated output of 'typeof null' in JavaScript?", correct: "object", opts: ["object", "null", "undefined", "function"], exp: "typeof null returns 'object' due to legacy memory representation." },
                { text: "Which value is returned when evaluating '0.1 + 0.2 === 0.3' in standard JS?", correct: "false", opts: ["false", "true", "undefined", "TypeError"], exp: "Floating point precision yields 0.30000000000000004 != 0.3." }
            ],
            2: [
                { text: "Which keyword is used to define functions in Python?", correct: "def", opts: ["def", "function", "fn", "define"], exp: "'def' is the Python keyword for function declaration." },
                { text: "What is the output of len([1, 2, 3]) in Python?", correct: "3", opts: ["3", "4", "2", "Error"], exp: "len() returns the size of the list which is 3." }
            ],
            3: [
                { text: "What does ACID stand for in database transaction processing?", correct: "Atomicity, Consistency, Isolation, Durability", opts: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Index, Dependency", "Atomicity, Concurrency, Integrity, Durability", "Allocation, Consistency, Isolation, Database"], exp: "ACID represents Atomicity, Consistency, Isolation, Durability." },
                { text: "Which SQL command deletes a table structure permanently?", correct: "DROP TABLE", opts: ["DROP TABLE", "DELETE TABLE", "TRUNCATE TABLE", "REMOVE TABLE"], exp: "DROP TABLE removes both table structure and data." }
            ],
            4: [
                { text: "Which hashing algorithm is widely recommended for password hashing?", correct: "bcrypt", opts: ["bcrypt", "MD5", "SHA-1", "SHA-256"], exp: "bcrypt is slow and incorporates salts, protecting against brute force." },
                { text: "What secure flag prevents script access to cookies?", correct: "HttpOnly", opts: ["HttpOnly", "Secure", "SameSite", "Path"], exp: "HttpOnly prevents XSS cookie theft." }
            ],
            5: [
                { text: "Which React hook is used to perform side effects in functional components?", correct: "useEffect", opts: ["useEffect", "useState", "useContext", "useReducer"], exp: "useEffect runs side effects after render." },
                { text: "What is the virtual DOM in React?", correct: "A lightweight representation of the real DOM in memory", opts: ["A lightweight representation of the real DOM in memory", "A direct connection to the browser document", "A database store running inside index.js", "An styling engine replacing CSS files"], exp: "Virtual DOM syncs with the real DOM via reconciliation." }
            ],
            6: [
                { text: "What is the average time complexity of searching a value in a binary search tree?", correct: "O(log n)", opts: ["O(log n)", "O(n)", "O(1)", "O(n log n)"], exp: "Each step cuts search space in half." },
                { text: "Which data structure operates on a Last-In, First-Out (LIFO) model?", correct: "Stack", opts: ["Stack", "Queue", "Linked List", "Graph"], exp: "Stacks push/pop from the top." }
            ],
            7: [
                { text: "Which AWS service provides resizable compute capacity in the cloud?", correct: "EC2", opts: ["EC2", "S3", "RDS", "Lambda"], exp: "EC2 stands for Elastic Compute Cloud." },
                { text: "What is the primary usage of Amazon S3?", correct: "Object storage service for data and assets", opts: ["Object storage service for data and assets", "Relational database hosting", "DNS routing domain manager", "Direct virtual machine instances"], exp: "S3 stands for Simple Storage Service." }
            ]
        };

        this.quizzes.forEach(quiz => {
            const qTemplates = templates[quiz.id] || [
                { text: `Sample Question for ${quiz.title}`, correct: "Option A", opts: ["Option A", "Option B", "Option C", "Option D"], exp: "Sample explanation." }
            ];

            for (let i = 0; i < 20; i++) {
                const template = qTemplates[i % qTemplates.length];
                const qId = questionIdCounter++;
                const optsList = template.opts.map(text => {
                    return {
                        id: optionIdCounter++,
                        option_text: text,
                        is_correct: text === template.correct
                    };
                });
                
                this.questions.push({
                    id: qId,
                    quiz_id: quiz.id,
                    question_text: i >= qTemplates.length ? `${template.text} (Variant ${Math.floor(i / qTemplates.length) + 1})` : template.text,
                    marks: 5,
                    explanation: template.exp,
                    options: optsList
                });
            }
        });

        this.attempts = [];
        this.answers = [];
        this.nextId = 100;
    }

    async initHashes() {
        const adminHash   = await bcrypt.hash('AdminPassword123', 10);
        const studentHash = await bcrypt.hash('Password123', 10);
        // Apply correct hashes to all seeded users
        this.users.forEach(u => {
            if (u.role === 'ADMIN')   u.password_hash = adminHash;
            if (u.role === 'STUDENT') u.password_hash = studentHash;
        });
        console.log('✅ In-memory user password hashes initialized.');
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
            if (upper.includes('TOTAL_TAKEN') || upper.includes('AVG_SCORE')) {
                const students = this.users.filter(u => u.role === 'STUDENT');
                const rows = students.map(u => {
                    const userAtts = this.attempts.filter(a => String(a.user_id) === String(u.id) && a.status !== 'IN_PROGRESS');
                    const avg = userAtts.length > 0 ? Number((userAtts.reduce((sum, a) => sum + Number(a.percentage || 0), 0) / userAtts.length).toFixed(1)) : 0;
                    const max = userAtts.length > 0 ? Number((Math.max(...userAtts.map(a => Number(a.percentage || 0)))).toFixed(1)) : 0;
                    return {
                        id: u.id,
                        student_name: u.name,
                        total_taken: userAtts.length,
                        avg_score: avg,
                        highest_score: max
                    };
                });
                // Sort by avg_score DESC, total_taken DESC
                rows.sort((a, b) => b.avg_score - a.avg_score || b.total_taken - a.total_taken);
                return { rows: rows.slice(0, 10) };
            }
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
                // If query includes status filter (AND status = $2), check it
                if (quiz && params[1] && upper.includes('STATUS')) {
                    if (quiz.status !== params[1]) return { rows: [] };
                }
                return { rows: quiz ? [{ ...quiz, total_questions: this.questions.filter(qu => qu.quiz_id === quiz.id).length }] : [] };
            }
            // List all quizzes (optionally filter PUBLISHED only)
            let list = this.quizzes;
            if (upper.includes('PUBLISHED') || upper.includes('STATUS')) {
                list = list.filter(q => q.status === 'PUBLISHED');
            }
            return { rows: list.map(q => ({
                ...q,
                category_name: this.categories.find(c => c.id === q.category_id)?.name || 'General',
                total_questions: this.questions.filter(qu => qu.quiz_id === q.id).length || 5
            })) };
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

        // OPTIONS queries (used by submitAttempt to check correct answer)
        if (upper.includes('FROM OPTIONS')) {
            if (upper.includes('WHERE QUESTION_ID = $1')) {
                const qId = Number(params[0]);
                const question = this.questions.find(q => q.id === qId);
                let opts = question?.options || [];
                // Filter by is_correct if query includes IS_CORRECT
                if (upper.includes('IS_CORRECT')) {
                    opts = opts.filter(o => o.is_correct === true);
                }
                return { rows: opts };
            }
            if (upper.includes('WHERE ID = $1')) {
                const optId = Number(params[0]);
                for (const q of this.questions) {
                    const opt = (q.options || []).find(o => o.id === optId);
                    if (opt) return { rows: [opt] };
                }
                return { rows: [] };
            }
            return { rows: [] };
        }

        if (upper.startsWith('INSERT INTO OPTIONS')) {
            return { rows: [{ id: this.nextId++ }] };
        }

        // ATTEMPTS queries & LEADERBOARD
        if (upper.includes('FROM ATTEMPTS')) {
            // COUNT(*) with user_id + quiz_id + status filters
            if (upper.includes('COUNT(*)')) {
                let filtered = [...this.attempts];
                if (upper.includes('QUIZ_ID') && params[0] !== undefined) {
                    filtered = filtered.filter(a => String(a.quiz_id) === String(params[0]));
                }
                if (upper.includes('USER_ID') && params[1] !== undefined) {
                    filtered = filtered.filter(a => String(a.user_id) === String(params[1]));
                }
                if (upper.includes('STATUS') && params[2] !== undefined) {
                    filtered = filtered.filter(a => a.status !== params[2]);
                }
                return { rows: [{ count: filtered.length }] };
            }
            // Single attempt by ID (getAttemptById)
            if (upper.includes('WHERE A.ID = $1') || (upper.includes('WHERE ID = $1') && !upper.includes('QUIZ_ID'))) {
                const attId = Number(params[0]);
                const att = this.attempts.find(a => a.id === attId);
                if (!att) return { rows: [] };
                const quiz = this.quizzes.find(q => q.id === att.quiz_id) || this.quizzes[0];
                return { rows: [{ ...att, quiz_title: quiz?.title || 'Assessment', passing_score: quiz?.passing_score || 70, negative_marks: quiz?.negative_marks || 0 }] };
            }
            // Attempts filtered by user_id (getUserAttempts / history)
            if (upper.includes('WHERE A.USER_ID = $1') || (upper.includes('USER_ID') && !upper.includes('QUIZ_ID') && !upper.includes('COUNT'))) {
                const uid = Number(params[0]) || params[0];
                const userAttempts = this.attempts
                    .filter(a => String(a.user_id) === String(uid))
                    .map(a => {
                        const quiz = this.quizzes.find(q => q.id === a.quiz_id);
                        return { ...a, quiz_title: quiz?.title || 'Assessment' };
                    });
                return { rows: userAttempts };
            }
            // All attempts (leaderboard)
            return { rows: this.attempts.map(a => {
                const quiz = this.quizzes.find(q => q.id === a.quiz_id);
                return { ...a, quiz_title: quiz?.title || 'Assessment' };
            }) };
        }

        if (upper.startsWith('INSERT INTO ATTEMPTS')) {
            const now = new Date();
            const newAttempt = {
                id: this.nextId++,
                quiz_id: params[0],
                user_id: params[1],
                score: 0,
                percentage: 0,
                passed: false,
                status: 'IN_PROGRESS',
                started_at: now,
                expires_at: new Date(now.getTime() + 20 * 60000),
                created_at: now
            };
            this.attempts.push(newAttempt);
            return { rows: [newAttempt] };
        }

        if (upper.startsWith('UPDATE ATTEMPTS')) {
            // Check if this is a status-only update (cancel IN_PROGRESS)
            if (upper.includes("STATUS = 'FAILED'") && upper.includes('IN_PROGRESS')) {
                const quizId = params[0], userId = params[1];
                this.attempts.forEach(a => {
                    if (String(a.quiz_id) === String(quizId) && String(a.user_id) === String(userId) && a.status === 'IN_PROGRESS') {
                        a.status = 'FAILED';
                    }
                });
                return { rows: [] };
            }
            // Full score update
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

        // ANSWERS queries
        if (upper.startsWith('INSERT INTO ANSWERS')) {
            this.answers.push({ attempt_id: params[0], question_id: params[1], selected_option_id: params[2], is_correct: params[3] });
            return { rows: [] };
        }
        if (upper.includes('FROM ANSWERS')) {
            if (upper.includes('ATTEMPT_ID') && upper.includes('QUESTION_ID')) {
                const ans = this.answers.find(a => String(a.attempt_id) === String(params[0]) && String(a.question_id) === String(params[1]));
                return { rows: ans ? [ans] : [] };
            }
            return { rows: this.answers.filter(a => String(a.attempt_id) === String(params[0])) };
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
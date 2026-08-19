const express = require('express');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// IPv4 loopback resolution fix for Node on Windows
dns.setDefaultResultOrder('ipv4first');

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const quizRoutes = require('./routes/quizRoutes');
const questionRoutes = require('./routes/questionRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Explicit CORS: allow Vercel production frontend + localhost dev
// Do NOT use wildcard '*' — cookies/auth headers require explicit origins
const allowedOrigins = [
    'https://quizverse-quiz-platform-beo2.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    /\.vercel\.app$/  // also covers preview deployment URLs
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, Postman, Render health checks)
        if (!origin) return callback(null, true);
        const allowed = allowedOrigins.some(o =>
            typeof o === 'string' ? o === origin : o.test(origin)
        );
        if (allowed) return callback(null, true);
        return callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    credentials: true
}));
app.use(express.json());

// API Routes Mounted
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Health Check Route
app.get('/api/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.status(200).json({
            status: 'OK',
            message: 'Quizverse API is running',
            dbTime: result.rows[0].now,
        });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', error: error.message });
    }
});

// Global Express Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('💥 Unhandled Express Error:', err);
    res.status(500).json({
        status: 'ERROR',
        message: 'An unexpected internal server error occurred.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const bcrypt = require('bcryptjs');

async function initDatabase() {
    try {
        console.log('🔄 Running Database Schema Migrations...');
        await db.query("SET lock_timeout = '5s'");
        
        const migrations = [
            'ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS negative_marks DECIMAL(3,2) DEFAULT 0.50',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(10)',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP WITH TIME ZONE',
            'ALTER TABLE attempts ALTER COLUMN score TYPE DECIMAL(5,2)',
            'ALTER TABLE attempts ADD COLUMN IF NOT EXISTS negative_deductions DECIMAL(5,2) DEFAULT 0.00'
        ];

        for (const sql of migrations) {
            try {
                await db.query(sql);
            } catch (err) {
                console.warn(`⚠️ Migration statement failed: "${sql}". Error: ${err.message}`);
            }
        }
        
        console.log('✅ Database Schema Migrations Complete.');
        
        // Seed default admin
        await seedAdmin();

        // Seed 4 rich quizzes
        const seedRichQuizzes = require('./scripts/seedRichQuizzes');
        await seedRichQuizzes();

        // Seed 10-12 Student Leaderboard Entries if attempts count < 10
        const countAttempts = await db.query("SELECT COUNT(*)::int FROM attempts WHERE status != 'IN_PROGRESS'");
        if (countAttempts.rows[0].count < 10) {
            const seedLeaderboard = require('./scripts/seedLeaderboard');
            await seedLeaderboard();
        }
    } catch (err) {
        console.error('❌ Database Initialization Error:', err);
    }
}

async function seedAdmin() {
    const accounts = [
        { name: 'Admin Owner',   email: 'admin@quizverse.com',   password: 'AdminPassword123', role: 'ADMIN'   },
        { name: 'Demo Student',  email: 'student@quizverse.com', password: 'Password123',      role: 'STUDENT' },
        { name: 'Student One',   email: 'student@gmail.com',     password: 'Password123',      role: 'STUDENT' },
        { name: 'Gansur Student',email: 'gansur123@gmail.com',   password: 'Password123',      role: 'STUDENT' },
        { name: 'Swastik Student',email: 'swastik@gmail.com',   password: 'Password123',      role: 'STUDENT' },
    ];
    for (const acc of accounts) {
        try {
            const checkRes = await db.query('SELECT id FROM users WHERE email = $1', [acc.email]);
            if (checkRes.rows.length === 0) {
                const passwordHash = await bcrypt.hash(acc.password, 10);
                await db.query(
                    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
                    [acc.name, acc.email, passwordHash, acc.role]
                );
                console.log(`✅ Seeded account: ${acc.email} (${acc.role})`);
            } else {
                console.log(`ℹ️ Account already exists, skipping: ${acc.email}`);
            }
        } catch (err) {
            console.error(`❌ Error seeding account ${acc.email}:`, err.message);
        }
    }
}

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    
    // CRITICAL: Bind immediately so Express is ALWAYS online.
    // DB init runs async in background — a slow/failing DB must NEVER block the server from starting.
    // Bind on 0.0.0.0 so Render (and other cloud hosts) can reach the process.
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
        console.error('💥 HTTP Server error:', err.message);
    });

    // Run DB init async after server is already listening
    (async () => {
        try {
            await initDatabase();
        } catch (err) {
            console.error('❌ Background DB init failed (server still running):', err.message);
        }
    })();
}

module.exports = app;
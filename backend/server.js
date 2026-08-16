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

app.use(cors());
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
    try {
        const email = 'admin@quizverse.com';
        const checkRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkRes.rows.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('AdminPassword123', salt);
            await db.query(
                `INSERT INTO users (name, email, password_hash, role) 
                 VALUES ($1, $2, $3, $4)`,
                ['Admin Owner', email, passwordHash, 'ADMIN']
            );
            console.log('✅ Default Admin account seeded successfully: admin@quizverse.com / AdminPassword123');
        } else {
            console.log('ℹ️ Admin account already exists, skipping seed.');
        }
    } catch (err) {
        console.error('❌ Error seeding default admin:', err);
    }
}

app.listen(5000, async () => {
    console.log('Server running on http://localhost:5000');
    await initDatabase();
});
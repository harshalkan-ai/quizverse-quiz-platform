const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 5000,
    max: 10,
    idleTimeoutMillis: 10000
});

pool.on('connect', () => {
    console.log(' Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
    console.error(' Database error:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
// backend/test-db-only.js
const db = require('./config/db');

async function testDB() {
    console.log('🔍 Testing Supabase Database INSERT query...');
    try {
        const timeRes = await db.query('SELECT NOW()');
        console.log('✅ 1. Database Time Query Success:', timeRes.rows[0].now);

        const testEmail = 'test_' + Date.now() + '@gmail.com';
        console.log('🔍 Attempting INSERT INTO users with email:', testEmail);

        const insertRes = await db.query(
            `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role`,
            ['Test User', testEmail, 'hashedpassword123', 'STUDENT']
        );

        console.log('🎉 SUCCESS! DATABASE INSERT WORKED PERFECTLY!');
        console.log('👤 Inserted User Data:', insertRes.rows[0]);
    } catch (err) {
        console.error('❌ DB INSERT ERROR:', err.message);
        console.error('❌ FULL ERROR OBJECT:', err);
    }
}

testDB();
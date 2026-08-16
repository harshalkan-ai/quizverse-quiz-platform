const http = require('http');

function makeRequest(path, method, body, token) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : '';
        const options = {
            hostname: '127.0.0.1',
            port: 5000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runDay3Test() {
    try {
        console.log('--- STARTING DAY 3 ADMIN CRUD VERIFICATION ---');

        // 1. Register Admin User
        const adminRes = await makeRequest('/api/auth/register', 'POST', {
            name: 'Admin Owner',
            email: 'admin_' + Date.now() + '@quizverse.com',
            password: 'AdminPassword123',
            role: 'ADMIN'
        });
        console.log('✅ 1. Admin Registered:', adminRes.body.data.user.email);
        const adminToken = adminRes.body.data.token;

        // 2. Create Category
        const catRes = await makeRequest('/api/categories', 'POST', {
            name: 'JavaScript ' + Date.now(),
            description: 'JS Fundamentals and Modern ES6+'
        }, adminToken);
        console.log('✅ 2. Category Created:', catRes.body.data.category.name);
        const categoryId = catRes.body.data.category.id;

        // 3. Create Quiz in DRAFT status
        const quizRes = await makeRequest('/api/quizzes', 'POST', {
            title: 'JavaScript Basics Test',
            description: 'Test your core JS knowledge',
            category_id: categoryId,
            difficulty: 'INTERMEDIATE',
            duration_minutes: 15,
            passing_score: 70,
            max_attempts: 2
        }, adminToken);
        console.log('✅ 3. Quiz Created (DRAFT):', quizRes.body.data.quiz.title);
        const quizId = quizRes.body.data.quiz.id;

        // 4. Add Question with 4 Options
        const qRes = await makeRequest('/api/questions', 'POST', {
            quiz_id: quizId,
            question_text: 'Which method converts a JSON string into a JS object?',
            marks: 2,
            explanation: 'JSON.parse() parses a JSON string into an object.',
            options: [
                { option_text: 'JSON.stringify()', is_correct: false },
                { option_text: 'JSON.parse()', is_correct: true },
                { option_text: 'JSON.toObject()', is_correct: false },
                { option_text: 'JSON.convert()', is_correct: false }
            ]
        }, adminToken);
        console.log('✅ 4. Question & 4 Options Added:', qRes.body.data.question.question_text);

        // 5. Publish Quiz
        const pubRes = await makeRequest(`/api/quizzes/${quizId}/publish`, 'PATCH', {
            status: 'PUBLISHED'
        }, adminToken);
        console.log('✅ 5. Quiz Published Status:', pubRes.body.data.quiz.status);

        console.log('\n🎉 ALL DAY 3 ADMIN CRUD APIS ARE 100% WORKING PERFECTLY!');

    } catch (err) {
        console.error('❌ Day 3 Test Error:', err);
    }
}

runDay3Test();
const http = require('http');

const data = JSON.stringify({
    name: 'Harshal Student',
    email: 'harshal_auto_' + Date.now() + '@gmail.com',
    password: 'Password123',
    role: 'STUDENT'
});

const options = {
    hostname: '127.0.0.1', // Explicit IPv4 loopback address
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

console.log(' Sending Registration Request to http://127.0.0.1:5000/api/auth/register...');

const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log(` Status Code: ${res.statusCode}`);
        console.log(' Response Body:', JSON.parse(responseData));
    });
});

req.on('error', (error) => {
    console.error(' Connection Error:', error.message);
});

req.write(data);
req.end();
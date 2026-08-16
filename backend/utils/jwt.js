const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (userId, role) => {
    try {
        const secret = process.env.JWT_SECRET || 'quizverse_super_secret_jwt_key_2026';
        return jwt.sign({ id: userId, role: role }, secret, { expiresIn: '7d' });
    } catch (err) {
        console.error('JWT Signing Error:', err);
        return null;
    }
};

module.exports = { generateToken };
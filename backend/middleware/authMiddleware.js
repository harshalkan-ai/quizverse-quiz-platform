const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    try {
        // Read Authorization header (Expecting "Bearer <TOKEN>")
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'FAIL',
                message: 'Access Denied. No authentication token provided.'
            });
        }

        // Verify token using secret key
        const secret = process.env.JWT_SECRET || 'quizverse_super_secret_jwt_key_2026';
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // Attach decoded payload { id, role } to request object
        next();             // Pass control to the next middleware or controller
    } catch (err) {
        return res.status(403).json({
            status: 'FAIL',
            message: 'Invalid or expired token.'
        });
    }
};

module.exports = authenticateToken;
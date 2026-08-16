const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../utils/jwt');

// 1. REGISTER
async function register(req, res) {
    try {
        const { name, email, password, role, adminSecret } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ status: 'FAIL', message: 'Please provide name, email, and password.' });
        }

        if (role === 'ADMIN') {
            if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
                return res.status(403).json({ status: 'FAIL', message: 'Invalid Admin Security Passcode' });
            }
        }
        
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ status: 'FAIL', message: 'User already exists.' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const newUser = await db.query(
            `INSERT INTO users (name, email, password_hash, role) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, name, email, role`,
            [name, email, passwordHash, role || 'STUDENT']
        );
        
        const user = newUser.rows[0];
        const token = generateToken(user.id, user.role);
        
        return res.status(201).json({
            status: 'SUCCESS',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('REGISTER ERROR:', error);
        return res.status(500).json({ status: 'ERROR', message: 'Server error during registration.' });
    }
}

// 2. LOGIN
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: 'FAIL', message: 'Please provide email and password.' });
        }
        
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ status: 'FAIL', message: 'Invalid credentials.' });
        }
        
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ status: 'FAIL', message: 'Invalid credentials.' });
        }
        
        const token = generateToken(user.id, user.role);
        
        return res.status(200).json({
            status: 'SUCCESS',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        return res.status(500).json({ status: 'ERROR', message: 'Server error during login.' });
    }
}

// 3. GET ME
async function getMe(req, res) {
    try {
        const userId = req.user.id;
        const result = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'FAIL', message: 'User not found.' });
        }
        
        return res.status(200).json({
            status: 'SUCCESS',
            data: {
                user: result.rows[0]
            }
        });
    } catch (error) {
        console.error('GET ME ERROR:', error);
        return res.status(500).json({ status: 'ERROR', message: 'Server error.' });
    }
}

// 4. FORGOT PASSWORD
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: 'FAIL', message: 'Email is required.' });
        }

        const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ status: 'FAIL', message: 'User with this email does not exist.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await db.query(
            'UPDATE users SET reset_otp = $1, otp_expiry = $2 WHERE email = $3',
            [otp, otpExpiry, email]
        );

        console.log(`🔑 Reset OTP for ${email}: ${otp}`);

        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Password reset OTP generated successfully.',
            otp
        });
    } catch (error) {
        console.error('FORGOT PASSWORD ERROR:', error);
        return res.status(500).json({ status: 'ERROR', message: 'Server error during forgot password.' });
    }
}

// 5. RESET PASSWORD
async function resetPassword(req, res) {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ status: 'FAIL', message: 'Email, OTP, and newPassword are required.' });
        }

        const userRes = await db.query(
            'SELECT * FROM users WHERE email = $1 AND reset_otp = $2 AND otp_expiry > CURRENT_TIMESTAMP',
            [email, otp]
        );

        if (userRes.rows.length === 0) {
            return res.status(400).json({ status: 'FAIL', message: 'Invalid or expired OTP.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE users SET password_hash = $1, reset_otp = NULL, otp_expiry = NULL WHERE email = $2',
            [passwordHash, email]
        );

        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Password reset successful. You can now log in with your new password.'
        });
    } catch (error) {
        console.error('RESET PASSWORD ERROR:', error);
        return res.status(500).json({ status: 'ERROR', message: 'Server error during password reset.' });
    }
}

module.exports = {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword
};
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'Not authorized, no token' });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from token (excluding password)
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({ error: 'Not authorized, user not found' });
        }

        next(); // Continue to the next middleware/route
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { protect, generateToken };
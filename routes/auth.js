const express = require('express');
const User = require('../models/user');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (userExists) {
            return res.status(400).json({ 
                error: 'User already exists with this email or username' 
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: 'Invalid user data' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email });

        if (user && (await user.correctPassword(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ error: 'Invalid login data' });
    }
});

// Get user profile (protected)
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(400).json({ error: 'User not found' });
    }
});

module.exports = router;
const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { adminId: admin._id },
            process.env.JWT_SECRET || 'agrochain-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ valid: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agrochain-secret-key');
        const admin = await Admin.findById(decoded.adminId).select('-password');

        if (!admin) {
            return res.status(401).json({ valid: false });
        }

        res.json({ valid: true, admin });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

module.exports = router;

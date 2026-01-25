const express = require('express');
const Scheme = require('../models/Scheme');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all schemes (public)
router.get('/', async (req, res) => {
    try {
        const schemes = await Scheme.find().sort({ createdAt: -1 });
        res.json(schemes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single scheme (public)
router.get('/:id', async (req, res) => {
    try {
        const scheme = await Scheme.findById(req.params.id);
        if (!scheme) {
            return res.status(404).json({ message: 'Scheme not found' });
        }
        res.json(scheme);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create scheme (protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const scheme = new Scheme(req.body);
        await scheme.save();
        res.status(201).json(scheme);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update scheme (protected)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const scheme = await Scheme.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!scheme) {
            return res.status(404).json({ message: 'Scheme not found' });
        }
        res.json(scheme);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete scheme (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const scheme = await Scheme.findByIdAndDelete(req.params.id);
        if (!scheme) {
            return res.status(404).json({ message: 'Scheme not found' });
        }
        res.json({ message: 'Scheme deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

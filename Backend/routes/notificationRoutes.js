const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// We now apply 'protect' conditionally or simply check auth if present to handle both public and private views.
// To handle the distributor-specific filtering, we need to apply 'protect' to this route instead of leaving it fully public.
// Wait, if it's public for farmers, perhaps we check if the token exists? 
// The safest way is to create a specific endpoint for admins/distributors to view their own, OR apply a loose middleware.
// Let's modify the route to use 'try/catch' with optional auth by checking headers directly.
const jwt = require('jsonwebtoken');

// Public/Private Route: Get active notifications
router.get('/', async (req, res) => {
    try {
        let query = { expiresAt: { $gt: new Date() } };

        // Check if there's a bearer token to identify if it's a logged-in admin/distributor
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const Admin = require('../models/Admin'); // Lazy load to avoid circular dependency issues if any
                const adminUser = await Admin.findById(decoded.id).select('-password');

                if (adminUser && adminUser.city) {
                    // Limit notification scope to Global + City specific
                    query.$or = [
                        { city: adminUser.city },
                        { city: { $exists: false } },
                        { city: null }
                    ];
                }
            } catch (err) {
                // Invalid token, just proceed as public (or return error if strict)
            }
        }

        const notifications = await Notification.find(query).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Server error fetching notifications' });
    }
});

// Admin & Distributor Route: Create new notification
router.post('/', protect, authorize('admin', 'superadmin', 'distributor'), async (req, res) => {
    try {
        const { title, type, message, daysActive } = req.body;

        if (!title || !type || !message || !daysActive) {
            return res.status(400).json({ error: 'Please provide title, type, message, and daysActive' });
        }

        // Enforce distributor permission rules
        if (req.admin.role === 'distributor') {
            if (type !== 'distribution_date') {
                return res.status(403).json({ error: 'Distributors are only allowed to post "Distribution Date" notifications.' });
            }
        }

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(daysActive, 10));

        const notificationData = {
            title,
            type,
            message,
            expiresAt,
            createdBy: req.admin._id
        };

        // If the creator is bound to a city, bind the notification to that city
        if (req.admin.city) {
            notificationData.city = req.admin.city;
        }

        const newNotification = new Notification(notificationData);

        await newNotification.save();
        res.status(201).json({ message: 'Notification created successfully', notification: newNotification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Server error creating notification' });
    }
});

// Admin & Distributor Route: Delete a notification
router.delete('/:id', protect, authorize('admin', 'superadmin', 'distributor'), async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Only allow creators to delete their own, or superadmins/admins to delete any
        if (req.admin.role === 'distributor' && notification.createdBy?.toString() !== req.admin._id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this notification' });
        }

        await notification.deleteOne();

        res.json({ message: 'Notification removed successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Server error deleting notification' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    sendComplaintOTP,
    submitComplaint,
    getComplaints,
    resolveComplaint,
    getPublicComplaints
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

// Public Routes (Farmer)
router.post('/public/send-otp', sendComplaintOTP);
router.post('/public/submit', submitComplaint);
router.get('/public', getPublicComplaints);

// Protected Routes (Admin / Distributor)
router.use(protect);

// GET /api/complaints - fetch complaints (supports ?city= query)
router.get('/', getComplaints);

// PUT /api/complaints/:id/resolve - resolve a complaint
router.put('/:id/resolve', authorize('Distributor', 'SuperAdmin', 'StateAdmin'), resolveComplaint);

module.exports = router;

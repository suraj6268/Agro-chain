const Complaint = require('../models/Complaint');
const OTPLog = require('../models/OTPLog');
const crypto = require('crypto');

// Helper to generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Send OTP for Complaint Submission
// @route   POST /api/complaints/public/send-otp
// @access  Public
exports.sendComplaintOTP = async (req, res) => {
    try {
        const { mobile, farmerName } = req.body;

        if (!mobile || mobile.length !== 10) {
            return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number is required' });
        }

        const otp = generateOTP();

        // Save OTP to DB
        await OTPLog.create({
            otp,
            mobile,
            purpose: 'Complaint',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins expiry
        });

        // In production, integrate SMS API here. For dev, log it.
        console.log(`[DEV OTP] Complaint OTP for ${farmerName} (${mobile}): ${otp}`);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            devOtp: otp // Included for testing
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Verify OTP and Create Complaint
// @route   POST /api/complaints/public/submit
// @access  Public
exports.submitComplaint = async (req, res) => {
    try {
        const { farmerName, farmerId, mobile, type, description, city, otp } = req.body;

        if (!mobile || !otp || !farmerName || !farmerId || !type || !description || !city) {
            return res.status(400).json({ success: false, message: 'All top-level fields including OTP are required' });
        }

        // Check for existing active complaints for this farmer
        const activeComplaint = await Complaint.findOne({
            farmerId,
            status: { $in: ['Open', 'In Progress'] }
        });

        if (activeComplaint) {
            return res.status(400).json({ success: false, message: 'You already have an active complaint being processed.' });
        }

        // 1. Verify OTP
        const validOTP = await OTPLog.findOne({
            mobile,
            otp,
            purpose: 'Complaint',
            verified: false,
            expiresAt: { $gt: new Date() }
        });

        if (!validOTP) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // 2. Mark OTP as verified so it cannot be reused
        validOTP.verified = true;
        await validOTP.save();

        // 3. Create the Complaint
        const complaint = await Complaint.create({
            farmerName,
            farmerId,
            mobile,
            type,
            description,
            city,
            status: 'Open'
        });

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            data: complaint
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get complaints (filter by city if provided)
// @route   GET /api/complaints
// @access  Private (Admin/Distributor)
exports.getComplaints = async (req, res) => {
    try {
        let query = {};

        // Distributors should usually only fetch their own city
        if (req.query.city) {
            query.city = req.query.city;
        }

        const complaints = await Complaint.find(query)
            .sort({ createdAt: -1 }) // Newest first
            .populate('resolvedBy', 'name role');

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Resolve a complaint
// @route   PUT /api/complaints/:id/resolve
// @access  Private (Admin/Distributor)
exports.resolveComplaint = async (req, res) => {
    try {
        const { resolutionNote } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        // Enforce city scoping if user is just a Distributor
        if (req.admin.role === 'Distributor' && complaint.city !== req.admin.city) {
            return res.status(403).json({ success: false, message: 'You can only resolve complaints in your assigned city' });
        }

        complaint.status = 'Resolved';
        complaint.resolutionNote = resolutionNote || 'Resolved automatically by System';
        complaint.resolvedBy = req.admin._id;

        await complaint.save();

        res.status(200).json({
            success: true,
            message: 'Complaint resolved',
            data: complaint
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get public complaints (filter by city)
// @route   GET /api/complaints/public
// @access  Public
exports.getPublicComplaints = async (req, res) => {
    try {
        let query = {};

        if (req.query.city && req.query.city.trim() !== '') {
            query.city = req.query.city;
        }

        // Only fetch required fields to avoid leaking sensitive info like full mobile numbers
        // We'll return just enough for a public ledger
        const complaints = await Complaint.find(query)
            .sort({ createdAt: -1 })
            .select('createdAt farmerName city type description status resolutionNote resolvedBy')
            .populate('resolvedBy', 'name role')
            .limit(100); // Limit to top 100 recent complaints for performance

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

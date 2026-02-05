const Distribution = require('../models/Distribution');
const Stock = require('../models/Stock');
const OTPLog = require('../models/OTPLog');
const Product = require('../models/Product');

// Helper to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Initiate distribution (Send OTP)
// @route   POST /api/distribution/send-otp
// @access  Private/Distributor
exports.sendOTP = async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
        return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    try {
        const otp = generateOTP();

        // Save OTP to DB
        await OTPLog.create({
            mobile,
            otp,
            purpose: 'Distribution'
        });

        // In a real app, integrate SMS provider here.
        // For development, we send it in response or log it.
        console.log(`[DEV OTP] OTP for ${mobile}: ${otp}`);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            devOtp: otp // Included for ease of testing
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Verify OTP and Record Distribution & Deduct Stock
// @route   POST /api/distribution/verify
// @access  Private/Distributor
exports.verifyAndDistribute = async (req, res) => {
    const { mobile, otp, productId, quantity, farmerName } = req.body;

    try {
        // 1. Verify OTP
        const validOTP = await OTPLog.findOne({
            mobile,
            otp,
            purpose: 'Distribution',
            verified: false,
            expiresAt: { $gt: Date.now() }
        });

        if (!validOTP) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // 2. Check Stock availability
        const stock = await Stock.findOne({
            product: productId,
            city: req.user.city
        });

        if (!stock || stock.currentStock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock in your city' });
        }

        // 3. Mark OTP as verified (prevent reuse)
        validOTP.verified = true;
        await validOTP.save();

        // 4. Deduct Stock
        stock.currentStock -= Number(quantity);
        stock.distributed += Number(quantity);
        await stock.save();

        // 5. Create Distribution Record
        const distribution = await Distribution.create({
            distributor: req.user.id,
            product: productId,
            farmerName,
            farmerMobile: mobile,
            quantity,
            city: req.user.city,
            status: 'Completed',
            otpVerified: true
        });

        res.status(201).json({ success: true, data: distribution, message: 'Distribution recorded successfully' });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get distribution history (Distributor)
// @route   GET /api/distribution/my-history
// @access  Private/Distributor
exports.getMyHistory = async (req, res) => {
    try {
        const history = await Distribution.find({ distributor: req.user.id })
            .populate('product', 'name type')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

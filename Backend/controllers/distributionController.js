const Distribution = require('../models/Distribution');
const Stock = require('../models/Stock');
const OTPLog = require('../models/OTPLog');
const Product = require('../models/Product');
const Complaint = require('../models/Complaint');

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
    const { mobile, otp, farmerId, farmerName, distributions } = req.body;

    // User requested to add village and city as well in the Farmer form, but Distribution Schema has 'city', I will assume it uses distributor's city for now or add them later
    // The instructions say "add farmer id in formar detail input form and also add farmer village and city"
    // I will add them to the Distribution schema in the next step, for now I will expect them in the body
    const { village, city } = req.body;

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

        if (!distributions || distributions.length === 0) {
            return res.status(400).json({ success: false, message: 'No products selected for distribution' });
        }

        // 2. Pre-check loop for all items
        for (let item of distributions) {
            const product = await Product.findById(item.productId);
            if (!product || !['Seed', 'Fertilizer'].includes(product.type)) {
                return res.status(403).json({ success: false, message: `Product ${item.productId} is not authorized for distribution.` });
            }

            const stock = await Stock.findOne({
                product: item.productId,
                city: req.admin.city
            });

            if (!stock || stock.currentStock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for product ${product.name}` });
            }
        }

        // 3. Mark OTP as verified (prevent reuse)
        validOTP.verified = true;
        await validOTP.save();

        const createdDistributions = [];

        // 4. Stock-deduction loop & record creation
        for (let item of distributions) {
            const stock = await Stock.findOne({
                product: item.productId,
                city: req.admin.city
            });

            stock.currentStock -= Number(item.quantity);
            stock.distributed += Number(item.quantity);
            await stock.save();

            const distribution = await Distribution.create({
                distributor: req.admin.id,
                product: item.productId,
                farmerId,
                farmerName,
                farmerMobile: mobile,
                quantity: item.quantity,
                village: village || 'N/A', // Add this later to schema
                city: city || req.admin.city,
                status: 'Completed',
                otpVerified: true
            });

            createdDistributions.push(distribution);
        }

        res.status(201).json({ success: true, data: createdDistributions, message: 'Distributions recorded successfully' });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get distribution history (Distributor)
// @route   GET /api/distribution/my-history
// @access  Private/Distributor
exports.getMyHistory = async (req, res) => {
    try {
        const history = await Distribution.find({ distributor: req.admin.id })
            .populate('product', 'name type')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};


// @desc    Get top-level distribution statistics for public dashboard
// @route   GET /api/distribution/public/stats
// @access  Public
exports.getPublicStats = async (req, res) => {
    try {
        const stats = await Distribution.aggregate([
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: "$quantity" },
                    uniqueFarmers: { $addToSet: "$farmerId" }
                }
            }
        ]);

        // Find unique cities with available stock
        const citiesWithStock = await Stock.distinct('city', { currentStock: { $gt: 0 } });
        const validCitiesList = citiesWithStock.filter(c => c && c.trim() !== '');
        const validCitiesCount = validCitiesList.length;

        // Get total complaints raised
        const totalComplaints = await Complaint.countDocuments();

        if (stats.length === 0) {
            return res.status(200).json({ success: true, data: { citiesWithStock: validCitiesCount, activeCitiesList: validCitiesList, totalQuantity: 0, uniqueFarmers: 0, totalComplaints } });
        }

        const data = {
            citiesWithStock: validCitiesCount,
            activeCitiesList: validCitiesList,
            totalQuantity: stats[0].totalQuantity,
            uniqueFarmers: stats[0].uniqueFarmers.length,
            totalComplaints
        };

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get recent distribution ledger for public transparency
// @route   GET /api/distribution/public/ledger
// @access  Public
exports.getPublicLedger = async (req, res) => {
    try {
        const { city, village } = req.query;
        let query = {};

        if (city && city.trim() !== '') {
            query.city = { $regex: new RegExp(city.trim(), 'i') };
        }

        if (village && village.trim() !== '') {
            query.village = { $regex: new RegExp(village.trim(), 'i') };
        }

        // Limit to most recent 50 for performance and safety
        const ledger = await Distribution.find(query)
            .populate('product', 'name type')
            .sort({ createdAt: -1 })
            .limit(50)
            .select('-otpVerified -distributor'); // Exclude sensitive info

        res.status(200).json({ success: true, count: ledger.length, data: ledger });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Search distribution history by Farmer ID
// @route   GET /api/distribution/public/search/:farmerId
// @access  Public
exports.searchFarmerHistory = async (req, res) => {
    try {
        const history = await Distribution.find({ farmerId: req.params.farmerId })
            .populate('product', 'name type')
            .sort({ createdAt: -1 })
            .select('-distributor'); // Hide which specific distributor served them for privacy if needed

        const activeComplaint = await Complaint.findOne({
            farmerId: req.params.farmerId,
            status: { $in: ['Open', 'In Progress'] }
        });

        res.status(200).json({
            success: true,
            count: history.length,
            data: history,
            hasActiveComplaint: !!activeComplaint,
            activeComplaintStatus: activeComplaint ? activeComplaint.status : null
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get list of unique cities with distributions
// @route   GET /api/distribution/public/cities
// @access  Public
exports.getPublicCities = async (req, res) => {
    try {
        const cities = await Distribution.distinct('city');
        const validCities = cities.filter(c => c && c.trim() !== '').sort();
        res.status(200).json({ success: true, count: validCities.length, data: validCities });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get list of unique cities with allocations (from Stock)
// @route   GET /api/distribution/public/allocation-cities
// @access  Public
exports.getPublicAllocationCities = async (req, res) => {
    try {
        const cities = await Stock.distinct('city');
        const validCities = cities.filter(c => c && c.trim() !== '').sort();
        res.status(200).json({ success: true, count: validCities.length, data: validCities });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get high-level aggregated product supply metrics per city
// @route   GET /api/distribution/public/city-allocations
// @access  Public
exports.getCityAllocations = async (req, res) => {
    try {
        const { city, productType } = req.query;

        // Build the match stage conditionally
        const matchStage = {};
        if (city && city.trim() !== '') {
            matchStage.city = { $regex: new RegExp(city.trim(), 'i') };
        }
        if (productType && productType.trim() !== '') {
            matchStage['productDetails.type'] = productType; // Must match exactly like "Seed" or "Fertilizer"
        }

        const allocations = await Stock.aggregate([
            {
                // Join with Product collection to get the product type
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                // Deconstruct array from lookup
                $unwind: '$productDetails'
            },
            {
                // Filter by city and/or product type if requested
                $match: matchStage
            },
            {
                $group: {
                    _id: {
                        city: "$city",
                        productName: "$productDetails.name",
                        productType: "$productDetails.type"
                    },
                    totalAllocated: { $sum: "$totalAllocated" },
                    totalDistributed: { $sum: "$distributed" },
                    currentAvailable: { $sum: "$currentStock" },
                    lastUpdated: { $max: "$updatedAt" }
                }
            },
            {
                $project: {
                    _id: 0,
                    city: "$_id.city",
                    productName: "$_id.productName",
                    productType: "$_id.productType",
                    totalAllocated: 1,
                    totalDistributed: 1,
                    currentAvailable: 1,
                    lastUpdated: 1
                }
            },
            { $sort: { city: 1, productType: 1, productName: 1 } } // Sort alphabetically by city, then product type
        ]);

        // Filter out any entries where city is null or empty
        const cleanAllocations = allocations.filter(a => a.city && a.city.trim() !== '');

        res.status(200).json({
            success: true,
            count: cleanAllocations.length,
            data: cleanAllocations
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

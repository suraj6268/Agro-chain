const Stock = require('../models/Stock');
const Product = require('../models/Product');

// @desc    Get all stocks (Admin view - all cities)
// @route   GET /api/stock
// @access  Private/Admin
exports.getAllStock = async (req, res) => {
    try {
        const stocks = await Stock.find()
            .populate('product', 'name type brand')
            .sort({ city: 1 });
        res.status(200).json({ success: true, count: stocks.length, data: stocks });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get stock for my city (Distributor view)
// @route   GET /api/stock/my-city
// @access  Private/Distributor
exports.getMyCityStock = async (req, res) => {
    try {
        if (!req.user.city) {
            return res.status(400).json({ success: false, message: 'User does not have an assigned city' });
        }
        const stocks = await Stock.find({ city: req.user.city })
            .populate('product', 'name type brand unit pricePerUnit');
        res.status(200).json({ success: true, count: stocks.length, data: stocks });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Allocate stock to a city
// @route   POST /api/stock/allocate
// @access  Private/Admin
exports.allocateStock = async (req, res) => {
    const { productId, city, quantity } = req.body;

    try {
        let stock = await Stock.findOne({ product: productId, city });

        if (stock) {
            // Update existing allocation
            stock.totalAllocated += Number(quantity);
            stock.currentStock += Number(quantity);
            stock.lastUpdatedBy = req.user.id;
            await stock.save();
        } else {
            // Create new allocation
            stock = await Stock.create({
                product: productId,
                city,
                totalAllocated: quantity,
                currentStock: quantity,
                lastUpdatedBy: req.user.id
            });
        }

        const populatedStock = await Stock.findById(stock._id).populate('product', 'name');
        res.status(200).json({ success: true, data: populatedStock });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

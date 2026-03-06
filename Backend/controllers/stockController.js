const Stock = require('../models/Stock');
const Product = require('../models/Product');
const Distribution = require('../models/Distribution');

// @desc    Get all stocks (Admin view - all cities)
// @route   GET /api/stock
// @access  Private/Admin
exports.getAllStock = async (req, res) => {
    try {
        const stocks = await Stock.find()
            .populate('product', 'name type brand')
            .sort({ city: 1 });

        // Dynamic recalculation & self-healing
        const dynamicStocks = await Promise.all(stocks.map(async (stock) => {
            if (!stock.product) return stock; // Handle orphaned stock records where product was deleted
            const dists = await Distribution.find({
                product: stock.product._id,
                city: stock.city,
                status: 'Completed'
            });
            const actualDistributed = dists.reduce((sum, d) => sum + d.quantity, 0);

            if (stock.distributed !== actualDistributed || stock.currentStock !== (stock.totalAllocated - actualDistributed)) {
                stock.distributed = actualDistributed;
                stock.currentStock = stock.totalAllocated - actualDistributed;
                await stock.save();
            }
            return stock;
        }));

        res.status(200).json({ success: true, count: dynamicStocks.length, data: dynamicStocks });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get stock for my city (Distributor view)
// @route   GET /api/stock/my-city
// @access  Private/Distributor
exports.getMyCityStock = async (req, res) => {
    try {
        if (!req.admin.city) {
            return res.status(400).json({ success: false, message: 'User does not have an assigned city' });
        }
        const stocks = await Stock.find({ city: req.admin.city })
            .populate('product', 'name type brand unit pricePerUnit');

        // Dynamic recalculation & self-healing
        const dynamicStocks = await Promise.all(stocks.map(async (stock) => {
            if (!stock.product) return stock; // Handle orphaned stock records where product was deleted
            const dists = await Distribution.find({
                product: stock.product._id,
                city: stock.city,
                status: 'Completed'
            });
            const actualDistributed = dists.reduce((sum, d) => sum + d.quantity, 0);

            if (stock.distributed !== actualDistributed || stock.currentStock !== (stock.totalAllocated - actualDistributed)) {
                stock.distributed = actualDistributed;
                stock.currentStock = stock.totalAllocated - actualDistributed;
                await stock.save();
            }
            return stock;
        }));

        res.status(200).json({ success: true, count: dynamicStocks.length, data: dynamicStocks });
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
            stock.lastUpdatedBy = req.admin._id;
            await stock.save();
        } else {
            // Create new allocation
            stock = await Stock.create({
                product: productId,
                city,
                totalAllocated: quantity,
                currentStock: quantity,
                lastUpdatedBy: req.admin._id
            });
        }

        const populatedStock = await Stock.findById(stock._id).populate('product', 'name');
        res.status(200).json({ success: true, data: populatedStock });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Update allocated stock
// @route   PUT /api/stock/:id
// @access  Private/Admin
exports.updateStock = async (req, res) => {
    try {
        const { quantity } = req.body;
        let stock = await Stock.findById(req.params.id);

        if (!stock) {
            return res.status(404).json({ success: false, message: 'Stock allocation not found' });
        }

        // Only update currentStock and totalAllocated with the new value directly or adjust it
        // The simplest approach is overwriting totalAllocated and updating currentStock accordingly.
        const difference = Number(quantity) - stock.totalAllocated;
        stock.totalAllocated = Number(quantity);
        stock.currentStock += difference;
        stock.lastUpdatedBy = req.admin._id;

        if (stock.currentStock < 0) {
            return res.status(400).json({ success: false, message: 'Cannot set total allocated lower than already distributed amount' });
        }

        await stock.save();

        const populatedStock = await Stock.findById(stock._id).populate('product', 'name type brand');
        res.status(200).json({ success: true, data: populatedStock });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Delete stock allocation
// @route   DELETE /api/stock/:id
// @access  Private/Admin
exports.deleteStock = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);

        if (!stock) {
            return res.status(404).json({ success: false, message: 'Stock allocation not found' });
        }

        await stock.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

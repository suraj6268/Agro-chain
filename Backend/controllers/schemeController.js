const Scheme = require('../models/Scheme');

// @desc    Get all schemes with pagination, search and filters
// @route   GET /api/schemes
// @access  Public
const getSchemes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query
        let query = { isActive: true };

        // Search by keyword
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        // Filter by category
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }

        // Filter by state
        if (req.query.state && req.query.state !== 'All') {
            query.state = req.query.state;
        }

        // Filter by ministry
        if (req.query.ministry) {
            query.ministry = { $regex: req.query.ministry, $options: 'i' };
        }

        // Get total count
        const total = await Scheme.countDocuments(query);

        // Get schemes with sorting
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const schemes = await Scheme.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .select('-description -applicationProcess -documents'); // Exclude detailed fields for list view

        res.status(200).json({
            success: true,
            data: schemes,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalSchemes: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching schemes',
            error: error.message
        });
    }
};

// @desc    Get single scheme by ID
// @route   GET /api/schemes/:id
// @access  Public
const getSchemeById = async (req, res) => {
    try {
        const scheme = await Scheme.findById(req.params.id);

        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: 'Scheme not found'
            });
        }

        // Increment view count
        scheme.viewCount += 1;
        await scheme.save();

        res.status(200).json({
            success: true,
            data: scheme
        });
    } catch (error) {
        console.error('Error fetching scheme:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching scheme',
            error: error.message
        });
    }
};

// @desc    Get scheme categories with count
// @route   GET /api/schemes/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Scheme.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const formattedCategories = categories.map(cat => ({
            name: cat._id,
            count: cat.count
        }));

        res.status(200).json({
            success: true,
            data: formattedCategories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// @desc    Get scheme statistics
// @route   GET /api/schemes/stats
// @access  Public
const getSchemeStats = async (req, res) => {
    try {
        const totalSchemes = await Scheme.countDocuments({ isActive: true });

        const categoryStats = await Scheme.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const stateStats = await Scheme.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$state', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const mostViewed = await Scheme.find({ isActive: true })
            .sort({ viewCount: -1 })
            .limit(5)
            .select('name category viewCount');

        const recentlyAdded = await Scheme.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name category createdAt');

        res.status(200).json({
            success: true,
            data: {
                totalSchemes,
                categoryStats: categoryStats.map(cat => ({ name: cat._id, count: cat.count })),
                stateStats: stateStats.map(state => ({ name: state._id, count: state.count })),
                mostViewed,
                recentlyAdded
            }
        });
    } catch (error) {
        console.error('Error fetching scheme stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching scheme statistics',
            error: error.message
        });
    }
};

// @desc    Create new scheme (Admin only)
// @route   POST /api/schemes
// @access  Private/Admin
const createScheme = async (req, res) => {
    try {
        const scheme = await Scheme.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Scheme created successfully',
            data: scheme
        });
    } catch (error) {
        console.error('Error creating scheme:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating scheme',
            error: error.message
        });
    }
};

// @desc    Update scheme (Admin only)
// @route   PUT /api/schemes/:id
// @access  Private/Admin
const updateScheme = async (req, res) => {
    try {
        const scheme = await Scheme.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: 'Scheme not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Scheme updated successfully',
            data: scheme
        });
    } catch (error) {
        console.error('Error updating scheme:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating scheme',
            error: error.message
        });
    }
};

// @desc    Delete scheme (Admin only)
// @route   DELETE /api/schemes/:id
// @access  Private/Admin
const deleteScheme = async (req, res) => {
    try {
        const scheme = await Scheme.findById(req.params.id);

        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: 'Scheme not found'
            });
        }

        await scheme.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Scheme deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting scheme:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting scheme',
            error: error.message
        });
    }
};

// @desc    Toggle scheme active status (Admin only)
// @route   PATCH /api/schemes/:id/toggle
// @access  Private/Admin
const toggleSchemeStatus = async (req, res) => {
    try {
        const scheme = await Scheme.findById(req.params.id);

        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: 'Scheme not found'
            });
        }

        scheme.isActive = !scheme.isActive;
        await scheme.save();

        res.status(200).json({
            success: true,
            message: `Scheme ${scheme.isActive ? 'activated' : 'deactivated'} successfully`,
            data: scheme
        });
    } catch (error) {
        console.error('Error toggling scheme status:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling scheme status',
            error: error.message
        });
    }
};

// @desc    Get all schemes for admin (including inactive)
// @route   GET /api/schemes/admin/all
// @access  Private/Admin
const getAllSchemesAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = {};

        // Search by keyword
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { category: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (req.query.status === 'active') {
            query.isActive = true;
        } else if (req.query.status === 'inactive') {
            query.isActive = false;
        }

        // Filter by category
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }

        const total = await Scheme.countDocuments(query);

        const schemes = await Scheme.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: schemes,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalSchemes: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching all schemes for admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching schemes',
            error: error.message
        });
    }
};

module.exports = {
    getSchemes,
    getSchemeById,
    getCategories,
    getSchemeStats,
    createScheme,
    updateScheme,
    deleteScheme,
    toggleSchemeStatus,
    getAllSchemesAdmin
};

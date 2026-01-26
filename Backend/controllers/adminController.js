const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register new admin
// @route   POST /api/admin/register
// @access  Private/SuperAdmin
const registerAdmin = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this email or username already exists'
            });
        }

        const admin = await Admin.create({
            username,
            email,
            password,
            role: role || 'admin'
        });

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            data: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(400).json({
            success: false,
            message: 'Error registering admin',
            error: error.message
        });
    }
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for admin
        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Admin account is deactivated'
            });
        }

        // Check password
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate token
        const token = generateToken(admin._id);

        console.log("admin data" , admin , token)

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                token
            }
        });
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// @desc    Get current admin profile
// @route   GET /api/admin/profile
// @access  Private
const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id);

        res.status(200).json({
            success: true,
            data: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive,
                lastLogin: admin.lastLogin,
                createdAt: admin.createdAt
            }
        });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// @desc    Update admin password
// @route   PUT /api/admin/password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const admin = await Admin.findById(req.admin.id).select('+password');

        // Check current password
        const isMatch = await admin.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        admin.password = newPassword;
        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating password',
            error: error.message
        });
    }
};

// @desc    Get all admins (SuperAdmin only)
// @route   GET /api/admin/all
// @access  Private/SuperAdmin
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');

        res.status(200).json({
            success: true,
            count: admins.length,
            data: admins
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admins',
            error: error.message
        });
    }
};

// @desc    Toggle admin status (SuperAdmin only)
// @route   PATCH /api/admin/:id/toggle
// @access  Private/SuperAdmin
const toggleAdminStatus = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Prevent self-deactivation
        if (admin._id.toString() === req.admin.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate your own account'
            });
        }

        admin.isActive = !admin.isActive;
        await admin.save();

        res.status(200).json({
            success: true,
            message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
            data: admin
        });
    } catch (error) {
        console.error('Error toggling admin status:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling admin status',
            error: error.message
        });
    }
};

// @desc    Delete admin (SuperAdmin only)
// @route   DELETE /api/admin/:id
// @access  Private/SuperAdmin
const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Prevent self-deletion
        if (admin._id.toString() === req.admin.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        await admin.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting admin',
            error: error.message
        });
    }
};

// @desc    Create initial superadmin (only if no admins exist)
// @route   POST /api/admin/setup
// @access  Public (only works if no admins exist)
const setupSuperAdmin = async (req, res) => {
    try {
        // Check if any admin exists
        const adminCount = await Admin.countDocuments();

        if (adminCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Setup already completed. Admins already exist.'
            });
        }

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email, and password'
            });
        }

        const admin = await Admin.create({
            username,
            email,
            password,
            role: 'superadmin'
        });

        const token = generateToken(admin._id);

        res.status(201).json({
            success: true,
            message: 'Super admin created successfully',
            data: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                token
            }
        });
    } catch (error) {
        console.error('Error setting up super admin:', error);
        res.status(400).json({
            success: false,
            message: 'Error setting up super admin',
            error: error.message
        });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
    updatePassword,
    getAllAdmins,
    toggleAdminStatus,
    deleteAdmin,
    setupSuperAdmin
};

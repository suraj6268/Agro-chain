const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Simple auth middleware (for backwards compatibility)
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agrochain-secret-key');
        req.adminId = decoded.id || decoded.adminId;
        req.admin = await Admin.findById(req.adminId).select('-password');

        if (!req.admin) {
            return res.status(401).json({ success: false, message: 'Admin not found' });
        }

        if (!req.admin.isActive) {
            return res.status(401).json({ success: false, message: 'Admin account is deactivated' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Protect routes - alias for authMiddleware
const protect = authMiddleware;

// Authorize specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.admin.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

// Export both ways for compatibility
module.exports = authMiddleware;
module.exports.protect = protect;
module.exports.authorize = authorize;

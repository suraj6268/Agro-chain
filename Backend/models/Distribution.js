const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema({
    distributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // Distributors are users in the Admin collection with role='distributor'
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    farmerName: {
        type: String,
        required: [true, 'Farmer name is required'],
        trim: true
    },
    farmerMobile: {
        type: String,
        required: [true, 'Farmer mobile number is required'],
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    city: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    distributionDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Distribution', distributionSchema);

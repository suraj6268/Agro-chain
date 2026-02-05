const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    city: {
        type: String,
        required: [true, 'City is required for allocation'],
        trim: true
    },
    totalAllocated: {
        type: Number,
        default: 0
    },
    currentStock: {
        type: Number,
        default: 0
    },
    distributed: {
        type: Number,
        default: 0
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Compound index to ensure one stock record per product per city
stockSchema.index({ product: 1, city: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);

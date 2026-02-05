const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Product type is required'],
        enum: ['Fertilizer', 'Seed', 'Pesticide', 'Equipment'],
        default: 'Fertilizer'
    },
    brand: {
        type: String,
        required: [true, 'Brand name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    unit: {
        type: String,
        required: [true, 'Unit is required (e.g., kg, liter, packet)'],
        default: 'kg'
    },
    pricePerUnit: {
        type: Number,
        required: [true, 'Price per unit is required']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Scheme name is required'],
        trim: true,
        maxlength: [200, 'Scheme name cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        trim: true,
        maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    officialLink: {
        type: String,
        required: [true, 'Official link is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Subsidy',
            'Loan',
            'Insurance',
            'Training',
            'Equipment',
            'Irrigation',
            'Organic Farming',
            'Market Support',
            'Land Development',
            'Weather Protection',
            'Other'
        ],
        default: 'Other'
    },
    ministry: {
        type: String,
        required: [true, 'Ministry name is required'],
        trim: true
    },
    eligibility: {
        type: String,
        required: [true, 'Eligibility criteria is required'],
        trim: true
    },
    benefits: {
        type: String,
        required: [true, 'Benefits description is required'],
        trim: true
    },
    applicationProcess: {
        type: String,
        trim: true
    },
    documents: [{
        type: String,
        trim: true
    }],
    launchDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    imageUrl: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        enum: ['All India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
            'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
            'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
            'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
            'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
            'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Other'],
        default: 'All India'
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for search functionality
schemeSchema.index({ name: 'text', description: 'text', category: 'text', ministry: 'text' });

module.exports = mongoose.model('Scheme', schemeSchema);

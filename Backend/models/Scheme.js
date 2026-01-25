const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    benefit: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    eligibility: {
        type: String,
        required: true
    },
    howToApply: {
        type: String,
        required: true
    },
    features: [{
        type: String
    }],
    fullDescription: {
        type: String,
        default: ''
    },
    officialLink: {
        type: String,
        required: true
    },
    helpline: {
        type: String,
        default: ''
    },
    launchDate: {
        type: String,
        default: ''
    },
    ministry: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Scheme', schemeSchema);

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    farmerName: {
        type: String,
        required: [true, 'Farmer name is required'],
        trim: true
    },
    farmerId: {
        type: String,
        required: [true, 'Farmer ID is required'],
        trim: true
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    type: {
        type: String,
        required: true,
        enum: ['Under-distribution', 'Wrong Product', 'Overcharging', 'Misconduct', 'Other']
    },
    description: {
        type: String,
        required: [true, 'Complaint description is required']
    },
    city: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Rejected'],
        default: 'Open'
    },
    resolutionNote: {
        type: String
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);

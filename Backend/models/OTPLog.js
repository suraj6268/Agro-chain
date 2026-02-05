const mongoose = require('mongoose');

const otpLogSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['Distribution', 'Complaint', 'Login'],
        default: 'Distribution'
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(+new Date() + 5 * 60000) // 5 minutes validity
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('OTPLog', otpLogSchema);

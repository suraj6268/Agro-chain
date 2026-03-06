const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['info', 'warning', 'success', 'error', 'distribution_date'],
        default: 'info'
    },
    message: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false // Optional for older records, but will be set for new ones
    },
    city: {
        type: String,
        required: false // The city the notification belongs to
    }
});

// Create an index on expiresAt so MongoDB easily drops expired TTL documents...
// Actually, since users might want to see past ones in an admin panel, 
// we will just filter them out manually in the API instead of using TTL indexes.
// But we still index it for faster querying.
notificationSchema.index({ expiresAt: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

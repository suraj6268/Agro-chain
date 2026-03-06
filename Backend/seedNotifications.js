require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const connectDB = require('./config/db');

const seedNotifications = async () => {
    try {
        await connectDB();

        const notifications = [
            {
                title: 'PM Kisan Installment Release Notice',
                type: 'info',
                message: 'The next installment under the PM Kisan scheme has been released. Eligible farmers are advised to check their bank account status through the official portal.',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                createdAt: new Date()
            },
            {
                title: 'Urea Fertilizer Allocation Update',
                type: 'success',
                message: 'TARGET CITY: Bhopal - 8,500 kg of urea fertilizer has been allocated to Bhopal district. Distribution will begin from 5 March 2026. Farmers are requested to verify quantity during collection.',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
            },
            {
                title: 'Wheat Seed Allocation for Rabi Season',
                type: 'info',
                message: 'TARGET CITY: Indore - Government has allocated 12,000 kg of certified wheat seeds for the Rabi season in Indore district. Authorized distributors may begin distribution from 10 March 2026.',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
            },
            {
                title: 'Heavy Rainfall Alert: Coastal Regions',
                type: 'warning',
                message: 'Meteorological department predicts heavy to very heavy rainfall in coastal districts for the next 48 hours. Farmers are advised to postpone harvesting.',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
            },
            {
                title: 'System Maintenance Scheduled',
                type: 'error',
                message: 'Agro-chain portal will undergo scheduled maintenance this Sunday from 2:00 AM to 5:00 AM. Access may be temporarily interrupted.',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
            }
        ];

        await Notification.insertMany(notifications);
        console.log('Seed successful: Inserted 5 notifications.');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedNotifications();

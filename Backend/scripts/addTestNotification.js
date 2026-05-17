require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Notification = require('../models/Notification');

const seedNotifications = async () => {
    try {
        await connectDB();
        console.log('Connected to database to seed notifications...');

        const now = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(now.getDate() + 30); // Valid for 30 days

        const notifications = [
            {
                title: "New Subsidy Announced",
                type: "success",
                message: "Government has announced a new 20% subsidy on organic fertilizers for the upcoming Kharif season.",
                expiresAt
            },
            {
                title: "Low Inventory Alert",
                type: "warning",
                message: "Warehouse A in Bhopal is running low on DAP fertilizer. Only 15% stock remaining.",
                expiresAt
            },
            {
                title: "Monsoon Advisory",
                type: "info",
                message: "Early monsoon predicted in the central region. Farmers are advised to prepare for early sowing.",
                expiresAt
            },
            {
                title: "Delivery Failed",
                type: "error",
                message: "Seed delivery truck to Indore district broke down. Delivery delayed by 24 hours.",
                expiresAt
            },
            {
                title: "Training Workshop",
                type: "info",
                message: "A mandatory workshop on modern irrigation techniques will be held next Tuesday in Ujjain.",
                expiresAt
            },
            {
                title: "Market Price Update",
                type: "success",
                message: "Minimum Support Price (MSP) for Wheat has been increased by ₹150 per quintal.",
                expiresAt
            }
        ];

        await Notification.insertMany(notifications);
        console.log('Successfully seeded 5 notifications (one for each category)!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding notifications:', error);
        process.exit(1);
    }
};

seedNotifications();

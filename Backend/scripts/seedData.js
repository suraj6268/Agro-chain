require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');
const sampleSchemes = require('../data/sampleSchemes');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing schemes
        await Scheme.deleteMany({});
        console.log('Existing schemes cleared.');

        // Insert sample schemes
        const insertedSchemes = await Scheme.insertMany(sampleSchemes);
        console.log(`${insertedSchemes.length} schemes inserted successfully!`);

        // Create text index for search
        try {
            await Scheme.collection.createIndex({
                name: 'text',
                description: 'text',
                category: 'text',
                ministry: 'text'
            });
            console.log('Text index created for search functionality.');
        } catch (indexError) {
            console.log('Text index may already exist:', indexError.message);
        }

        console.log('\nSeeding completed successfully!');
        console.log('Sample schemes added:');
        insertedSchemes.forEach((scheme, index) => {
            console.log(`  ${index + 1}. ${scheme.name} (${scheme.category})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();

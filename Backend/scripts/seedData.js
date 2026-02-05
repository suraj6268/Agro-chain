require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const sampleSchemes = require('../data/sampleSchemes');

const sampleProducts = [
    { name: 'Urea Premium', type: 'Fertilizer', brand: 'IFFCO', unit: 'kg', pricePerUnit: 266 },
    { name: 'DAP Super', type: 'Fertilizer', brand: 'Coromandel', unit: 'kg', pricePerUnit: 1350 },
    { name: 'Wheat Seed 306', type: 'Seed', brand: 'National Seeds', unit: 'kg', pricePerUnit: 40 },
    { name: 'Paddy Basmati', type: 'Seed', brand: 'Kaveri', unit: 'kg', pricePerUnit: 85 }
];

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

        // Clear existing products & stock
        await Product.deleteMany({});
        await Stock.deleteMany({});

        // Insert sample products
        const insertedProducts = await Product.insertMany(sampleProducts);
        console.log(`${insertedProducts.length} products inserted successfully!`);

        // Create sample stock allocation for testing
        const stockSamples = [
            { product: insertedProducts[0]._id, city: 'Delhi', totalAllocated: 1000, currentStock: 1000 },
            { product: insertedProducts[1]._id, city: 'Delhi', totalAllocated: 500, currentStock: 500 },
            { product: insertedProducts[0]._id, city: 'Pune', totalAllocated: 2000, currentStock: 1500, distributed: 500 }
        ];
        await Stock.insertMany(stockSamples);
        console.log(`Sample stock allocated to Delhi and Pune.`);

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

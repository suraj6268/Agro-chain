require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const schemesRoutes = require('./routes/schemes');
const seedAdmin = require('./scripts/seedAdmin');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemesRoutes);

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'Agro-chain API is running' });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrochain')
    .then(async () => {
        console.log('Connected to MongoDB');

        // Seed default admin
        await seedAdmin();

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

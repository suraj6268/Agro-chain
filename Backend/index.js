require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');

// Import routes
const schemeRoutes = require('./routes/schemeRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Swagger UI setup with custom options
const swaggerUiOptions = {
    customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2e7d32 }
    .swagger-ui .scheme-container { background: #f5f5f5; padding: 15px }
  `,
    customSiteTitle: 'Agro-Chain API Documentation',
    customfavIcon: '/favicon.ico'
};

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Agro-chain API is running',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            schemes: '/api/schemes',
            admin: '/api/admin',
            swagger: '/api-docs',
            health: '/'
        }
    });
});

// API Routes
app.use('/api/schemes', schemeRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        documentation: '/api-docs'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    AGRO-CHAIN API SERVER                    ║
╠════════════════════════════════════════════════════════════╣
║  Server:        http://localhost:${PORT}                      ║
║  Environment:   ${(process.env.NODE_ENV || 'development').padEnd(40)}║
║  Swagger Docs:  http://localhost:${PORT}/api-docs             ║
╠════════════════════════════════════════════════════════════╣
║  Available Endpoints:                                       ║
║  • GET  /api/schemes          - List all schemes            ║
║  • GET  /api/schemes/:id      - Get scheme details          ║
║  • GET  /api/schemes/stats    - Get statistics              ║
║  • GET  /api/schemes/categories - Get categories            ║
║  • POST /api/admin/setup      - Initial admin setup         ║
║  • POST /api/admin/login      - Admin login                 ║
║  • GET  /api-docs             - Swagger Documentation       ║
╚════════════════════════════════════════════════════════════╝
  `);
});
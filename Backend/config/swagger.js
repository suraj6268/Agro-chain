const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Agro-Chain Government Schemes API',
            version: '1.0.0',
            description: `
## Overview
This API provides endpoints for managing government agricultural schemes for farmers in India.

### Features:
- 📋 **Browse Schemes**: View all available government schemes with search and filtering
- 🔍 **Search**: Full-text search across scheme names, descriptions, and categories
- 📊 **Statistics**: Get insights on scheme categories and usage
- 🔐 **Admin Panel**: Secure endpoints for managing schemes (add, update, delete)

### Authentication
Admin routes require JWT Bearer token authentication. Obtain a token via the login endpoint.
      `,
            contact: {
                name: 'Agro-Chain Support',
                email: 'support@agrochain.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        tags: [
            {
                name: 'Schemes',
                description: 'Public endpoints for browsing government schemes'
            },
            {
                name: 'Admin - Schemes',
                description: 'Protected endpoints for scheme management'
            },
            {
                name: 'Admin - Authentication',
                description: 'Admin authentication and management endpoints'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token obtained from login'
                }
            },
            schemas: {
                Scheme: {
                    type: 'object',
                    required: ['name', 'shortDescription', 'description', 'officialLink', 'category', 'ministry', 'eligibility', 'benefits'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Unique identifier',
                            example: '507f1f77bcf86cd799439011'
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the scheme',
                            example: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)'
                        },
                        shortDescription: {
                            type: 'string',
                            description: 'Brief description (max 300 chars)',
                            example: 'Income support scheme providing Rs. 6,000 per year to farmers'
                        },
                        description: {
                            type: 'string',
                            description: 'Detailed description of the scheme'
                        },
                        officialLink: {
                            type: 'string',
                            format: 'uri',
                            description: 'Official government website link',
                            example: 'https://pmkisan.gov.in/'
                        },
                        category: {
                            type: 'string',
                            enum: ['Subsidy', 'Loan', 'Insurance', 'Training', 'Equipment', 'Irrigation', 'Organic Farming', 'Market Support', 'Land Development', 'Weather Protection', 'Other'],
                            description: 'Type of scheme',
                            example: 'Subsidy'
                        },
                        ministry: {
                            type: 'string',
                            description: 'Government ministry responsible',
                            example: 'Ministry of Agriculture & Farmers Welfare'
                        },
                        eligibility: {
                            type: 'string',
                            description: 'Who can apply for this scheme'
                        },
                        benefits: {
                            type: 'string',
                            description: 'Benefits provided by the scheme'
                        },
                        applicationProcess: {
                            type: 'string',
                            description: 'How to apply for the scheme'
                        },
                        documents: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Required documents',
                            example: ['Aadhaar Card', 'Bank Account Details', 'Land Documents']
                        },
                        launchDate: {
                            type: 'string',
                            format: 'date',
                            description: 'When the scheme was launched'
                        },
                        state: {
                            type: 'string',
                            description: 'State coverage',
                            example: 'All India'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Whether scheme is currently active',
                            default: true
                        },
                        viewCount: {
                            type: 'integer',
                            description: 'Number of views',
                            default: 0
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                SchemeInput: {
                    type: 'object',
                    required: ['name', 'shortDescription', 'description', 'officialLink', 'category', 'ministry', 'eligibility', 'benefits'],
                    properties: {
                        name: {
                            type: 'string',
                            example: 'New Agriculture Scheme'
                        },
                        shortDescription: {
                            type: 'string',
                            example: 'Brief description of the new scheme'
                        },
                        description: {
                            type: 'string',
                            example: 'Detailed description of the scheme and its objectives'
                        },
                        officialLink: {
                            type: 'string',
                            format: 'uri',
                            example: 'https://example.gov.in/'
                        },
                        category: {
                            type: 'string',
                            enum: ['Subsidy', 'Loan', 'Insurance', 'Training', 'Equipment', 'Irrigation', 'Organic Farming', 'Market Support', 'Land Development', 'Weather Protection', 'Other']
                        },
                        ministry: {
                            type: 'string',
                            example: 'Ministry of Agriculture'
                        },
                        eligibility: {
                            type: 'string',
                            example: 'All farmers with valid land documents'
                        },
                        benefits: {
                            type: 'string',
                            example: 'Financial assistance up to Rs. 50,000'
                        },
                        applicationProcess: {
                            type: 'string'
                        },
                        documents: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        state: {
                            type: 'string',
                            default: 'All India'
                        }
                    }
                },
                Admin: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: {
                            type: 'string',
                            enum: ['admin', 'superadmin']
                        },
                        isActive: { type: 'boolean' },
                        lastLogin: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                AdminLogin: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'admin@agrochain.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'password123'
                        }
                    }
                },
                AdminSetup: {
                    type: 'object',
                    required: ['username', 'email', 'password'],
                    properties: {
                        username: {
                            type: 'string',
                            example: 'superadmin'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'admin@agrochain.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            minLength: 6,
                            example: 'securePassword123'
                        }
                    }
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        currentPage: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        totalSchemes: { type: 'integer' },
                        hasNextPage: { type: 'boolean' },
                        hasPrevPage: { type: 'boolean' }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        error: { type: 'string' }
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

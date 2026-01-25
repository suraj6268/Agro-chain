const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getSchemes,
    getSchemeById,
    getCategories,
    getSchemeStats,
    createScheme,
    updateScheme,
    deleteScheme,
    toggleSchemeStatus,
    getAllSchemesAdmin
} = require('../controllers/schemeController');

/**
 * @swagger
 * /api/schemes:
 *   get:
 *     summary: Get all active schemes
 *     description: Retrieve a paginated list of all active government schemes with optional search and filtering
 *     tags: [Schemes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of schemes per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword for full-text search
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [All, Subsidy, Loan, Insurance, Training, Equipment, Irrigation, Organic Farming, Market Support, Land Development, Weather Protection, Other]
 *         description: Filter by scheme category
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state (e.g., "All India", "Maharashtra")
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of schemes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Scheme'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getSchemes);

/**
 * @swagger
 * /api/schemes/categories:
 *   get:
 *     summary: Get all scheme categories with count
 *     description: Retrieve a list of all scheme categories along with the number of schemes in each category
 *     tags: [Schemes]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Subsidy
 *                       count:
 *                         type: integer
 *                         example: 5
 *       500:
 *         description: Server error
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/schemes/stats:
 *   get:
 *     summary: Get scheme statistics
 *     description: Retrieve comprehensive statistics about schemes including category breakdown, state distribution, most viewed, and recently added
 *     tags: [Schemes]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSchemes:
 *                       type: integer
 *                       example: 15
 *                     categoryStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     stateStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     mostViewed:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Scheme'
 *                     recentlyAdded:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Scheme'
 *       500:
 *         description: Server error
 */
router.get('/stats', getSchemeStats);

/**
 * @swagger
 * /api/schemes/admin/all:
 *   get:
 *     summary: Get all schemes (Admin)
 *     description: Retrieve all schemes including inactive ones. Requires admin authentication.
 *     tags: [Admin - Schemes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schemes retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/admin/all', protect, getAllSchemesAdmin);

/**
 * @swagger
 * /api/schemes/{id}:
 *   get:
 *     summary: Get scheme by ID
 *     description: Retrieve detailed information about a specific scheme. Increments view count.
 *     tags: [Schemes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scheme ID
 *     responses:
 *       200:
 *         description: Scheme details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Scheme'
 *       404:
 *         description: Scheme not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getSchemeById);

/**
 * @swagger
 * /api/schemes:
 *   post:
 *     summary: Create a new scheme
 *     description: Add a new government scheme to the database. Requires admin authentication.
 *     tags: [Admin - Schemes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchemeInput'
 *     responses:
 *       201:
 *         description: Scheme created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Scheme created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Scheme'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, createScheme);

/**
 * @swagger
 * /api/schemes/{id}:
 *   put:
 *     summary: Update a scheme
 *     description: Update an existing scheme's information. Requires admin authentication.
 *     tags: [Admin - Schemes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scheme ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchemeInput'
 *     responses:
 *       200:
 *         description: Scheme updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scheme not found
 */
router.put('/:id', protect, updateScheme);

/**
 * @swagger
 * /api/schemes/{id}:
 *   delete:
 *     summary: Delete a scheme
 *     description: Permanently delete a scheme from the database. Requires admin authentication.
 *     tags: [Admin - Schemes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scheme ID
 *     responses:
 *       200:
 *         description: Scheme deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Scheme deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scheme not found
 */
router.delete('/:id', protect, deleteScheme);

/**
 * @swagger
 * /api/schemes/{id}/toggle:
 *   patch:
 *     summary: Toggle scheme active status
 *     description: Activate or deactivate a scheme. Requires admin authentication.
 *     tags: [Admin - Schemes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scheme ID
 *     responses:
 *       200:
 *         description: Scheme status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Scheme activated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Scheme'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scheme not found
 */
router.patch('/:id/toggle', protect, toggleSchemeStatus);

module.exports = router;

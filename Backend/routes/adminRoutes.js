const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
    updatePassword,
    getAllAdmins,
    toggleAdminStatus,
    deleteAdmin,
    setupSuperAdmin
} = require('../controllers/adminController');

/**
 * @swagger
 * /api/admin/setup:
 *   post:
 *     summary: Initial super admin setup
 *     description: Create the first super admin account. This endpoint only works when no admins exist in the database.
 *     tags: [Admin - Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminSetup'
 *     responses:
 *       201:
 *         description: Super admin created successfully
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
 *                   example: Super admin created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: superadmin
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *       400:
 *         description: Setup already completed or validation error
 */
router.post('/setup', setupSuperAdmin);

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate an admin and receive a JWT token
 *     tags: [Admin - Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLogin'
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *       401:
 *         description: Invalid credentials or account deactivated
 */
router.post('/login', loginAdmin);

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     description: Retrieve the profile of the currently authenticated admin
 *     tags: [Admin - Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', protect, getAdminProfile);

/**
 * @swagger
 * /api/admin/password:
 *   put:
 *     summary: Update admin password
 *     description: Change the password for the currently authenticated admin
 *     tags: [Admin - Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is incorrect
 */
router.put('/password', protect, updatePassword);

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Register new admin
 *     description: Create a new admin account. Requires super admin authentication.
 *     tags: [Admin - Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [admin, superadmin]
 *                 default: admin
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Admin already exists or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin role required
 */
router.post('/register', protect, authorize('superadmin'), registerAdmin);

/**
 * @swagger
 * /api/admin/all:
 *   get:
 *     summary: Get all admins
 *     description: Retrieve a list of all admin accounts. Requires super admin authentication.
 *     tags: [Admin - Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin role required
 */
router.get('/all', protect, authorize('superadmin'), getAllAdmins);

/**
 * @swagger
 * /api/admin/{id}/toggle:
 *   patch:
 *     summary: Toggle admin status
 *     description: Activate or deactivate an admin account. Requires super admin authentication.
 *     tags: [Admin - Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin status toggled successfully
 *       400:
 *         description: Cannot deactivate your own account
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin role required
 *       404:
 *         description: Admin not found
 */
router.patch('/:id/toggle', protect, authorize('superadmin'), toggleAdminStatus);

/**
 * @swagger
 * /api/admin/{id}:
 *   delete:
 *     summary: Delete admin
 *     description: Permanently delete an admin account. Requires super admin authentication.
 *     tags: [Admin - Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       400:
 *         description: Cannot delete your own account
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin role required
 *       404:
 *         description: Admin not found
 */
router.delete('/:id', protect, authorize('superadmin'), deleteAdmin);

module.exports = router;

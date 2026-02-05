const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllStock,
    getMyCityStock,
    allocateStock
} = require('../controllers/stockController');

router.use(protect);

router.get('/', authorize('admin', 'superadmin'), getAllStock);
router.get('/my-city', authorize('distributor'), getMyCityStock);
router.post('/allocate', authorize('admin', 'superadmin'), allocateStock);

module.exports = router;

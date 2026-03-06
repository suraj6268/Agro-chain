const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllStock,
    getMyCityStock,
    allocateStock,
    updateStock,
    deleteStock
} = require('../controllers/stockController');

router.use(protect);

router.get('/', authorize('admin', 'superadmin'), getAllStock);
router.get('/my-city', authorize('distributor'), getMyCityStock);
router.post('/allocate', authorize('admin', 'superadmin'), allocateStock);

router.route('/:id')
    .put(authorize('admin', 'superadmin'), updateStock)
    .delete(authorize('admin', 'superadmin'), deleteStock);

module.exports = router;

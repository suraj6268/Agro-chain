const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    sendOTP,
    verifyAndDistribute,
    getMyHistory,
    getPublicStats,
    getPublicLedger,
    searchFarmerHistory,
    getPublicCities,
    getPublicAllocationCities,
    getCityAllocations
} = require('../controllers/distributionController');

// Public Routes (No authentication required)
router.get('/public/stats', getPublicStats);
router.get('/public/ledger', getPublicLedger);
router.get('/public/search/:farmerId', searchFarmerHistory);
router.get('/public/cities', getPublicCities);
router.get('/public/allocation-cities', getPublicAllocationCities);
router.get('/public/city-allocations', getCityAllocations);

router.use(protect);
router.use(authorize('distributor'));

router.post('/send-otp', sendOTP);
router.post('/verify', verifyAndDistribute);
router.get('/my-history', getMyHistory);

module.exports = router;

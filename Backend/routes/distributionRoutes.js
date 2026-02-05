const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    sendOTP,
    verifyAndDistribute,
    getMyHistory
} = require('../controllers/distributionController');

router.use(protect);
router.use(authorize('distributor'));

router.post('/send-otp', sendOTP);
router.post('/verify', verifyAndDistribute);
router.get('/my-history', getMyHistory);

module.exports = router;

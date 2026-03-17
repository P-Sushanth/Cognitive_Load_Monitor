const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const analyticsController = require('../controllers/analyticsController');

router.get('/daily', auth, analyticsController.getDailyLoad);
router.get('/history', auth, analyticsController.getDailyHistory);
router.get('/weekly', auth, analyticsController.getWeeklyLoad);
router.get('/overload', auth, analyticsController.checkOverload);

module.exports = router;

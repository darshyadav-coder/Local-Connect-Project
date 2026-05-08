const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentBookings,
  getRevenueAnalytics,
  getBookingTrends,
  getServicePerformance,
  getHealthCheck,
} = require('../controllers/adminController');

router.route('/stats').get(getDashboardStats);
router.route('/recent-bookings').get(getRecentBookings);
router.route('/revenue').get(getRevenueAnalytics);
router.route('/trends').get(getBookingTrends);
router.route('/service-performance').get(getServicePerformance);
router.route('/health').get(getHealthCheck);

module.exports = router;

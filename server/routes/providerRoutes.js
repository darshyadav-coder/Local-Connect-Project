const express = require('express');
const router = express.Router();
const {
  getProviderProfile,
  createProvider,
  updateProvider,
  getProviders,
  getProviderBookings,
  updateProviderStats,
  deleteProvider,
  approveProvider,
} = require('../controllers/providerController');

router.route('/').get(getProviders).post(createProvider);
router.route('/:id').get(getProviderProfile).put(updateProvider).delete(deleteProvider);
router.route('/:id/bookings').get(getProviderBookings);
router.route('/:id/stats').put(updateProviderStats);
router.route('/:id/approve').put(approveProvider);

module.exports = router;

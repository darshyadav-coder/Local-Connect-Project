const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookings,
  getBookingById,
  updateBookingStatus,
  assignProvider,
  addFeedback,
  cancelBooking,
  getBookingStats,
} = require('../controllers/bookingController');

router.route('/').post(createBooking).get(getBookings);
router.route('/mybookings').get(getMyBookings);
router.route('/stats/overview').get(getBookingStats);
router.route('/:id').get(getBookingById).delete(cancelBooking);
router.route('/:id/status').put(updateBookingStatus);
router.route('/:id/assign-provider').put(assignProvider);
router.route('/:id/feedback').put(addFeedback);

module.exports = router;

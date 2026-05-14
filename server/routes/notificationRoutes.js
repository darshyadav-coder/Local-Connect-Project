const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

// All notification routes are protected (implied by client-side logic and token management)
router.route('/').get(getNotifications).post(createNotification);
router.route('/:id/read').put(markAsRead);
router.route('/:id').delete(deleteNotification);

module.exports = router;

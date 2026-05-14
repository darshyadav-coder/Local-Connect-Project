const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getFeedback,
  getProviderFeedback,
  updateFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');

router.route('/').post(createFeedback).get(getFeedback);
router.route('/provider/:providerId').get(getProviderFeedback);
router.route('/:id').put(updateFeedback).delete(deleteFeedback);

module.exports = router;

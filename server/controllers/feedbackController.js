const Feedback = require('../models/Feedback');
const Provider = require('../models/Provider');

// @desc    Create feedback/rating
// @route   POST /api/feedback
// @access  Public
const createFeedback = async (req, res) => {
  try {
    const { booking, userEmail, rating, comment, providerId } = req.body;

    if (!booking || !userEmail || !rating) {
      return res.status(400).json({ 
        message: 'Booking ID, user email, and rating are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const feedback = new Feedback({
      booking,
      userEmail,
      rating,
      comment: comment || '',
      providerId: providerId || null,
    });

    const createdFeedback = await feedback.save();

    // Update provider rating if providerId is provided
    if (providerId) {
      const provider = await Provider.findById(providerId);
      if (provider) {
        const allFeedback = await Feedback.find({ providerId });
        const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
        provider.avgRating = parseFloat(avgRating.toFixed(2));
        provider.totalReviews = allFeedback.length;
        await provider.save();
      }
    }

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: createdFeedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback
// @access  Public
const getFeedback = async (req, res) => {
  try {
    const { providerId, sortBy } = req.query;
    let filter = {};

    if (providerId) filter.providerId = providerId;

    let query = Feedback.find(filter);

    if (sortBy === 'highest') {
      query = query.sort({ rating: -1 });
    } else if (sortBy === 'lowest') {
      query = query.sort({ rating: 1 });
    } else if (sortBy === 'latest') {
      query = query.sort({ createdAt: -1 });
    }

    const feedback = await query;

    res.json({
      count: feedback.length,
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feedback for specific provider
// @route   GET /api/feedback/provider/:providerId
// @access  Public
const getProviderFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ providerId: req.params.providerId })
      .sort({ createdAt: -1 });

    const avgRating = feedback.length > 0 
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(2)
      : 0;

    res.json({
      count: feedback.length,
      avgRating: parseFloat(avgRating),
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Public
const updateFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      feedback.rating = rating;
    }

    if (comment) feedback.comment = comment;

    const updatedFeedback = await feedback.save();

    res.json({
      message: 'Feedback updated successfully',
      feedback: updatedFeedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Public
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      message: 'Feedback deleted successfully',
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFeedback,
  getFeedback,
  getProviderFeedback,
  updateFeedback,
  deleteFeedback,
};

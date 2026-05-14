const Provider = require('../models/Provider');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get provider profile
// @route   GET /api/providers/:id
// @access  Public
const getProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('user', '-password -securityQuestion -securityAnswer');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create provider profile
// @route   POST /api/providers
// @access  Public
const createProvider = async (req, res) => {
  try {
    const { userId, servicesOffered, bio, experience } = req.body;

    if (!userId || !servicesOffered || !Array.isArray(servicesOffered) || servicesOffered.length === 0) {
      return res.status(400).json({ 
        message: 'User ID and services offered are required' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ user: userId });
    if (existingProvider) {
      return res.status(400).json({ message: 'Provider profile already exists for this user' });
    }

    const provider = new Provider({
      user: userId,
      servicesOffered,
      bio: bio || '',
      experience: experience || '',
    });

    const createdProvider = await provider.save();
    const populatedProvider = await createdProvider.populate('user', '-password -securityQuestion -securityAnswer');

    // Update user role to provider
    user.role = 'provider';
    await user.save();

    res.status(201).json({
      message: 'Provider profile created successfully',
      provider: populatedProvider,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update provider profile
// @route   PUT /api/providers/:id
// @access  Public
const updateProvider = async (req, res) => {
  try {
    const { servicesOffered, bio, experience, isActive } = req.body;

    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (servicesOffered && Array.isArray(servicesOffered)) provider.servicesOffered = servicesOffered;
    if (bio) provider.bio = bio;
    if (experience) provider.experience = experience;
    if (isActive !== undefined) provider.isActive = isActive;

    const updatedProvider = await provider.save();
    const populatedProvider = await updatedProvider.populate('user', '-password -securityQuestion -securityAnswer');

    res.json({
      message: 'Provider profile updated successfully',
      provider: populatedProvider,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
const getProviders = async (req, res) => {
  try {
    const { service, rating, sortBy, userId } = req.query;
    let filter = { isActive: true };

    if (service) {
      filter.servicesOffered = service;
    }

    if (userId) {
      filter.user = userId;
    }

    let query = Provider.find(filter).populate('user', '-password -securityQuestion -securityAnswer');

    if (sortBy === 'rating-high') {
      query = query.sort({ avgRating: -1 });
    } else if (sortBy === 'rating-low') {
      query = query.sort({ avgRating: 1 });
    } else if (sortBy === 'bookings-high') {
      query = query.sort({ totalBookings: -1 });
    } else if (sortBy === 'bookings-low') {
      query = query.sort({ totalBookings: 1 });
    }

    const providers = await query;

    res.json({
      count: providers.length,
      providers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get provider bookings
// @route   GET /api/providers/:id/bookings
// @access  Public
const getProviderBookings = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('user');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const bookings = await Booking.find({ provider: provider.user.fullname });

    res.json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update provider statistics
// @route   PUT /api/providers/:id/stats
// @access  Public
const updateProviderStats = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const bookings = await Booking.find({ provider: provider.user.fullname });

    provider.totalBookings = bookings.length;
    provider.completedBookings = bookings.filter(b => b.status === 'Completed').length;
    provider.cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;

    await provider.save();

    res.json({
      message: 'Provider statistics updated successfully',
      provider,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete provider (soft delete)
// @route   DELETE /api/providers/:id
// @access  Public
const deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    provider.isActive = false;
    await provider.save();

    res.json({
      message: 'Provider deactivated successfully',
      provider,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject provider (Admin)
// @route   PUT /api/providers/:id/approve
// @access  Public
const approveProvider = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    provider.isApproved = isApproved;
    await provider.save();

    res.json({
      message: `Provider ${isApproved ? 'Approved' : 'Rejected'} successfully`,
      provider,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProviderProfile,
  createProvider,
  updateProvider,
  getProviders,
  getProviderBookings,
  updateProviderStats,
  deleteProvider,
  approveProvider,
};

const Booking = require('../models/Booking');
const { validateBooking } = require('../utils/validators');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
  try {
    const errors = validateBooking(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') });
    }

    const {
      userEmail,
      userName,
      customerName,
      phone,
      service,
      price,
      type,
      date,
      paymentId,
      paymentStatus,
      paymentMethod,
      paymentTiming,
    } = req.body;

    const booking = new Booking({
      userEmail,
      userName,
      customerName,
      phone,
      service,
      price,
      type: type || 'normal',
      date,
      paymentId,
      paymentStatus: paymentStatus || 'Pending',
      paymentMethod: paymentMethod || 'Online',
      paymentTiming: paymentTiming || 'Upfront',
      status: 'Pending',
    });

    const createdBooking = await booking.save();
    
    // Send Confirmation Email (Safe)
    try {
      await sendEmail(
        userEmail,
        'Booking Confirmation - Local Connect',
        emailTemplates.bookingConfirmation(createdBooking)
      );
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: createdBooking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Public
const getMyBookings = async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.status(400).json({ message: 'Email query parameter is required' });
    }

    const bookings = await Booking.find({ userEmail }).sort({ createdAt: -1 });
    res.json({
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (for Admin)
// @route   GET /api/bookings
// @access  Public
const getBookings = async (req, res) => {
  try {
    const { status, service, provider, sortBy } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (service) filter.service = service;
    if (provider) filter.provider = provider;

    let query = Booking.find(filter);

    if (sortBy === 'latest') {
      query = query.sort({ createdAt: -1 });
    } else if (sortBy === 'oldest') {
      query = query.sort({ createdAt: 1 });
    } else if (sortBy === 'price-high') {
      query = query.sort({ price: -1 });
    } else if (sortBy === 'price-low') {
      query = query.sort({ price: 1 });
    }

    const bookings = await query;
    res.json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Public
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Public
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['Pending', 'Accepted', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Status must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      message: 'Booking status updated successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign provider to booking
// @route   PUT /api/bookings/:id/assign-provider
// @access  Public
const assignProvider = async (req, res) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({ message: 'Provider name is required' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { provider, status: 'Confirmed' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      message: 'Provider assigned successfully',
      booking,
    });

    // Send Assignment Email (Safe)
    try {
      await sendEmail(
        booking.userEmail,
        'Service Provider Assigned - Local Connect',
        emailTemplates.providerAssigned(booking)
      );
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking details
// @route   PUT /api/bookings/:id
// @access  Public
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add feedback to booking
// @route   PUT /api/bookings/:id/feedback
// @access  Public
const addFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;

    if (!feedback) {
      return res.status(400).json({ message: 'Feedback is required' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { feedback },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      message: 'Feedback added successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Public
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'Completed' || booking.status === 'Cancelled') {
      return res.status(400).json({ 
        message: `Cannot cancel a ${booking.status.toLowerCase()} booking` 
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking,
    });

    // Send Cancellation Email (Safe)
    try {
      await sendEmail(
        booking.userEmail,
        'Booking Cancellation - Local Connect',
        emailTemplates.bookingCancelled(booking)
      );
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats/overview
// @access  Public
const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

    const bookings = await Booking.find();
    const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.price || 0), 0);

    res.json({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookings,
  getBookingById,
  updateBookingStatus,
  assignProvider,
  addFeedback,
  cancelBooking,
  getBookingStats,
  updateBooking,
};

const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Contact = require('../models/Contact');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Public
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalBookings = await Booking.countDocuments();
    const totalServices = await Service.countDocuments({ isActive: true });

    const bookings = await Booking.find();
    const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.price || 0), 0);

    const statusBreakdown = {
      pending: await Booking.countDocuments({ status: 'Pending' }),
      confirmed: await Booking.countDocuments({ status: 'Confirmed' }),
      inProgress: await Booking.countDocuments({ status: 'In Progress' }),
      completed: await Booking.countDocuments({ status: 'Completed' }),
      cancelled: await Booking.countDocuments({ status: 'Cancelled' }),
    };

    const unreadContacts = await Contact.countDocuments({ status: 'new' });

    res.json({
      totalUsers,
      totalProviders,
      totalBookings,
      totalServices,
      totalRevenue,
      statusBreakdown,
      unreadContacts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent bookings
// @route   GET /api/admin/recent-bookings
// @access  Public
const getRecentBookings = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/admin/revenue
// @access  Public
const getRevenueAnalytics = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'Completed' });
    
    const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.price || 0), 0);
    
    const revenueByService = {};
    bookings.forEach(booking => {
      const service = booking.service;
      revenueByService[service] = (revenueByService[service] || 0) + parseFloat(booking.price || 0);
    });

    const revenueByType = {
      normal: bookings
        .filter(b => b.type === 'normal')
        .reduce((sum, b) => sum + parseFloat(b.price || 0), 0),
      emergency: bookings
        .filter(b => b.type === 'emergency')
        .reduce((sum, b) => sum + parseFloat(b.price || 0), 0),
    };

    res.json({
      totalRevenue,
      revenueByService,
      revenueByType,
      completedBookings: bookings.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking trends (by date)
// @route   GET /api/admin/trends
// @access  Public
const getBookingTrends = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    
    const trends = {};
    bookings.forEach(booking => {
      const dateStr = booking.date.split('T')[0]; // Get date part only
      trends[dateStr] = (trends[dateStr] || 0) + 1;
    });

    res.json({
      trends: Object.entries(trends)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get service performance
// @route   GET /api/admin/service-performance
// @access  Public
const getServicePerformance = async (req, res) => {
  try {
    const bookings = await Booking.find();
    
    const performance = {};
    bookings.forEach(booking => {
      const service = booking.service;
      if (!performance[service]) {
        performance[service] = {
          total: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0,
        };
      }
      performance[service].total += 1;
      performance[service].revenue += parseFloat(booking.price || 0);
      
      if (booking.status === 'Completed') {
        performance[service].completed += 1;
      } else if (booking.status === 'Cancelled') {
        performance[service].cancelled += 1;
      }
    });

    const result = Object.entries(performance).map(([service, data]) => ({
      service,
      ...data,
      completionRate: data.total > 0 ? ((data.completed / data.total) * 100).toFixed(2) : 0,
    }));

    res.json({
      count: result.length,
      performance: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system health check
// @route   GET /api/admin/health
// @access  Public
const getHealthCheck = async (req, res) => {
  try {
    const stats = {
      database: 'Connected',
      timestamp: new Date(),
      users: await User.countDocuments(),
      bookings: await Booking.countDocuments(),
      services: await Service.countDocuments(),
      contacts: await Contact.countDocuments(),
    };

    res.json({
      status: 'OK',
      stats,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentBookings,
  getRevenueAnalytics,
  getBookingTrends,
  getServicePerformance,
  getHealthCheck,
};

const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['normal', 'emergency'],
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'Pending',
  },
  provider: {
    type: String,
    default: 'Unassigned',
  },
  feedback: {
    type: String,
    default: null,
  },
  paymentId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    default: 'Pending',
  },
}, {
  timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;

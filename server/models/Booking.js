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
  serviceAddress: {
    type: String,
    required: true,
    default: 'Address not provided',
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
    rating: { type: String },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  invoice: {
    workScope: { type: String },
    workDescription: { type: String },
    basePrice: { type: String },
    additionalCharges: { type: String },
    totalAmount: { type: String },
    generatedAt: { type: Date, default: Date.now }
  },
  paymentId: {
    type: String,
  },
  razorpayOrderId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  paymentStatus: {
    type: String,
    default: 'Pending',
  },
  paymentMethod: {
    type: String,
    enum: ['Online', 'Cash'],
    default: 'Online',
  },
  paymentTiming: {
    type: String,
    enum: ['Upfront', 'After Service'],
    default: 'Upfront',
  },
  serviceOTP: {
    type: String,
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;

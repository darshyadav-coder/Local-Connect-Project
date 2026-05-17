const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_123',
  });
};

// @desc    Create a Razorpay Order
// @route   POST /api/payment/create-order
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ message: 'Booking ID and amount are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const razorpay = getRazorpayInstance();

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${bookingId}`.substring(0, 40),
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: 'Failed to create Razorpay order' });
    }

    // Save the order ID to the booking
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: error.message || 'Server error creating order' });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payment/verify
// @access  Public
const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingId 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ message: 'All payment details are required' });
    }

    // Creating the HMAC object using our razorpay secret key
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_123';
    
    // The signature algorithm as specified by Razorpay
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is successful, update the booking database
      const booking = await Booking.findById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      booking.paymentStatus = 'Paid';
      booking.paymentId = razorpay_payment_id;
      booking.razorpayOrderId = razorpay_order_id;
      booking.razorpaySignature = razorpay_signature;
      
      await booking.save();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid signature. Payment verification failed.',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: error.message || 'Server error verifying payment' });
  }
};

// @desc    Get Razorpay Key ID
// @route   GET /api/payment/key
// @access  Public
const getKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey123' });
};

module.exports = {
  createOrder,
  verifyPayment,
  getKey,
};

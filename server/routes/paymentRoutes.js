const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getKey } = require('../controllers/paymentController');

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/key', getKey);

module.exports = router;

/**
 * paymentService.js
 * 
 * This module is designed to cleanly bridge the frontend UI with the future backend.
 * Your backend developer friend should replace the `mockDelay` Promises below 
 * with actual `fetch()` calls to their backend endpoints.
 */

const PaymentService = {
  /**
   * Step 1: Create Order on the Backend
   * 
   * The frontend sends the booking details (like price) to the backend.
   * The backend should create an order (e.g. using Razorpay/Stripe API) and 
   * return the Order ID to the frontend.
   * 
   * @param {Object} bookingData - Details of the booking
   * @returns {Promise<Object>} - The backend response containing the Order ID
   */
  createOrder: async function (bookingData) {
    console.log("[PaymentService] Sending booking data to backend to create order...", bookingData);

    // BACKEND DEV: Replace this timeout with your actual fetch call:
    // return fetch('/api/payment/create-order', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(bookingData)
    // }).then(res => res.json());

    return new Promise((resolve) => {
      setTimeout(() => {
        // Fake response
        resolve({
          success: true,
          orderId: "order_mock_" + Math.random().toString(36).substr(2, 9),
          message: "Order created successfully on backend"
        });
      }, 1000);
    });
  },

  /**
   * Step 2: Verify Payment on the Backend
   * 
   * After the payment gateway UI finishes (or fails), send the payment payload 
   * to the backend to securely verify signatures. The backend will update the database
   * and respond with success.
   * 
   * @param {Object} paymentPayload - The response from the payment UI/Gateway
   * @returns {Promise<Object>} - The backend validation result
   */
  verifyPayment: async function (paymentPayload) {
    console.log("[PaymentService] Verifying payment signature on backend...", paymentPayload);

    // BACKEND DEV: Replace this timeout with your actual fetch call:
    // return fetch('/api/payment/verify', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(paymentPayload)
    // }).then(res => res.json());

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Fake response
        // To simulate a failure, you could randomly reject() or return success: false
        resolve({
          success: true,
          paymentId: "pay_verified_" + Math.random().toString(36).substr(2, 9),
          message: "Payment successfully verified."
        });
      }, 1500);
    });
  }
};

// Export for global usage across the project
window.PaymentService = PaymentService;

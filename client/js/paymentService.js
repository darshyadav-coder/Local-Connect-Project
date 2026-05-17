/**
 * paymentService.js
 * 
 * This module is designed to cleanly bridge the frontend UI with the future backend.
 * Your backend developer friend should replace the `mockDelay` Promises below 
 * with actual `fetch()` calls to their backend endpoints.
 */

const PaymentService = {
  getKey: async function () {
    try {
      const response = await fetch('http://localhost:5000/api/payment/key');
      const data = await response.json();
      return data.key;
    } catch (error) {
      console.error("[PaymentService] Error fetching Razorpay key:", error);
      return 'rzp_test_dummykey123';
    }
  },

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

    try {
      const response = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      return await response.json();
    } catch (error) {
      console.error("[PaymentService] Error creating order:", error);
      return { success: false, message: error.message };
    }
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

    try {
      const response = await fetch('http://localhost:5000/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
      });
      return await response.json();
    } catch (error) {
      console.error("[PaymentService] Error verifying payment:", error);
      return { success: false, message: error.message };
    }
  }
};

// Export for global usage across the project
window.PaymentService = PaymentService;

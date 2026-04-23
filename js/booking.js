/**
 * =========================================================================
 * VIVA DOCUMENTATION: BOOKING ENGINE
 * =========================================================================
 * This file contains the core business logic for booking a service.
 * 
 * Key Features for Viva Presentation:
 * 1. Dynamic Rendering: Services are loaded dynamically from `data.js`.
 * 2. State Passing: It retrieves the service user clicked on from `localStorage` ("selectedService").
 * 3. Form Validation: Real-time JS validation ensures valid dates, phone numbers, and names.
 * 4. Fake Delay: Uses setTimeout() to simulate backend network request times.
 * 5. Data Persistence: Saves the new booking object into the "allBookings" array in LocalStorage 
 *    with a default "Pending" status and "Unassigned" provider.
 */
// ==========================
// UTILITY FUNCTIONS
// ==========================
// Toast notification function for better UX than alerts
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "error" ? "var(--danger-color)" : "var(--accent-color)"};
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 1000;
        font-weight: bold;
    `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000); // Auto-remove after 3 seconds
}

// ==========================
// ELEMENTS
// ==========================
const normalBtn = document.getElementById("normal-booking-btn");
const emergencyBtn = document.getElementById("emergency-booking-btn");
const notice = document.getElementById("emergency-notice");
const form = document.getElementById("booking-form");

const nameInput = document.getElementById("name-input");
const phoneInput = document.getElementById("phone-input");
const dateInput = document.getElementById("booking-date");

const nameError = document.getElementById("name-error");
const phoneError = document.getElementById("phone-error");
const dateError = document.getElementById("date-error");

const priceDisplay = document.getElementById("price-display");
const extraChargeText = document.getElementById("extra-charge");
const selectedServiceText = document.getElementById("selected-service");

// ==========================
// REAL-TIME VALIDATION
// ==========================
// Add event listeners for real-time feedback instead of only on submit
nameInput.addEventListener("input", () => {
  const name = nameInput.value.trim();
  if (name.length < 3) {
    nameError.textContent = "Name must be at least 3 characters";
    nameError.style.display = "block";
  } else {
    nameError.style.display = "none";
  }
});

phoneInput.addEventListener("input", () => {
  const phone = phoneInput.value.trim();
  if (!/^[6-9]\d{9}$/.test(phone)) {
    // Indian phone number validation
    phoneError.textContent =
      "Enter valid 10-digit phone number starting with 6-9";
    phoneError.style.display = "block";
  } else {
    phoneError.style.display = "none";
  }
});

dateInput.addEventListener("input", () => {
  const date = dateInput.value;
  const today = new Date().toISOString().split("T")[0];
  if (!date || date < today) {
    dateError.textContent = "Select a valid future date";
    dateError.style.display = "block";
  } else {
    dateError.style.display = "none";
  }
});

// ==========================
// GET SELECTED SERVICE
// ==========================
let selectedService = JSON.parse(localStorage.getItem("selectedService"));

// Clear the refresh flag after using it
sessionStorage.removeItem("serviceRefresh");

let basePrice = 0;

// show selected service
if (selectedService) {
  const serviceDisplay = document.getElementById("selected-service-display");
  const serviceName = document.getElementById("service-name");
  const serviceIcon = document.getElementById("service-icon");

  // Find the service category to get the icon
  const parentService = servicesData.find((s) =>
    s.subServices.some((sub) => sub.id === selectedService.id),
  );

  serviceName.textContent = selectedService.name;
  if (parentService) {
    serviceIcon.className = `fa-solid ${parentService.icon}`;
  }

  serviceDisplay.style.display = "block";
  document.getElementById("service-selection").style.display = "none";

  // Set basePrice from selected service
  basePrice = selectedService.price;

  // Add change service functionality
  const changeBtn = document.getElementById("change-service-btn");
  changeBtn.addEventListener("click", () => {
    selectedService = null;
    document.getElementById("selected-service-display").style.display = "none";
    document.getElementById("service-selection").style.display = "block";
    loadServiceSelection();
    basePrice = 0;
    updatePrice();
  });

  // Add hover effects
  changeBtn.addEventListener("mouseover", () => {
    changeBtn.style.background = "var(--primary-hover)";
    changeBtn.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
    changeBtn.style.transform = "translateY(-2px)";
  });

  changeBtn.addEventListener("mouseleave", () => {
    changeBtn.style.background = "var(--primary-color)";
    changeBtn.style.boxShadow = "none";
    changeBtn.style.transform = "translateY(0)";
  });
} else {
  document.getElementById("selected-service-display").style.display = "none";
  document.getElementById("service-selection").style.display = "block";
  loadServiceSelection();
}

// ==========================
// SERVICE SELECTION FUNCTION
// ==========================
function loadServiceSelection() {
  const serviceGrid = document.getElementById("service-grid");
  serviceGrid.innerHTML = "";

  servicesData.forEach((service) => {
    const serviceCard = document.createElement("div");
    serviceCard.className = "service-card";
    serviceCard.style.cssText = `
            cursor: pointer; 
            padding: 20px; 
            border: 2px solid #e2e8f0;
            border-radius: 12px; 
            text-align: center; 
            transition: all 0.3s ease;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        `;
    serviceCard.innerHTML = `
            <i class="fa-solid ${service.icon}" style="font-size: 36px; color: var(--primary-color);"></i>
            <h4 style="margin: 0; color: var(--text-dark); font-size: 16px; font-weight: 600;">${service.name}</h4>
            <p style="margin: 0; color: var(--text-muted); font-size: 13px;">${service.description}</p>
        `;

    serviceCard.addEventListener("mouseover", () => {
      serviceCard.style.border = "2px solid var(--primary-color)";
      serviceCard.style.boxShadow = "0 8px 20px rgba(37, 99, 235, 0.15)";
      serviceCard.style.transform = "translateY(-4px)";
    });

    serviceCard.addEventListener("mouseleave", () => {
      serviceCard.style.border = "2px solid #e2e8f0";
      serviceCard.style.boxShadow = "none";
      serviceCard.style.transform = "translateY(0)";
    });

    serviceCard.addEventListener("click", () => {
      selectedService = {
        id: service.id,
        name: service.name,
        price: 0, // Will be set when sub-service is selected
      };

      // Show sub-services for selection
      showSubServiceSelection(service);
    });

    serviceGrid.appendChild(serviceCard);
  });
}

function showSubServiceSelection(service) {
  const serviceGrid = document.getElementById("service-grid");
  serviceGrid.innerHTML = `
        <h4 style="grid-column: 1 / -1; text-align: center; color: var(--text-dark); margin-bottom: 20px; font-size: 18px; font-weight: 600;">
            <i class="fa-solid ${service.icon}" style="color: var(--primary-color); margin-right: 8px;"></i>
            ${service.name} Services
        </h4>
    `;

  service.subServices.forEach((sub) => {
    const subServiceCard = document.createElement("div");
    subServiceCard.className = "service-card";
    subServiceCard.style.cssText = `
            cursor: pointer; 
            padding: 20px; 
            border: 2px solid #e2e8f0;
            border-radius: 12px; 
            text-align: center; 
            transition: all 0.3s ease;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        `;
    subServiceCard.innerHTML = `
            <i class="fa-solid ${service.icon}" style="font-size: 32px; color: var(--primary-color);"></i>
            <h5 style="margin: 0; color: var(--text-dark); font-size: 15px; font-weight: 600;">${sub.name}</h5>
            <p style="margin: 0; color: var(--text-muted); font-size: 13px;">Starting from</p>
            <p style="margin: 0; color: var(--accent-color); font-size: 18px; font-weight: 700;">₹${sub.price}</p>
        `;

    subServiceCard.addEventListener("mouseover", () => {
      subServiceCard.style.border = "2px solid var(--accent-color)";
      subServiceCard.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.15)";
      subServiceCard.style.transform = "translateY(-4px)";
      subServiceCard.style.background = "rgba(16, 185, 129, 0.04)";
    });

    subServiceCard.addEventListener("mouseleave", () => {
      subServiceCard.style.border = "2px solid #e2e8f0";
      subServiceCard.style.boxShadow = "none";
      subServiceCard.style.transform = "translateY(0)";
      subServiceCard.style.background = "white";
    });

    subServiceCard.addEventListener("click", () => {
      selectedService = sub;

      // Update display
      const serviceDisplay = document.getElementById(
        "selected-service-display",
      );
      const serviceName = document.getElementById("service-name");
      const serviceIcon = document.getElementById("service-icon");

      serviceName.textContent = selectedService.name;
      serviceIcon.className = `fa-solid ${service.icon}`;
      serviceDisplay.style.display = "block";

      document.getElementById("service-selection").style.display = "none";
      basePrice = selectedService.price;
      updatePrice();

      // Highlight selected service
      subServiceCard.style.borderColor = "var(--accent-color)";
      subServiceCard.style.background = "rgba(16, 185, 129, 0.08)";
    });

    serviceGrid.appendChild(subServiceCard);
  });

  // Add back button
  const backButton = document.createElement("button");
  backButton.className = "btn";
  backButton.type = "button";
  backButton.style.cssText =
    "grid-column: 1 / -1; margin-top: 20px; background: var(--text-muted); font-weight: 600; transition: all 0.3s ease;";
  backButton.textContent = "← Back to Categories";

  backButton.addEventListener("mouseover", () => {
    backButton.style.background = "var(--primary-color)";
  });

  backButton.addEventListener("mouseleave", () => {
    backButton.style.background = "var(--text-muted)";
  });

  backButton.addEventListener("click", (e) => {
    e.preventDefault();
    loadServiceSelection();
  });

  serviceGrid.appendChild(backButton);
}
let bookingType = localStorage.getItem("bookingType");
const bookingRefresh = sessionStorage.getItem("bookingRefresh");

// Only use stored booking type if this is a direct flow from main page buttons
// Direct navigation to booking page defaults to normal
if (!bookingRefresh) {
  localStorage.removeItem("bookingType");
  bookingType = "normal";
}

// Clear the refresh flag after using it
sessionStorage.removeItem("bookingRefresh");

// Initialize UI based on stored booking type
if (bookingType === "emergency") {
  emergencyBtn.classList.add("active");
  normalBtn.classList.remove("active");
  document.getElementById("toggle-slider").classList.add("move");
} else {
  normalBtn.classList.add("active");
  emergencyBtn.classList.remove("active");
  document.getElementById("toggle-slider").classList.remove("move");
}

// Initialize price display
updatePrice();

// ==========================
// UPDATE PRICE
// ==========================
function updatePrice() {
  let total = basePrice;

  if (bookingType === "emergency") {
    total += 200;
    notice.style.display = "block";
    extraChargeText.style.display = "block";
  } else {
    notice.style.display = "none";
    extraChargeText.style.display = "none";
  }

  priceDisplay.innerText = "₹" + total;
}

// ==========================
// TOGGLE BUTTONS
// ==========================
normalBtn.addEventListener("click", () => {
  bookingType = "normal";

  normalBtn.classList.add("active");
  emergencyBtn.classList.remove("active");

  // Add slide animation for toggle
  const slider = document.getElementById("toggle-slider");
  slider.classList.remove("move");

  updatePrice();
});

emergencyBtn.addEventListener("click", () => {
  bookingType = "emergency";

  emergencyBtn.classList.add("active");
  normalBtn.classList.remove("active");

  // Add slide animation for toggle
  const slider = document.getElementById("toggle-slider");
  slider.classList.add("move");

  updatePrice();
});

// ==========================
// DATE VALIDATION
// ==========================
let today = new Date().toISOString().split("T")[0];
dateInput.setAttribute("min", today);

// ==========================
// FORM VALIDATION
// ==========================
function validateForm() {
  let name = nameInput.value.trim();
  let phone = phoneInput.value.trim();
  let date = dateInput.value;

  if (name.length < 3) {
    showToast("Name must be at least 3 characters", "error");
    nameInput.focus();
    return false;
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    showToast("Enter valid 10-digit phone number starting with 6-9", "error");
    phoneInput.focus();
    return false;
  }

  if (!date || date < new Date().toISOString().split("T")[0]) {
    showToast("Select a valid future date", "error");
    dateInput.focus();
    return false;
  }

  if (!selectedService) {
    showToast("No service selected", "error");
    return false;
  }

  return true;
}

// ==========================
// FORM SUBMIT -> MOVE TO CHECKOUT UI
// ==========================
let currentBookingData = null;

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  // Viva Check: Ensure user is logged in
  let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) {
    showToast("You must log in first to make a booking!", "error");
    window.location.href = "login.html";
    return;
  }

  // Pre-calculate parameters
  let totalPrice = priceDisplay.innerText;
  let numericPrice = parseInt(totalPrice.replace("₹", ""));

  currentBookingData = {
    userEmail: loggedInUser.email,
    userName: loggedInUser.fullname || loggedInUser.email.split("@")[0],
    customerName: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    service: selectedService.name,
    price: totalPrice,
    numericPrice: numericPrice,
    type: bookingType,
    date: dateInput.value,
  };

  // Switch UI gracefully
  form.style.display = "none";
  document.getElementById("checkout-section").style.display = "block";

  // Populate Order Summary
  document.getElementById("summary-service").textContent = currentBookingData.service;
  document.getElementById("summary-customer").textContent = currentBookingData.customerName;
  document.getElementById("summary-date").textContent = currentBookingData.date;
  document.getElementById("summary-price").textContent = currentBookingData.price;
  document.getElementById("pay-now-text").textContent = `Pay ${currentBookingData.price}`;
});

// ==========================
// CHECKOUT / PAYMENT HANDLING
// ==========================
const payNowBtn = document.getElementById("pay-now-btn");
const cancelCheckoutBtn = document.getElementById("cancel-checkout-btn");
const paymentMessage = document.getElementById("payment-status-message");

// Cancel order and return back to form
cancelCheckoutBtn.addEventListener("click", () => {
  document.getElementById("checkout-section").style.display = "none";
  form.style.display = "block";
  currentBookingData = null;
  paymentMessage.style.display = "none";
});

// Pay Now Workflow
payNowBtn.addEventListener("click", async () => {
  // 1. UI Loading State
  payNowBtn.disabled = true;
  cancelCheckoutBtn.disabled = true;
  payNowBtn.style.background = "#94a3b8";
  document.getElementById("pay-now-text").textContent = "Creating Order...";
  paymentMessage.style.display = "none";

  try {
    // 2. Call backend module to create order
    const orderResponse = await window.PaymentService.createOrder(currentBookingData);

    if (!orderResponse.success) {
      throw new Error(orderResponse.message || "Failed to create order on server");
    }

    document.getElementById("pay-now-text").textContent = "Awaiting Payment...";

    // 3. Initialize Razorpay Gateway Options
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    var options = {
      // BACKEND DEV: Replace this with your actual valid API Key!
      // If it stays "rzp_test_dummykey123", Razorpay API will throw a 401 Unauthorized Error
      "key": "rzp_test_dummykey123",
      "amount": currentBookingData.numericPrice * 100,
      "currency": "INR",
      "name": "Local Connect",
      "description": "Payment for " + currentBookingData.service,
      // BACKEND DEV: Usually you pass the orderResponse.orderId here
      // "order_id": orderResponse.orderId, 
      "handler": async function (response) {
        // ON SUCCESS FROM GATEWAY
        document.getElementById("pay-now-text").textContent = "Verifying Payment...";

        try {
          // 4. Call backend to verify secret signatures dynamically
          const verifyResponse = await window.PaymentService.verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            bookingContext: currentBookingData
          });

          if (verifyResponse.success) {
            // 5. Success UI & Backend Save Integration
            paymentMessage.style.display = "block";
            paymentMessage.style.background = "#dcfce7";
            paymentMessage.style.color = "#166534";
            paymentMessage.textContent = "Payment Verified! Generating booking receipt...";
            payNowBtn.style.background = "#10b981";
            document.getElementById("pay-now-text").textContent = "Success ✓";

            // --- MOCK DATABASE SAVE ---
            // BACKEND DEV: You will probably remove this entirely since your API should write to a real DB
            let booking = {
              id: "BK-" + Date.now(),
              userEmail: currentBookingData.userEmail,
              userName: currentBookingData.userName,
              customerName: currentBookingData.customerName,
              phone: currentBookingData.phone,
              service: currentBookingData.service,
              price: currentBookingData.price,
              type: currentBookingData.type,
              date: currentBookingData.date,
              status: "Pending",
              provider: "Unassigned",
              feedback: null,
              paymentId: verifyResponse.paymentId || response.razorpay_payment_id,
              paymentStatus: "Paid"
            };
            let allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];
            allBookings.push(booking);
            localStorage.setItem("allBookings", JSON.stringify(allBookings));

            // Send notification
            simulateNotification(currentBookingData.userEmail, "booking_confirmed", {
              service: currentBookingData.service,
              date: currentBookingData.date
            });
            // -------------------------

            setTimeout(() => {
              window.location.href = "user-dashboard.html";
            }, 1500);
          } else {
            throw new Error("Payment Verification Failed on server API.");
          }
        } catch (err) {
          handlePaymentFailure(err.message);
        }
      },
      "prefill": {
        "name": currentBookingData.customerName,
        "contact": currentBookingData.phone,
        "email": loggedInUser.email
      },
      "theme": {
        "color": "#2563eb"
      },
      "modal": {
        "ondismiss": function () {
          handlePaymentFailure("Payment modal closed. Transaction cancelled.");
        }
      }
    };

    var rzp1 = new Razorpay(options);

    rzp1.on('payment.failed', function (response) {
      handlePaymentFailure(response.error.description);
    });

    // Fire Razorpay Checkouts
    try {
      // Re-enable the cancel button in case Razorpay gets stuck on a network error or 401
      cancelCheckoutBtn.disabled = false;

      if (options.key === "rzp_test_dummykey123") {
        // Frontend Test Mode: Simulate Razorpay completing locally because the dummy key will just cause a 401 error 
        console.warn("Using dummy API key! Simulating Razorpay success flow in 3 seconds to avoid 401 hang...");
        setTimeout(() => {
          options.handler({
            razorpay_payment_id: "pay_sim_" + Math.random().toString(36).substr(2, 9),
            razorpay_order_id: "order_sim",
            razorpay_signature: "sim_signature_123"
          });
        }, 2500);
      } else {
        rzp1.open();
      }
    } catch (err) {
      handlePaymentFailure("Gateway initialization failed: Backend Dev missing API key.");
    }

  } catch (error) {
    console.error(error);
    handlePaymentFailure(error.message);
  }
});

function handlePaymentFailure(errorMessage) {
  payNowBtn.disabled = false;
  cancelCheckoutBtn.disabled = false;
  payNowBtn.style.background = "#10b981"; // Reset green
  document.getElementById("pay-now-text").textContent = "Retry Payment";

  paymentMessage.style.display = "block";
  paymentMessage.style.background = "#fee2e2";
  paymentMessage.style.color = "#991b1b";

  // Standard user-visible message
  paymentMessage.textContent = "Payment Error: " + errorMessage;
}

// ==========================
// INITIAL LOAD
// ==========================
updatePrice();

// ==========================
// NOTIFICATION SYSTEM
// ==========================
function simulateNotification(email, type, data = {}) {
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

    let message = "";
    let subject = "";

    switch(type) {
        case "booking_confirmed":
            subject = "Booking Confirmed";
            message = `Your booking for ${data.service} on ${data.date} has been confirmed. A provider will be assigned soon.`;
            break;
        case "booking_completed":
            subject = "Service Completed";
            message = `Your ${data.service} service has been completed. Please provide feedback in your dashboard.`;
            break;
        case "booking_cancelled":
            subject = "Booking Cancelled";
            message = `Your booking for ${data.service} has been cancelled.`;
            break;
        case "provider_assigned":
            subject = "Provider Assigned";
            message = `${data.provider} has been assigned to your ${data.service} booking on ${data.date}.`;
            break;
    }

    notifications.push({
        id: Date.now().toString(),
        email: email,
        type: type,
        subject: subject,
        message: message,
        timestamp: new Date().toISOString(),
        read: false,
        data: data
    });

    localStorage.setItem("notifications", JSON.stringify(notifications));
}

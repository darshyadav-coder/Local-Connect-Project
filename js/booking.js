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
nameInput.addEventListener("input", () => {
  const name = nameInput.value.trim();
  if (name.length < 3) {
    nameError.textContent = "Name must be at least 3 characters";
    nameError.classList.remove("hidden");
  } else {
    nameError.classList.add("hidden");
  }
});

phoneInput.addEventListener("input", () => {
  const phone = phoneInput.value.trim();
  if (!/^[6-9]\d{9}$/.test(phone)) {
    phoneError.textContent = "Enter valid 10-digit phone number starting with 6-9";
    phoneError.classList.remove("hidden");
  } else {
    phoneError.classList.add("hidden");
  }
});

dateInput.addEventListener("input", () => {
  const date = dateInput.value;
  const today = new Date().toISOString().split("T")[0];
  if (!date || date < today) {
    dateError.textContent = "Select a valid future date";
    dateError.classList.remove("hidden");
  } else {
    dateError.classList.add("hidden");
  }
});

// ==========================
// GET SELECTED SERVICE
// ==========================
let selectedService = JSON.parse(localStorage.getItem("selectedService"));
sessionStorage.removeItem("serviceRefresh");

let basePrice = 0;

if (selectedService) {
  const serviceDisplay = document.getElementById("selected-service-display");
  const serviceName = document.getElementById("service-name");
  const serviceIcon = document.getElementById("service-icon");

  const parentService = servicesData.find((s) =>
    s.subServices.some((sub) => sub.id === selectedService.id)
  );

  serviceName.textContent = selectedService.name;
  if (parentService) {
    serviceIcon.className = `fa-solid ${parentService.icon}`;
  }

  serviceDisplay.classList.remove("hidden");
  document.getElementById("service-selection").classList.add("hidden");

  basePrice = selectedService.price;

  const changeBtn = document.getElementById("change-service-btn");
  changeBtn.addEventListener("click", () => {
    selectedService = null;
    document.getElementById("selected-service-display").classList.add("hidden");
    document.getElementById("service-selection").classList.remove("hidden");
    loadServiceSelection();
    basePrice = 0;
    updatePrice();
  });
} else {
  document.getElementById("selected-service-display").classList.add("hidden");
  document.getElementById("service-selection").classList.remove("hidden");
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
    serviceCard.className = "service-card-selection";
    serviceCard.innerHTML = `
            <i class="fa-solid ${service.icon}"></i>
            <h4>${service.name}</h4>
            <p>${service.description}</p>
        `;

    serviceCard.addEventListener("click", () => {
      selectedService = {
        id: service.id,
        name: service.name,
        price: 0,
      };
      showSubServiceSelection(service);
    });

    serviceGrid.appendChild(serviceCard);
  });
}

function showSubServiceSelection(service) {
  const serviceGrid = document.getElementById("service-grid");
  serviceGrid.innerHTML = `
        <h4 class="selection-title">
            <i class="fa-solid ${service.icon}"></i>
            ${service.name} Services
        </h4>
    `;

  service.subServices.forEach((sub) => {
    const subServiceCard = document.createElement("div");
    subServiceCard.className = "service-card-selection sub-service-card";
    subServiceCard.innerHTML = `
            <i class="fa-solid ${service.icon}"></i>
            <h5>${sub.name}</h5>
            <p class="small">Starting from</p>
            <p class="price-tag-sub">₹${sub.price}</p>
        `;

    subServiceCard.addEventListener("click", () => {
      selectedService = sub;

      const serviceDisplay = document.getElementById("selected-service-display");
      const serviceName = document.getElementById("service-name");
      const serviceIcon = document.getElementById("service-icon");

      serviceName.textContent = selectedService.name;
      serviceIcon.className = `fa-solid ${service.icon}`;
      serviceDisplay.classList.remove("hidden");

      document.getElementById("service-selection").classList.add("hidden");
      basePrice = selectedService.price;
      updatePrice();
    });

    serviceGrid.appendChild(subServiceCard);
  });

  const backButton = document.createElement("button");
  backButton.className = "btn btn-muted btn-back";
  backButton.type = "button";
  backButton.textContent = "← Back to Categories";

  backButton.addEventListener("click", (e) => {
    e.preventDefault();
    loadServiceSelection();
  });

  serviceGrid.appendChild(backButton);
}

let bookingType = localStorage.getItem("bookingType");
const bookingRefresh = sessionStorage.getItem("bookingRefresh");

if (!bookingRefresh) {
  localStorage.removeItem("bookingType");
  bookingType = "normal";
}

sessionStorage.removeItem("bookingRefresh");

if (bookingType === "emergency") {
  emergencyBtn.classList.add("active");
  normalBtn.classList.remove("active");
  document.getElementById("toggle-slider").classList.add("move");
} else {
  normalBtn.classList.add("active");
  emergencyBtn.classList.remove("active");
  document.getElementById("toggle-slider").classList.remove("move");
}

updatePrice();

// ==========================
// UPDATE PRICE
// ==========================
function updatePrice() {
  let total = basePrice;

  if (bookingType === "emergency") {
    total += 200;
    notice.classList.remove("hidden");
    extraChargeText.classList.remove("hidden");
  } else {
    notice.classList.add("hidden");
    extraChargeText.classList.add("hidden");
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
  document.getElementById("toggle-slider").classList.remove("move");
  updatePrice();
});

emergencyBtn.addEventListener("click", () => {
  bookingType = "emergency";
  emergencyBtn.classList.add("active");
  normalBtn.classList.remove("active");
  document.getElementById("toggle-slider").classList.add("move");
  updatePrice();
});

let today = new Date().toISOString().split("T")[0];
dateInput.setAttribute("min", today);

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

  let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) {
    showToast("You must log in first to make a booking!", "error");
    setTimeout(() => window.location.href = "login.html", 1500);
    return;
  }

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

  form.classList.add("hidden");
  document.getElementById("checkout-section").classList.remove("hidden");

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

cancelCheckoutBtn.addEventListener("click", () => {
  document.getElementById("checkout-section").classList.add("hidden");
  form.classList.remove("hidden");
  currentBookingData = null;
  paymentMessage.classList.add("hidden");
});

payNowBtn.addEventListener("click", async () => {
  payNowBtn.disabled = true;
  cancelCheckoutBtn.disabled = true;
  payNowBtn.classList.add("btn-loading");
  document.getElementById("pay-now-text").textContent = "Creating Order...";
  paymentMessage.classList.add("hidden");

  try {
    const orderResponse = await window.PaymentService.createOrder(currentBookingData);

    if (!orderResponse.success) {
      throw new Error(orderResponse.message || "Failed to create order on server");
    }

    document.getElementById("pay-now-text").textContent = "Awaiting Payment...";

    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    var options = {
      key: "rzp_test_dummykey123",
      amount: currentBookingData.numericPrice * 100,
      currency: "INR",
      name: "Local Connect",
      description: "Payment for " + currentBookingData.service,
      handler: async function (response) {
        document.getElementById("pay-now-text").textContent = "Verifying Payment...";

        try {
          const verifyResponse = await window.PaymentService.verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            bookingContext: currentBookingData,
          });

          if (verifyResponse.success) {
            paymentMessage.classList.remove("hidden");
            paymentMessage.className = "payment-status-success";
            paymentMessage.textContent = "Payment Verified! Generating booking receipt...";
            payNowBtn.classList.remove("btn-loading");
            payNowBtn.classList.add("btn-success-payment");
            document.getElementById("pay-now-text").textContent = "Success ✓";

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
              paymentStatus: "Paid",
            };
            let allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];
            allBookings.push(booking);
            localStorage.setItem("allBookings", JSON.stringify(allBookings));

            simulateNotification(currentBookingData.userEmail, "booking_confirmed", {
                service: currentBookingData.service,
                date: currentBookingData.date,
              });

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
      prefill: {
        name: currentBookingData.customerName,
        contact: currentBookingData.phone,
        email: loggedInUser.email,
      },
      theme: { color: "#2563eb" },
      modal: {
        ondismiss: function () {
          handlePaymentFailure("Payment modal closed. Transaction cancelled.");
        },
      },
    };

    var rzp1 = new Razorpay(options);
    rzp1.on("payment.failed", function (response) {
      handlePaymentFailure(response.error.description);
    });

    try {
      cancelCheckoutBtn.disabled = false;
      if (options.key === "rzp_test_dummykey123") {
        setTimeout(() => {
          options.handler({
            razorpay_payment_id: "pay_sim_" + Math.random().toString(36).substr(2, 9),
            razorpay_order_id: "order_sim",
            razorpay_signature: "sim_signature_123",
          });
        }, 2500);
      } else {
        rzp1.open();
      }
    } catch (err) {
      handlePaymentFailure("Gateway initialization failed: Backend Dev missing API key.");
    }
  } catch (error) {
    handlePaymentFailure(error.message);
  }
});

function handlePaymentFailure(errorMessage) {
  payNowBtn.disabled = false;
  cancelCheckoutBtn.disabled = false;
  payNowBtn.classList.remove("btn-loading");
  document.getElementById("pay-now-text").textContent = "Retry Payment";

  paymentMessage.classList.remove("hidden");
  paymentMessage.className = "payment-status-error";
  paymentMessage.textContent = "Payment Error: " + errorMessage;
}

// ==========================
// NOTIFICATION SYSTEM
// ==========================
function simulateNotification(email, type, data = {}) {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  let message = "";
  let subject = "";

  switch (type) {
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
    data: data,
  });

  localStorage.setItem("notifications", JSON.stringify(notifications));
}

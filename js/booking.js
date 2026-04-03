// ==========================
// ELEMENTS
// ==========================
const normalBtn = document.getElementById("normal-booking-btn");
const emergencyBtn = document.getElementById("emergency-booking-btn");
const notice = document.getElementById("emergency-notice");
const form = document.getElementById("booking-form");

const nameInput = form.querySelectorAll("input")[0];
const phoneInput = form.querySelectorAll("input")[1];
const dateInput = document.getElementById("booking-date");

const priceDisplay = document.getElementById("price-display");
const extraChargeText = document.getElementById("extra-charge");
const selectedServiceText = document.getElementById("selected-service");

// ==========================
// GET SELECTED SERVICE
// ==========================
let selectedService = JSON.parse(localStorage.getItem("selectedService"));

let basePrice = 0;

// show selected service
if (selectedService) {
    selectedServiceText.innerText = `Service: ${selectedService.name}`;
    basePrice = selectedService.price;
} else {
    selectedServiceText.innerText = "No service selected";
}

// ==========================
// BOOKING TYPE
// ==========================
let bookingType = localStorage.getItem("bookingType") || "normal";

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

    updatePrice();
});

emergencyBtn.addEventListener("click", () => {
    bookingType = "emergency";

    emergencyBtn.classList.add("active");
    normalBtn.classList.remove("active");

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
        alert("❌ Name must be at least 3 characters");
        return false;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("❌ Enter valid 10-digit phone");
        return false;
    }

    if (!date) {
        alert("❌ Select booking date");
        return false;
    }

    if (!selectedService) {
        alert("❌ No service selected");
        return false;
    }

    return true;
}

// ==========================
// FORM SUBMIT
// ==========================
form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    let totalPrice = priceDisplay.innerText;

    // Viva Check: Ensure user is logged in
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        alert("❌ You must log in first to make a booking!");
        window.location.href = "login.html";
        return;
    }

    let booking = {
        id: "BK-" + Date.now(), // Generate unique ID
        userEmail: loggedInUser.email,
        userName: loggedInUser.fullname || loggedInUser.email.split('@')[0], // Useful for display
        customerName: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        service: selectedService.name,
        price: totalPrice,
        type: bookingType,
        date: dateInput.value,
        status: "Pending",  // initial state
        provider: "Unassigned", // provider hasn't picked it yet
        feedback: null
    };

    // Store in allBookings array!
    let allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];
    allBookings.push(booking);
    localStorage.setItem("allBookings", JSON.stringify(allBookings));

    alert("✅ Booking Confirmed! Redirecting to dashboard...");

    form.reset();
    priceDisplay.innerText = "₹0";
    window.location.href = "user-dashboard.html"; // Show them their pending booking
});

// ==========================
// INITIAL LOAD
// ==========================
updatePrice();
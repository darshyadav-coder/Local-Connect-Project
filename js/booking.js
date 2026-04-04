// ==========================
// UTILITY FUNCTIONS
// ==========================
// Toast notification function for better UX than alerts
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'var(--danger-color)' : 'var(--accent-color)'};
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
nameInput.addEventListener('input', () => {
    const name = nameInput.value.trim();
    if (name.length < 3) {
        nameError.textContent = 'Name must be at least 3 characters';
        nameError.style.display = 'block';
    } else {
        nameError.style.display = 'none';
    }
});

phoneInput.addEventListener('input', () => {
    const phone = phoneInput.value.trim();
    if (!/^[6-9]\d{9}$/.test(phone)) { // Indian phone number validation
        phoneError.textContent = 'Enter valid 10-digit phone number starting with 6-9';
        phoneError.style.display = 'block';
    } else {
        phoneError.style.display = 'none';
    }
});

dateInput.addEventListener('input', () => {
    const date = dateInput.value;
    const today = new Date().toISOString().split('T')[0];
    if (!date || date < today) {
        dateError.textContent = 'Select a valid future date';
        dateError.style.display = 'block';
    } else {
        dateError.style.display = 'none';
    }
});

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
        showToast("Name must be at least 3 characters", 'error');
        nameInput.focus();
        return false;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
        showToast("Enter valid 10-digit phone number starting with 6-9", 'error');
        phoneInput.focus();
        return false;
    }

    if (!date || date < new Date().toISOString().split('T')[0]) {
        showToast("Select a valid future date", 'error');
        dateInput.focus();
        return false;
    }

    if (!selectedService) {
        showToast("No service selected", 'error');
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

    // Add loading state for better UX
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Confirming Booking...';

    let totalPrice = priceDisplay.innerText;

    // Viva Check: Ensure user is logged in
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        showToast("You must log in first to make a booking!", 'error');
        window.location.href = "login.html";
        return;
    }

    // Simulate processing delay for realism
    setTimeout(() => {
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

        // Reset loading state
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        showToast("Booking Confirmed! Redirecting to dashboard...", 'success');

        form.reset();
        priceDisplay.innerText = "₹0";
        window.location.href = "user-dashboard.html"; // Show them their pending booking
    }, 1500); // 1.5 second delay for UX
});

// ==========================
// INITIAL LOAD
// ==========================
updatePrice();
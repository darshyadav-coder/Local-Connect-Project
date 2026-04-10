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

// Clear the refresh flag after using it
sessionStorage.removeItem("serviceRefresh");

let basePrice = 0;

// show selected service
if (selectedService) {
    selectedServiceText.innerHTML = `
        <span>Service: ${selectedService.name}</span>
        <button type="button" id="change-service-btn" style="margin-left: 15px; padding: 5px 10px; background: var(--accent-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Change Service</button>
    `;
    document.getElementById("service-selection").style.display = "none";

    // Add change service functionality
    document.getElementById("change-service-btn").addEventListener("click", () => {
        selectedService = null;
        selectedServiceText.innerText = "Please select a service below";
        document.getElementById("service-selection").style.display = "block";
        loadServiceSelection();
        basePrice = 0;
        updatePrice();
    });
} else {
    selectedServiceText.innerText = "Please select a service below";
    document.getElementById("service-selection").style.display = "block";
    loadServiceSelection();
}

// ==========================
// SERVICE SELECTION FUNCTION
// ==========================
function loadServiceSelection() {
    const serviceGrid = document.getElementById("service-grid");
    serviceGrid.innerHTML = "";

    servicesData.forEach(service => {
        const serviceCard = document.createElement("div");
        serviceCard.className = "service-card";
        serviceCard.style.cssText = "cursor: pointer; padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; transition: all 0.3s ease;";
        serviceCard.innerHTML = `
            <i class="fa-solid ${service.icon}" style="font-size: 24px; color: var(--accent-color); margin-bottom: 10px;"></i>
            <h4 style="margin: 0 0 5px 0; color: var(--text-dark);">${service.name}</h4>
            <p style="margin: 0; color: var(--text-muted); font-size: 14px;">${service.description}</p>
        `;

        serviceCard.addEventListener("click", () => {
            selectedService = {
                id: service.id,
                name: service.name,
                price: 0 // Will be set when sub-service is selected
            };

            // Show sub-services for selection
            showSubServiceSelection(service);
        });

        serviceGrid.appendChild(serviceCard);
    });
}

function showSubServiceSelection(service) {
    const serviceGrid = document.getElementById("service-grid");
    serviceGrid.innerHTML = `<h4 style="grid-column: 1 / -1; text-align: center; color: var(--text-dark); margin-bottom: 15px;">Select ${service.name} Service</h4>`;

    service.subServices.forEach(sub => {
        const subServiceCard = document.createElement("div");
        subServiceCard.className = "service-card";
        subServiceCard.style.cssText = "cursor: pointer; padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; transition: all 0.3s ease;";
        subServiceCard.innerHTML = `
            <i class="fa-solid ${service.icon}" style="font-size: 20px; color: var(--accent-color); margin-bottom: 8px;"></i>
            <h5 style="margin: 0 0 5px 0; color: var(--text-dark);">${sub.name}</h5>
            <p style="margin: 0; color: var(--text-muted); font-size: 14px;">Starting from ₹${sub.price}</p>
        `;

        subServiceCard.addEventListener("click", () => {
            selectedService = sub;
            selectedServiceText.innerText = `Service: ${selectedService.name}`;
            document.getElementById("service-selection").style.display = "none";
            basePrice = selectedService.price;
            updatePrice();

            // Highlight selected service
            subServiceCard.style.borderColor = "var(--accent-color)";
            subServiceCard.style.backgroundColor = "#f0f8ff";
        });

        serviceGrid.appendChild(subServiceCard);
    });

    // Add back button
    const backButton = document.createElement("button");
    backButton.className = "btn";
    backButton.style.cssText = "grid-column: 1 / -1; margin-top: 15px; background: var(--text-muted);";
    backButton.textContent = "← Back to Categories";
    backButton.addEventListener("click", () => {
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
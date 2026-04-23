// service.html js part

// ==========================
// ELEMENTS
// ==========================
const container = document.getElementById("services-container");
const title = document.getElementById("page-title");
const searchInput = document.getElementById("service-search");
const priceFilter = document.getElementById("price-filter");
const noResult = document.getElementById("no-result");

// ==========================
// GET CATEGORY
// ==========================
let selectedCategory = localStorage.getItem("category");
const categoryRefresh = sessionStorage.getItem("categoryRefresh");

// Only use stored category if this is a reload from category selection
// Direct navigation clears the category
if (!categoryRefresh) {
  localStorage.removeItem("category");
  selectedCategory = null;
}

// Clear the refresh flag after using it
sessionStorage.removeItem("categoryRefresh");

// ==========================
// RENDER FUNCTIONS
// ==========================

// 👉 Show Categories
function renderCategories() {
  title.innerText = "All Services";

  let html = "";

  servicesData.forEach((service) => {
    html += `
        <div class="service-card" data-id="${service.id}">
            <i class="fa-solid ${service.icon}"></i>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
        </div>
        `;
  });

  container.innerHTML = html;

  // Click → go to sub-services
  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      sessionStorage.setItem("categoryRefresh", "true");
      localStorage.setItem("category", id);
      window.location.reload();
    });
  });
}

// 👉 Show Sub-Services
function renderSubServices(service) {
  title.innerText = service.name + " Services";

  let html = "";

  service.subServices.forEach((sub) => {
    html += `
        <div class="service-card" data-service='${JSON.stringify(sub)}'>
            <i class="fa-solid ${service.icon}"></i>
            <h3>${sub.name}</h3>
            <p>Starting from ₹${sub.price}</p>
            <button class="btn book-btn">Book Now</button>
        </div>
        `;
  });

  container.innerHTML = html;

  // Book button click
  document.querySelectorAll(".book-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const selected = service.subServices[index];

      sessionStorage.setItem("serviceRefresh", "true");
      localStorage.setItem("selectedService", JSON.stringify(selected));
      window.location.href = "booking.html";
    });
  });
}

// ==========================
// MAIN LOGIC
// ==========================
if (selectedCategory) {
  const service = servicesData.find((s) => s.id === selectedCategory);

  if (service) {
    renderSubServices(service);
  } else {
    renderCategories();
  }
} else {
  renderCategories();
}

// ==========================
// RENDER REVIEWS FUNCTION (Transparency for Users)
// ==========================
function renderReviews() {
  const reviewsContainer = document.getElementById("reviews-container");
  const allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];
  const reviews = allBookings.filter((b) => b.feedback).slice(-6); // Show last 6 reviews

  reviewsContainer.innerHTML = "";
  if (reviews.length === 0) {
    reviewsContainer.innerHTML =
      "<p style='color: var(--text-muted); text-align: center;'>No reviews yet. Be the first to book and share your experience!</p>";
    return;
  }

  reviews.forEach((review) => {
    reviewsContainer.innerHTML += `
            <div class="review-card" style="background: white; padding: 20px; border-radius: 8px; box-shadow: var(--shadow-md); max-width: 300px;">
                <h4>${review.service}</h4>
                <p style="color: var(--accent-color); font-weight: bold;">${review.feedback.rating}</p>
                <p style="font-style: italic;">"${review.feedback.comment}"</p>
                <p style="color: var(--text-muted); font-size: 12px;">- ${review.customerName || review.userName}, ${new Date(review.date).toLocaleDateString()}</p>
            </div>
        `;
  });
}

// Call renderReviews after rendering services
renderReviews();

// ==========================
// SEARCH AND FILTER FUNCTION
// ==========================
function filterServices() {
  let searchValue = searchInput ? searchInput.value.toLowerCase() : "";
  let priceValue = priceFilter ? priceFilter.value : "";
  let cards = document.querySelectorAll(".service-card");
  let found = false;

  cards.forEach((card) => {
    let text = card.innerText.toLowerCase();
    let price = parseInt(card.innerText.match(/₹(\d+)/)?.[1] || 0); // Extract price from card text
    let showCard = true;

    // Search filter
    if (searchValue && !text.includes(searchValue)) {
      showCard = false;
    }

    // Price filter
    if (priceValue) {
      if (priceValue === "low" && price >= 300) showCard = false;
      else if (priceValue === "medium" && (price < 300 || price > 600))
        showCard = false;
      else if (priceValue === "high" && price <= 600) showCard = false;
    }

    card.style.display = showCard ? "" : "none";
    if (showCard) found = true;
  });

  if (noResult) {
    noResult.style.display = found ? "none" : "block";
  }
}

if (searchInput) {
  searchInput.addEventListener("keyup", filterServices);
}

if (priceFilter) {
  priceFilter.addEventListener("change", filterServices);
}

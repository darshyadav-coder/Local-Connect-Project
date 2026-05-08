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
async function renderCategories() {
  title.innerText = "All Services";
  container.innerHTML = "<p id='loader'>Loading Categories...</p>";

  try {
    // Try to get categories from API
    const categories = await getServiceCategories();
    
    let html = "";
    const list = (categories && categories.length > 0) ? categories : servicesData;

    list.forEach((service) => {
      html += `
          <div class="service-card" data-id="${service.id || service._id}">
              <i class="fa-solid ${service.icon}"></i>
              <h3 class="bold">${service.name}</h3>
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
  } catch (error) {
    console.error("Categories error:", error);
    // Fallback to static data
    container.innerHTML = "";
    servicesData.forEach((service) => {
      container.innerHTML += `
          <div class="service-card" data-id="${service.id}">
              <i class="fa-solid ${service.icon}"></i>
              <h3 class="bold">${service.name}</h3>
              <p>${service.description}</p>
          </div>
          `;
    });
  }
}

// 👉 Show Sub-Services
function renderSubServices(service) {
  title.innerText = service.name + " Services";

  let html = "";

  service.subServices.forEach((sub) => {
    html += `
        <div class="service-card" data-service='${JSON.stringify(sub)}'>
            <span class="price-tag">₹${sub.price}</span>
            <i class="fa-solid ${service.icon}"></i>
            <h3 class="bold">${sub.name}</h3>
            <p>Reliable and professional ${sub.name.toLowerCase()} service at your doorstep.</p>
            <button class="btn book-btn">Book Now</button>
        </div>
        `;
  });

  container.innerHTML = html;

  // Book button click
  document.querySelectorAll(".book-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      if (!localStorage.getItem("loggedInUser")) {
        showToast("Please login first to book a service.", "error");
        setTimeout(() => window.location.href = "login.html", 1500);
        return;
      }

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
async function init() {
  if (selectedCategory) {
    // If it's a MongoDB ID, we might need to fetch it
    let service = servicesData.find((s) => s.id === selectedCategory);
    
    if (!service) {
       try {
         service = await getService(selectedCategory);
       } catch (e) {}
    }

    if (service) {
      renderSubServices(service);
    } else {
      await renderCategories();
    }
  } else {
    await renderCategories();
  }
  
  await renderReviews();
}

init();

// ==========================
// RENDER REVIEWS FUNCTION
// ==========================
async function renderReviews() {
  const reviewsContainer = document.getElementById("reviews-container");
  
  try {
    const feedback = await getAllFeedback();
    const reviews = feedback.slice(-6); // Show last 6 reviews

    reviewsContainer.innerHTML = "";
    if (reviews.length === 0) {
      reviewsContainer.innerHTML =
        "<p class='text-muted text-center'>No reviews yet. Be the first to book and share your experience!</p>";
      return;
    }

    reviews.forEach((review) => {
      reviewsContainer.innerHTML += `
              <div class="review-card">
                  <div class="rating">
                      ${'⭐'.repeat(parseInt(review.rating) || 5)}
                  </div>
                  <h4 class="bold">${review.service}</h4>
                  <p class="italic">"${review.comment}"</p>
                  <span class="author">
                      ${review.userName || 'Anonymous'} • ${new Date(review.createdAt || Date.now()).toLocaleDateString()}
                  </span>
              </div>
          `;
    });
  } catch (error) {
    console.error("Reviews error:", error);
    reviewsContainer.innerHTML = "<p class='text-muted text-center text-danger'>Failed to load reviews.</p>";
  }
}

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
    let price = parseInt(card.innerText.match(/₹(\d+)/)?.[1] || 0); 
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

    card.classList.toggle("hidden", !showCard);
    if (showCard) found = true;
  });

  if (noResult) {
    noResult.classList.toggle("hidden", found);
  }
}

if (searchInput) {
  searchInput.addEventListener("keyup", filterServices);
}

if (priceFilter) {
  priceFilter.addEventListener("change", filterServices);
}

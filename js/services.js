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

// Add Back Button reference
const backBtnContainer = document.createElement('div');
backBtnContainer.className = 'container mb-4 mt-4 text-center hidden';
backBtnContainer.id = 'back-btn-container';
backBtnContainer.innerHTML = `
  <button id="back-to-categories" class="btn btn-muted">
    <i class="fa-solid fa-arrow-left"></i> Back to All Categories
  </button>
`;
const reviewsSection = document.querySelector('.reviews-section');
if (reviewsSection) {
  reviewsSection.parentNode.insertBefore(backBtnContainer, reviewsSection);
} else {
  document.querySelector('main')?.appendChild(backBtnContainer);
}

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

    list.forEach((service, index) => {
      let isPopular = index % 4 === 0;
      html += `
          <div class="service-card" data-id="${service.id || service._id}">
              ${isPopular ? '<div class="popular-badge">Top Rated</div>' : ''}
              <i class="fa-solid ${service.icon}"></i>
              <h3 class="bold">${service.name}</h3>
              <p>${service.description || "Expert help for all your " + service.name.toLowerCase() + " needs."}</p>
              <div class="mt-3 text-primary bold">View Services <i class="fa-solid fa-arrow-right-long"></i></div>
          </div>
          `;
    });

    container.innerHTML = html;

    // Click → go to sub-services
    document.querySelectorAll(".service-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        selectedCategory = id;
        localStorage.setItem("category", id);
        
        // Find service in data
        const service = servicesData.find(s => s.id === id);
        if (service) {
          renderSubServices(service);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
              <div class="mt-3 text-primary bold">View Services →</div>
          </div>
          `;
    });
    
    // Add listeners to fallback cards too
    document.querySelectorAll(".service-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        const service = servicesData.find(s => s.id === id);
        if (service) renderSubServices(service);
      });
    });
  }
}

// 👉 Show Sub-Services
function renderSubServices(service) {
  title.innerText = service.name + " Services";
  
  // Show back button
  const backBtn = document.getElementById('back-btn-container');
  if (backBtn) backBtn.classList.remove('hidden');

  // Add animation class
  container.classList.add('fade-in-visible');
  container.style.opacity = '0';
  setTimeout(() => {
    container.style.opacity = '1';
  }, 50);

  let html = "";

  service.subServices.forEach((sub, index) => {
    let isRecommended = index === 0;
    html += `
        <div class="service-card sub-service-card glass-card" data-service='${JSON.stringify(sub)}'>
            ${isRecommended ? '<div class="popular-badge">Recommended</div>' : ''}
            <span class="price-tag">₹${sub.price}</span>
            <div class="card-icon-wrapper">
                <i class="fa-solid ${service.icon}"></i>
            </div>
            <h3 class="bold">${sub.name}</h3>
            <p>Reliable and professional ${sub.name.toLowerCase()} service at your doorstep with 100% satisfaction guarantee.</p>
            <div class="service-meta mb-3">
                <span><i class="fa-solid fa-star text-warning"></i> 4.8 (2k+)</span>
                <span><i class="fa-solid fa-clock"></i> 45-60 min</span>
            </div>
            <button class="btn book-btn w-100">Book Now <i class="fa-solid fa-calendar-check"></i></button>
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
  // Handle Back Button
  document.getElementById('back-to-categories')?.addEventListener('click', () => {
    localStorage.removeItem('category');
    document.getElementById('back-btn-container')?.classList.add('hidden');
    renderCategories();
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
function getServiceImage(serviceName) {
  const images = {
    'Plumbing': 'https://images.unsplash.com/photo-1581244276891-9975c2c771c9?w=400&q=80',
    'Electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80',
    'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=400&q=80',
    'Appliance Repair': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80',
    'Carpentry': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&q=80',
    'Painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80',
    'Pest Control': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80',
    'Beauty & Salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
    'Packers & Movers': 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400&q=80',
    'Vehicle Services': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80'
  };
  return images[serviceName] || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80';
}

async function renderReviews() {
  const reviewsContainer = document.getElementById("reviews-container");
  
  try {
    const response = await getAllFeedback();
    const reviews = response.feedback ? response.feedback.slice(-6) : [];

    reviewsContainer.innerHTML = "";
    if (reviews.length === 0) {
      reviewsContainer.innerHTML =
        "<p class='text-muted text-center'>No reviews yet. Be the first to book and share your experience!</p>";
      return;
    }

    reviews.forEach((review) => {
      const serviceImg = getServiceImage(review.service);
      reviewsContainer.innerHTML += `
              <div class="review-card glass-card">
                  <div class="review-image-wrapper">
                      <img src="${serviceImg}" alt="${review.service}" class="review-service-img">
                      <div class="review-rating-badge">
                          ${'⭐'.repeat(parseInt(review.rating) || 5)}
                      </div>
                  </div>
                  <div class="review-content">
                      <h4 class="bold">${review.service}</h4>
                      <p class="italic">"${review.comment}"</p>
                      <div class="review-footer">
                          <span class="author-name">${review.userName || 'Anonymous'}</span>
                          <span class="review-date">${new Date(review.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                  </div>
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

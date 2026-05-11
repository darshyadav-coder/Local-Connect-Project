// main.html js part

document.addEventListener("DOMContentLoaded", () => {
  // Navbar scroll effect
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-visible");
      }
    });
  }, observerOptions);

  // Observe all fade-in targets for scroll animation
  document.querySelectorAll(".fade-in-target").forEach((el) => {
    observer.observe(el);
  });

  // Dynamic Greeting
  const heroTitle = document.querySelector(".hero h1");
  if (heroTitle) {
    let hour = new Date().getHours();
    let greeting = "Welcome";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";
    heroTitle.textContent = `${greeting}, Smart Local Services`;
  }
});

const container = document.getElementById("services-container");

if (container && typeof servicesData !== "undefined") {
  let cardsHTML = "";

  // Load 12 services, but hide the ones after index 5
  servicesData.slice(0, 12).forEach((service, index) => {
    let hiddenClass = index >= 6 ? "hidden" : "";
    let isPopular = index % 3 === 0; // Simulate popular services
    
    cardsHTML += `
        <div class="service-card ${hiddenClass} fade-in-target" data-id="${service.id}">
            ${isPopular ? '<div class="popular-badge">Popular</div>' : ''}
            <i class="fa-solid ${service.icon}"></i>
            <h3>${service.name}</h3>
            <p>${service.description || "Trusted professional services for your home."}</p>
            <span class="text-primary bold small">Explore More →</span>
        </div>
        `;
  });
  container.innerHTML = cardsHTML;

  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      sessionStorage.setItem("categoryRefresh", "true");
      localStorage.setItem("category", id);
      window.location.href = "services.html";
    });
  });

  const viewAllBtn = document.getElementById("view-all-btn");
  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", () => {
      document.querySelectorAll(".service-card.hidden").forEach((card) => {
        card.classList.remove("hidden");
      });
      viewAllBtn.classList.add("hidden");
    });
  }
}

// Location-Based Detection
const locationText = document.getElementById("user-location");
if (navigator.geolocation && locationText) {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
      try {
        let response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        let data = await response.json();
        if (data && data.address) {
          let place = `${data.address.city || data.address.town || data.address.village || "Your Area"}, ${data.address.state || ""}`;
          locationText.textContent = `📍 ${place}`;
        } else {
          locationText.textContent = "📍 Location detected";
        }
      } catch (error) {
        locationText.textContent = "📍 Location unavailable";
      }
    },
    () => {
      locationText.textContent = "📍 Location access denied";
    }
  );
}

// Emergency Booking
const emergencyBtn = document.getElementById("emergency-btn");
if (emergencyBtn) {
  emergencyBtn.addEventListener("click", () => {
    if (!localStorage.getItem("loggedInUser")) {
      showToast("Please login first to book a service!", "warning");
      setTimeout(() => (window.location.href = "login.html"), 1500);
      return;
    }
    sessionStorage.setItem("bookingRefresh", "true");
    localStorage.setItem("bookingType", "emergency");
    showToast("🚨 Emergency service activated! Redirecting...", "info");
    setTimeout(() => (window.location.href = "booking.html"), 2000);
  });
}

// CTA button
const ctaBtn = document.querySelector(".cta .btn");
if (ctaBtn) {
  ctaBtn.addEventListener("click", (e) => {
    if (!localStorage.getItem("loggedInUser")) {
      e.preventDefault();
      showToast("Please login first to book a service.", "warning");
      setTimeout(() => (window.location.href = "login.html"), 1500);
      return;
    }
    sessionStorage.setItem("bookingRefresh", "true");
    localStorage.setItem("bookingType", "normal");
    window.location.href = "booking.html";
  });
}

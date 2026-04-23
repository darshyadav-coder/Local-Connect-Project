//main.html js part

const container = document.getElementById("services-container");

if (container && typeof servicesData !== "undefined") {
  let cardsHTML = "";

  // Load 12 services, but hide the ones after index 5 (so 6 are visible, 6 are hidden)
  servicesData.slice(0, 12).forEach((service, index) => {
    let displayStyle = index >= 6 ? 'style="display: none;"' : "";
    cardsHTML += `
        <div class="service-card" data-id="${service.id}" ${displayStyle}>
            <i class="fa-solid ${service.icon}"></i>
            <h3>${service.name}</h3>
            <p>${service.description || "Click to explore services"}</p>
                </div>
                `;
  });
  container.innerHTML += cardsHTML;

  // Fix for Viva: Changed selector to .service-card to match our CSS styling properly
  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      sessionStorage.setItem("categoryRefresh", "true");
      localStorage.setItem("category", id);
      window.location.href = "services.html";
    });
  });

  // Viva Feature: View All Services Logic!
  // This dynamically unhides the hidden cards.
  const viewAllBtn = document.getElementById("view-all-btn");
  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", () => {
      document.querySelectorAll(".service-card").forEach((card) => {
        card.style.display = "block"; // Reset inline display format
      });
      viewAllBtn.style.display = "none"; // Hide button after clicking
    });
  }
}
// Dynamic Greeting

document.addEventListener("DOMContentLoaded", () => {
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

//Location-Based Detection
const locationText = document.getElementById("user-location"); //get html element where location wil be displayed

if (navigator.geolocation && locationText) {
  //check if browser supports geolocation AND element exists
  navigator.geolocation.getCurrentPosition(
    // gets user's current position (lat and long)
    async (position) => {
      // success function (runs if user allows location access)
      let lat = position.coords.latitude; // extract latitude from position object
      let lon = position.coords.longitude; // extract longitude from positon object

      try {
        // send request to openstreetmap api to convert lat/lon into place name
        let response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        );

        let data = await response.json(); // convert api response to json format

        if (data && data.address) {
          let place = `${data.address.city || data.address.town || data.address.village || "Your Area"}, ${data.address.state || ""}`; //try to get the best available place name

          locationText.textContent = `📍 ${place}`; //display the detected place on the webpage
        } else {
          locationText.textContent = "📍 Location detected";
        }
      } catch (error) {
        locationText.textContent = "📍Location unavailable"; //if api fails (network issue, etc.)
      }
    },
    () => {
      locationText.textContent = "📍 Location access denied"; // error function (runs if user denies location access)
    },
  );
}

// Emergency Booking
const emergencyBtn = document.getElementById("emergency-btn");

if (emergencyBtn) {
  emergencyBtn.addEventListener("click", () => {
    sessionStorage.setItem("bookingRefresh", "true");
    localStorage.setItem("bookingType", "emergency");

    // Viva Feature: Using our custom Toast instead of a boring alert() box!
    showToast("🚨 Emergency service activated! Redirecting...");

    // Wait for the toast to show before redirecting
    setTimeout(() => {
      window.location.href = "booking.html";
    }, 2000);
  });
}

//CTA button
const ctaBtn = document.querySelector(".cta .btn");

if (ctaBtn) {
  ctaBtn.addEventListener("click", () => {
    sessionStorage.setItem("bookingRefresh", "true");
    localStorage.setItem("bookingType", "normal");
    window.location.href = "booking.html";
  });
}

// ==========================================
// VIVA FEATURE: Custom Toast Notification
// ==========================================
// We created this to avoid browser native alerts which look unprofessional.
function showToast(message) {
  // 1. Create a div element for the toast
  const toast = document.createElement("div");
  toast.className = "toast";

  // 2. Add an icon and the message
  toast.innerHTML = `<i class="fa-solid fa-bell"></i> <span>${message}</span>`;

  // 3. Append to the page body
  document.body.appendChild(toast);

  // 4. Trigger the CSS slide-in animation using a small delay
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // 5. Remove the toast after 3 seconds so it's clean
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400); // Wait for slide-out animation to finish
  }, 4000);
}

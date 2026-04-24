document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const menu = document.querySelector(".menu");
  if (!menu) return;

  const userLink = menu.querySelector('a[href*="user-dashboard.html"]');
  const providerLink = menu.querySelector('a[href*="provider-dashboard.html"]');
  const adminLink = menu.querySelector('a[href*="admin-dashboard.html"]');
  const loginLink = menu.querySelector('a[href*="login.html"]');
  const bookNowLink = menu.querySelector('a[href*="booking.html"]');

  if (bookNowLink) {
    bookNowLink.addEventListener("click", (e) => {
      if (!user) {
        e.preventDefault();
        if (typeof showToast === "function") {
          showToast("Please login first to access the booking page.", "error");
        } else {
          alert("Please login first to access the booking page.");
        }
        setTimeout(() => (window.location.href = "login.html"), 1500);
      }
    });
  }

  if (!user) {
    // Not logged in: hide all dashboards
    if (userLink) userLink.classList.add("hidden");
    if (providerLink) providerLink.classList.add("hidden");
    if (adminLink) adminLink.classList.add("hidden");
  } else {
    // Logged in: change Login to Logout
    if (loginLink) {
      loginLink.textContent = "Logout";
      loginLink.href = "#";
      loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("loggedInUser");
        window.location.href = "main.html"; // Redirect to home page on logout
      });
    }

    // Show only the relevant dashboard based on role
    if (user.role === "user") {
      if (providerLink) providerLink.classList.add("hidden");
      if (adminLink) adminLink.classList.add("hidden");
    } else if (user.role === "provider") {
      if (userLink) userLink.classList.add("hidden");
      if (adminLink) adminLink.classList.add("hidden");
    } else if (user.role === "admin") {
      if (userLink) userLink.classList.add("hidden");
      if (providerLink) providerLink.classList.add("hidden");
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const token = getAuthToken();
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
      if (!token || !user) {
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

  if (!token || !user) {
    // Not logged in: hide all dashboards
    if (userLink) userLink.classList.add("hidden");
    if (providerLink) providerLink.classList.add("hidden");
    if (adminLink) adminLink.classList.add("hidden");
  } else {
    // Logged in: change Login to Logout
    if (loginLink) {
      loginLink.textContent = "Logout";
      loginLink.href = "#";
      loginLink.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await logoutUser();
        } catch (error) {
          console.error("Logout error:", error);
        }
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

  // Add dark mode toggle
  const navbar = document.querySelector('.navbar .container');
  if (navbar) {
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.className = 'theme-toggle-btn';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    themeToggle.title = 'Toggle dark mode';

    // Insert before the menu
    const menu = navbar.querySelector('.menu');
    if (menu) {
      navbar.insertBefore(themeToggle, menu);
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);

      // Show toast notification
      if (typeof showToast === 'function') {
        showToast(`Switched to ${newTheme} mode`, 'info');
      }
    });

    function updateThemeIcon(theme) {
      const icon = themeToggle.querySelector('i');
      if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
      } else {
        icon.className = 'fas fa-moon';
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
      }
    }
  }
});

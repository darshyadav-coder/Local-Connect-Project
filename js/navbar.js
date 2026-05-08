document.addEventListener("DOMContentLoaded", () => {
  const getAuthTokenSafe = typeof getAuthToken === "function" ? getAuthToken : () => localStorage.getItem("authToken");
  const token = getAuthTokenSafe();

  // Upgrade Logo Design
  const logoDiv = document.querySelector(".logo");
  if (logoDiv && !logoDiv.querySelector(".logo-icon")) {
    const logoText = logoDiv.textContent;
    logoDiv.innerHTML = `
      <div class="logo-wrapper">
        <div class="logo-icon">
          <i class="fas fa-bolt"></i>
        </div>
        <span class="logo-text">${logoText}</span>
      </div>
    `;
    
    logoDiv.querySelector(".logo-wrapper").addEventListener("click", () => {
      window.location.href = "main.html";
    });
  }

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

  // Initial state: hide all dashboards if not already hidden
  if (userLink) userLink.classList.add("hidden");
  if (providerLink) providerLink.classList.add("hidden");
  if (adminLink) adminLink.classList.add("hidden");

  if (!token || !user) {
    // Not logged in: dashboards stay hidden
    if (loginLink) {
      loginLink.textContent = "Login";
      loginLink.href = "login.html";
    }
  } else {
    // Logged in: change Login to Logout
    if (loginLink) {
      loginLink.textContent = "Logout";
      loginLink.href = "#";
      loginLink.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          if (typeof logoutUser === "function") {
            await logoutUser();
          }
        } catch (error) {
          console.error("Logout error:", error);
        }
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("authToken");
        window.location.href = "main.html"; // Redirect to home page on logout
      });
    }

    // Show ONLY the relevant dashboard based on role
    if (user.role === "user") {
      if (userLink) userLink.classList.remove("hidden");
    } else if (user.role === "provider") {
      if (providerLink) providerLink.classList.remove("hidden");
    } else if (user.role === "admin") {
      if (adminLink) adminLink.classList.remove("hidden");
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

    // Create actions container
    let navActions = navbar.querySelector('.nav-actions');
    if (!navActions) {
      navActions = document.createElement('div');
      navActions.className = 'nav-actions';
      navbar.appendChild(navActions);
    }

    navActions.appendChild(themeToggle);

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

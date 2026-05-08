/**
 * =========================================================================
 * AUTHENTICATION SYSTEM - BACKEND INTEGRATION
 * =========================================================================
 * This script handles User Authentication with backend API
 * - JWT token management
 * - Backend validation
 * - Secure session management
 */

const form = document.querySelector("#loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const roleInput = document.getElementById("role");
const errorMsg = document.getElementById("error-msg");
const toggleBtn = document.getElementById("togglePass");
const loginBtn = document.getElementById("loginBtn");

// Show/hide password
toggleBtn.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleBtn.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    toggleBtn.textContent = "Show";
  }
});

// Form submission - Login with Backend
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const selectedRole = roleInput.value;

  errorMsg.textContent = "";

  // Validation
  if (!email.includes("@")) {
    errorMsg.textContent = "Enter valid email";
    return;
  }

  if (password.length < 6) {
    errorMsg.textContent = "Password must be at least 6 characters";
    return;
  }

  if (!selectedRole) {
    errorMsg.textContent = "Please select a role";
    return;
  }

  // Loading state
  loginBtn.textContent = "Logging in...";
  loginBtn.disabled = true;

  try {
    // Call backend API
    const response = await loginUser(email, password);

    // Check if role matches
    if (response.role !== selectedRole) {
      errorMsg.textContent = `Account exists but registered as ${response.role}, not ${selectedRole}`;
      loginBtn.textContent = "Login";
      loginBtn.disabled = false;
      clearAuthToken();
      return;
    }

    // Store user info in localStorage (separate from token)
    localStorage.setItem("loggedInUser", JSON.stringify(response));

    // Redirect based on role
    redirectUser(response.role);
  } catch (error) {
    errorMsg.textContent = error.message || "Invalid email or password";
    loginBtn.textContent = "Login";
    loginBtn.disabled = false;
  }
});

// ===============================
// REDIRECT BASED ON ROLE
// ===============================
function redirectUser(role) {
  if (role === "user") {
    window.location.href = "user-dashboard.html";
  } else if (role === "provider") {
    window.location.href = "provider-dashboard.html";
  } else if (role === "admin") {
    window.location.href = "admin-dashboard.html";
  }
}

// ===============================
// AUTO LOGIN (SESSION CHECK)
// ===============================
window.addEventListener("DOMContentLoaded", function () {
  // If already logged in, redirect to dashboard
  const token = getAuthToken();
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (token && user) {
    redirectUser(user.role);
  }
});

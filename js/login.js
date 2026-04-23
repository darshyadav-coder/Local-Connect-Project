/**
 * =========================================================================
 * VIVA DOCUMENTATION: AUTHENTICATION SYSTEM
 * =========================================================================
 * This script handles User Authentication entirely on the frontend.
 * 
 * 1. Dummy Users: We have hardcoded admin/provider/user accounts for quick testing.
 * 2. Merging Data: It checks LocalStorage for any newly registered users ("registeredUsers")
 *    and combines them with the dummy users array.
 * 3. Session Management: If login is successful, it stores the user info in 
 *    LocalStorage under "loggedInUser". This acts as our "session token".
 * 4. Auto-Login: The window.onload event checks if a session exists and auto-redirects.
 */
const form = document.querySelector("#loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const roleInput = document.getElementById("role");
const errorMsg = document.getElementById("error-msg");
const toggleBtn = document.getElementById("togglePass");
const loginBtn = document.getElementById("loginBtn");

//dummy users
const users = [
  { email: "user@gmail.com", password: "123456", role: "user" },
  { email: "provider@gmail.com", password: "123456", role: "provider" },
  { email: "admin@gmail.com", password: "123456", role: "admin" },
];

//show/hide password
toggleBtn.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleBtn.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    toggleBtn.textContent = "show;";
  }
});

// form validation + login

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const role = roleInput.value;

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

  if (role === "") {
    errorMsg.textContent = "Please select a role";
    return;
  }

  // Loading state
  loginBtn.textContent = "Logging in...";
  loginBtn.disabled = true;

  setTimeout(() => {
    // Viva Feature: We fetch new users from localStorage and merge them with dummy users!
    // This makes the UI completely functional without any backend.
    const localSignups =
      JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const totalUsers = [...users, ...localSignups]; // Combines both lists!

    const validUser = totalUsers.find(
      (u) => u.email === email && u.password === password && u.role === role,
    );

    if (validUser) {
      // Save session
      localStorage.setItem("loggedInUser", JSON.stringify(validUser));

      redirectUser(role);
    } else {
      errorMsg.textContent = "Invalid credentials";
    }

    loginBtn.textContent = "Login";
    loginBtn.disabled = false;
  }, 1000);
});

// ===============================
// REDIRECT BASED ON ROLE
// ===============================
function redirectUser(role) {
  if (role === "user") {
    window.location.href = "user-dashboard.html";
  } else if (role === "provider") {
    window.location.href = "provider-dashboard.html";
  } else {
    window.location.href = "admin-dashboard.html";
  }
}

// ===============================
// AUTO LOGIN (SESSION CHECK)
// ===============================
window.onload = function () {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (user) {
    redirectUser(user.role);
  }
};

/**
 * =========================================================================
 * USER REGISTRATION (SIGNUP) - BACKEND INTEGRATION
 * =========================================================================
 * This script handles user registration with backend API
 * - Input validation
 * - Backend registration
 * - JWT token management
 */

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const errorMsg = document.getElementById("error-msg");
  const signupBtn = document.getElementById("signupBtn");

  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Gather form data
      const fullname = document.getElementById("fullname").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const location = document.getElementById("location").value.trim();
      const role = document.getElementById("role").value;
      const securityQuestion = document.getElementById("security-question").value;
      const securityAnswer = document.getElementById("security-answer").value.trim();

      // Reset error
      errorMsg.textContent = "";

      // Validation
      if (!fullname || !email || !password || !location || !role || !securityQuestion || !securityAnswer) {
        errorMsg.textContent = "Please fill in all fields.";
        return;
      }

      if (password.length < 6) {
        errorMsg.textContent = "Password must be at least 6 characters.";
        return;
      }

      if (!email.includes("@")) {
        errorMsg.textContent = "Please enter a valid email.";
        return;
      }

      // Update UI
      signupBtn.textContent = "Creating Account...";
      signupBtn.disabled = true;

      try {
        // Call backend API
        const response = await registerUser({
          fullname,
          email,
          password,
          location,
          role,
          securityQuestion,
          securityAnswer,
        });

        // Store token
        setAuthToken(response.token);
        localStorage.setItem("loggedInUser", JSON.stringify(response));

        // Show success message
        if (typeof showToast === "function") {
          showToast("Account created successfully! Redirecting...", "success");
        } else {
          alert("Account created successfully! Redirecting...");
        }

        // Redirect to dashboard or login
        setTimeout(() => {
          if (response.role === "user") {
            window.location.href = "user-dashboard.html";
          } else if (response.role === "provider") {
            window.location.href = "provider-dashboard.html";
          } else {
            window.location.href = "admin-dashboard.html";
          }
        }, 1500);
      } catch (error) {
        errorMsg.textContent = error.message || "Error creating account. Please try again.";
        signupBtn.textContent = "Sign Up";
        signupBtn.disabled = false;
      }
    });
  }
});

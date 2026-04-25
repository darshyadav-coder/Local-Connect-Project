// forgot-password.js
document.addEventListener("DOMContentLoaded", () => {
  const forgotForm = document.getElementById("forgot-password-form");
  const securityForm = document.getElementById("security-form");
  const newPasswordForm = document.getElementById("new-password-form");

  let currentUser = null;

  if (forgotForm) {
    forgotForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleEmailSubmit();
    });
  }

  if (securityForm) {
    securityForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSecurityAnswer();
    });
  }

  if (newPasswordForm) {
    newPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handlePasswordReset();
    });
  }

  function handleEmailSubmit() {
    const email = document.getElementById("email").value.trim().toLowerCase();

    // Check if user exists
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const user = registeredUsers.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      showToast("No account found with this email address.", "error");
      return;
    }

    currentUser = user;
    
    // Check user profile first, then fall back to registration data
    const userProfiles = JSON.parse(localStorage.getItem("userProfiles")) || {};
    const profile = userProfiles[email] || {};
    
    const question = profile.securityQuestion || user.securityQuestion || "What is your favorite color?";
    const answer = (profile.securityAnswer || user.securityAnswer || "blue").toLowerCase();
    
    // Store the answer temporarily in currentUser for verification (or fetch again later)
    currentUser.expectedAnswer = answer;

    document.getElementById("security-question-text").textContent = question;
    document.getElementById("reset-form").classList.add("hidden");
    document.getElementById("security-question").classList.remove("hidden");

    // Simulate email notification
    simulateEmailNotification(email, "password_reset");
  }

  function handleSecurityAnswer() {
    const answer = document.getElementById("answer").value.trim().toLowerCase();

    if (answer === currentUser.expectedAnswer) {
      document.getElementById("security-question").classList.add("hidden");
      document.getElementById("new-password").classList.remove("hidden");
    } else {
      showToast("Incorrect answer. Please try again.", "error");
    }
  }

  function handlePasswordReset() {
    const newPassword = document.getElementById("new-password-input").value;
    const confirmPassword = document.getElementById("confirm-password-input").value;

    if (newPassword !== confirmPassword) {
      showToast("Passwords don't match.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters long.", "error");
      return;
    }

    // Update password
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const userIndex = registeredUsers.findIndex((u) => u.email === currentUser.email);

    if (userIndex > -1) {
      registeredUsers[userIndex].password = newPassword;
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

      // Simulate email notification
      simulateEmailNotification(currentUser.email, "password_changed");

      showToast("✅ Password reset successfully! Redirecting to login...", "success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    }
  }
});

// Simulate email/SMS notifications
function simulateEmailNotification(email, type) {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

  let message = "";
  let subject = "";

  switch (type) {
    case "password_reset":
      subject = "Password Reset Request";
      message = `A password reset request was made for your account (${email}). If this wasn't you, please contact support.`;
      break;
    case "password_changed":
      subject = "Password Changed";
      message = `Your password has been successfully changed for account (${email}).`;
      break;
    case "booking_confirmed":
      subject = "Booking Confirmed";
      message = `Your booking has been confirmed. We'll notify you when a provider is assigned.`;
      break;
    case "booking_completed":
      subject = "Service Completed";
      message = `Your service has been completed. Please provide feedback in your dashboard.`;
      break;
  }

  notifications.push({
    id: Date.now().toString(),
    email: email,
    type: type,
    subject: subject,
    message: message,
    timestamp: new Date().toISOString(),
    read: false,
  });

  localStorage.setItem("notifications", JSON.stringify(notifications));

  // Show toast notification using global utility
  if (typeof showToast === "function") {
    showToast(`📧 ${subject}`, "info");
  }
}
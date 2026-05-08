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

  async function handleEmailSubmit() {
    const email = document.getElementById("email").value.trim().toLowerCase();

    try {
      const data = await forgotPassword(email);
      
      currentUser = { email: data.email };
      
      document.getElementById("security-question-text").textContent = data.securityQuestion;
      document.getElementById("reset-form").classList.add("hidden");
      document.getElementById("security-question").classList.remove("hidden");
    } catch (error) {
      console.error("Forgot password error:", error);
      showToast(error.message || "Failed to find account.", "error");
    }
  }

  async function handleSecurityAnswer() {
    const answer = document.getElementById("answer").value.trim();
    
    // In this simplified flow, we'll wait for the next step to send everything
    // or we can verify now. The backend has verifySecurityAnswer(email, answer, newPassword)
    // so we'll just move to the next screen and send all 3 at once.
    
    document.getElementById("security-question").classList.add("hidden");
    document.getElementById("new-password").classList.remove("hidden");
  }

  async function handlePasswordReset() {
    const answer = document.getElementById("answer").value.trim();
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

    try {
      await resetPassword(currentUser.email, answer, newPassword);

      showToast("✅ Password reset successfully! Redirecting to login...", "success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } catch (error) {
      console.error("Reset error:", error);
      showToast("❌ Failed to reset password: " + error.message, "error");
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
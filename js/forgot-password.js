// forgot-password.js
document.addEventListener("DOMContentLoaded", () => {
    const forgotForm = document.getElementById("forgot-password-form");
    const securityForm = document.getElementById("security-form");
    const newPasswordForm = document.getElementById("new-password-form");

    let currentUser = null;

    forgotForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleEmailSubmit();
    });

    securityForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSecurityAnswer();
    });

    newPasswordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handlePasswordReset();
    });

    function handleEmailSubmit() {
        const email = document.getElementById("email").value.trim().toLowerCase();

        // Check if user exists
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
        const user = registeredUsers.find(u => u.email.toLowerCase() === email);

        if (!user) {
            alert("No account found with this email address.");
            return;
        }

        currentUser = user;

        // Load security question (in real app, this would be stored securely)
        const userProfiles = JSON.parse(localStorage.getItem("userProfiles")) || {};
        const profile = userProfiles[email] || {};

        if (!profile.securityQuestion) {
            // Set a default security question for demo
            profile.securityQuestion = "What is your favorite color?";
            profile.securityAnswer = "blue"; // Default answer
            userProfiles[email] = profile;
            localStorage.setItem("userProfiles", JSON.stringify(userProfiles));
        }

        document.getElementById("security-question-text").textContent = profile.securityQuestion;
        document.getElementById("reset-form").style.display = "none";
        document.getElementById("security-question").style.display = "block";

        // Simulate email notification
        simulateEmailNotification(email, "password_reset");
    }

    function handleSecurityAnswer() {
        const answer = document.getElementById("answer").value.trim().toLowerCase();

        const userProfiles = JSON.parse(localStorage.getItem("userProfiles")) || {};
        const profile = userProfiles[currentUser.email] || {};

        if (answer === (profile.securityAnswer || "blue").toLowerCase()) {
            document.getElementById("security-question").style.display = "none";
            document.getElementById("new-password").style.display = "block";
        } else {
            alert("Incorrect answer. Please try again.");
        }
    }

    function handlePasswordReset() {
        const newPassword = document.getElementById("new-password-input").value;
        const confirmPassword = document.getElementById("confirm-password-input").value;

        if (newPassword !== confirmPassword) {
            alert("Passwords don't match.");
            return;
        }

        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        // Update password
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
        const userIndex = registeredUsers.findIndex(u => u.email === currentUser.email);

        if (userIndex > -1) {
            registeredUsers[userIndex].password = newPassword;
            localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

            // Simulate email notification
            simulateEmailNotification(currentUser.email, "password_changed");

            alert("✅ Password reset successfully! You can now login with your new password.");
            window.location.href = "login.html";
        }
    }
});

// Simulate email/SMS notifications
function simulateEmailNotification(email, type) {
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

    let message = "";
    let subject = "";

    switch(type) {
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
        read: false
    });

    localStorage.setItem("notifications", JSON.stringify(notifications));

    // Show toast notification
    showNotificationToast(`📧 ${subject}`);
}

function showNotificationToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast success";
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 1000;
        font-weight: bold;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
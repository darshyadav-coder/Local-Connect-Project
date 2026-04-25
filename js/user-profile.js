// user-profile.js
window.logout = function () {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
};

document.addEventListener("DOMContentLoaded", () => {
  // Authentication Check
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser || loggedInUser.role !== "user") {
    alert("❌ You must log in as a User to view this page.");
    window.location.href = "login.html";
    return;
  }

  // Load user profile data
  loadUserProfile(loggedInUser);

  // Handle form submission
  const profileForm = document.getElementById("profile-form");
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    updateUserProfile(loggedInUser);
  });
});

function loadUserProfile(user) {
  document.getElementById("profile-name").textContent =
    user.fullname || user.email.split("@")[0];
  document.getElementById("profile-email").textContent = user.email;

  // Load additional profile data from localStorage
  const userProfiles = JSON.parse(localStorage.getItem("userProfiles")) || {};
  const profile = userProfiles[user.email] || {};

  document.getElementById("fullname").value =
    profile.fullname || user.fullname || "";
  document.getElementById("phone").value = profile.phone || "";
  document.getElementById("address").value = profile.address || "";

  // Load security info from registeredUsers if not in profile
  const registeredUsers =
    JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const userRecord = registeredUsers.find((u) => u.email === user.email) || {};

  document.getElementById("security-question").value =
    profile.securityQuestion ||
    userRecord.securityQuestion ||
    "What is your favorite color?";
  document.getElementById("security-answer").value =
    profile.securityAnswer || userRecord.securityAnswer || "";
}

function updateUserProfile(user) {
  const fullname = document.getElementById("fullname").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const securityQuestion = document.getElementById("security-question").value;
  const securityAnswer = document
    .getElementById("security-answer")
    .value.trim();
  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Validation
  if (!fullname) {
    alert("Full name is required.");
    return;
  }

  if (phone && !/^[6-9]\d{9}$/.test(phone)) {
    alert("Enter valid 10-digit phone number starting with 6-9");
    return;
  }

  // Password change validation
  if (newPassword) {
    if (!currentPassword) {
      alert("Please enter your current password to change it.");
      return;
    }

    // In a real app, you'd verify the current password against a hashed version
    // For demo purposes, we'll just check if it matches the stored password
    const registeredUsers =
      JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const userRecord = registeredUsers.find((u) => u.email === user.email);

    if (userRecord && userRecord.password !== currentPassword) {
      alert("Current password is incorrect.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords don't match.");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }
  }

  // Update user profile data
  const userProfiles = JSON.parse(localStorage.getItem("userProfiles")) || {};
  userProfiles[user.email] = {
    fullname: fullname,
    phone: phone,
    address: address,
    securityQuestion: securityQuestion,
    securityAnswer: securityAnswer,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem("userProfiles", JSON.stringify(userProfiles));

  // Update password if provided
  if (newPassword) {
    const registeredUsers =
      JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const userIndex = registeredUsers.findIndex((u) => u.email === user.email);
    if (userIndex > -1) {
      registeredUsers[userIndex].password = newPassword;
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
    }
  }

  // Update logged in user session
  const updatedUser = { ...user, fullname: fullname };
  localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

  alert("✅ Profile updated successfully!");
  window.location.reload();
}

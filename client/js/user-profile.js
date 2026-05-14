// user-profile.js
window.logout = async function () {
  try {
    if (typeof logoutUser === "function") {
      await logoutUser();
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("authToken");
  window.location.href = "login.html";
};

document.addEventListener("DOMContentLoaded", async () => {
  // Authentication Check
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser || loggedInUser.role !== "user") {
    alert("❌ You must log in as a User to view this page.");
    window.location.href = "login.html";
    return;
  }

  // Load user profile data
  try {
    const profile = await getUserProfile();
    loadUserProfile(profile || loggedInUser);
  } catch (error) {
    console.error("Profile load error:", error);
    loadUserProfile(loggedInUser);
  }

  // Handle form submission
  const profileForm = document.getElementById("profile-form");
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await updateProfileLogic(loggedInUser);
  });
});

function loadUserProfile(profile) {
  document.getElementById("profile-name").textContent =
    profile.fullname || profile.name || profile.email.split("@")[0];
  document.getElementById("profile-email").textContent = profile.email;

  document.getElementById("fullname").value = profile.fullname || profile.name || "";
  document.getElementById("phone").value = profile.phone || "";
  document.getElementById("address").value = profile.address || "";

  if (profile.securityQuestion) {
    document.getElementById("security-question").value = profile.securityQuestion;
  }
  document.getElementById("security-answer").value = profile.securityAnswer || "";
}

async function updateProfileLogic(user) {
  const fullname = document.getElementById("fullname").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const securityQuestion = document.getElementById("security-question").value;
  const securityAnswer = document.getElementById("security-answer").value.trim();
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

  if (newPassword) {
    if (!currentPassword) {
      alert("Please enter your current password to change it.");
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

  try {
    const updateData = {
      name: fullname,
      phone: phone,
      address: address,
      securityQuestion: securityQuestion,
      securityAnswer: securityAnswer
    };

    if (newPassword) {
      updateData.currentPassword = currentPassword;
      updateData.newPassword = newPassword;
    }

    await updateUserProfile(updateData);

    // Update logged in user session
    const updatedUser = { ...user, fullname: fullname };
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

    alert("✅ Profile updated successfully!");
    window.location.reload();
  } catch (error) {
    console.error("Profile update error:", error);
    alert("❌ Failed to update profile: " + error.message);
  }
}

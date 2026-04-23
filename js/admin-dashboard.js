// admin-dashboard.js - Pure Frontend Dashboard Logic
window.logout = function () {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
};

document.addEventListener("DOMContentLoaded", () => {
  // 1. Auth Check
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser || loggedInUser.role !== "admin") {
    alert("❌ You must log in as an Admin to view this dashboard.");
    window.location.href = "login.html";
    return;
  }

  // 2. Fetch and Render
  renderAdminDashboard();
});

function renderAdminDashboard() {
  // Merge dummy accounts with any new real accounts that were created
  const dummyUsers = [
    {
      email: "user@gmail.com",
      role: "user",
      fullname: "Test User",
      location: "Global",
    },
    {
      email: "provider@gmail.com",
      role: "provider",
      fullname: "Test Provider",
      location: "Global",
    },
  ];
  const registeredUsers =
    JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const allUsers = [...dummyUsers, ...registeredUsers];

  // Fetch all bookings
  const allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];

  // Filter Stats
  const totalUsers = allUsers.filter((u) => u.role === "user");
  const totalProviders = allUsers.filter((u) => u.role === "provider");
  const emergencyRequests = allBookings.filter((b) => b.type === "emergency");

  // Populate Top Screen Counters
  document.getElementById("stat-users").textContent = totalUsers.length;
  document.getElementById("stat-providers").textContent = totalProviders.length;
  document.getElementById("stat-bookings").textContent = allBookings.length;
  document.getElementById("stat-emergencies").textContent =
    emergencyRequests.length;

  // Render Tables
  renderUsers(totalUsers, "users-body");
  renderUsers(totalProviders, "providers-body");
  renderGlobalBookings(allBookings);
  renderFeedback(allBookings);
}

function renderUsers(list, tableBodyId) {
  const tbody = document.getElementById(tableBodyId);
  tbody.innerHTML = "";
  if (list.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='3' style='text-align:center;'>No accounts found.</td></tr>";
    return;
  }
  list.forEach((u) => {
    tbody.innerHTML += `
            <tr>
                <td><strong>${u.fullname || "Anonymous"}</strong></td>
                <td><a href="mailto:${u.email}" style="color:var(--primary-color);text-decoration:none;">${u.email}</a></td>
                <td>${u.location || "N/A"}</td>
            </tr>
        `;
  });
}

function renderGlobalBookings(bookings) {
  const tbody = document.getElementById("bookings-body");
  tbody.innerHTML = "";
  if (bookings.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='7' style='text-align:center;'>No bookings found system-wide.</td></tr>";
    return;
  }

  // Sort by chronological order (newest first)
  [...bookings].reverse().forEach((b) => {
    let statusClass = "status-pending";
    if (b.status === "Completed") statusClass = "status-completed";
    if (b.status === "Cancelled" || b.status === "Rejected")
      statusClass = "status-cancelled";

    let paymentInfo = b.paymentStatus === 'Paid'
      ? `<span style="color:var(--accent-color); font-weight:bold;">Paid ✓<br><small style="color:var(--text-muted);">${b.paymentId || ''}</small></span>`
      : `<span style="color:var(--danger-color); font-weight:bold;">Unpaid</span>`;

    tbody.innerHTML += `
            <tr>
                <td>${b.customerName || b.userName}</td>
                <td><strong>${b.service}</strong></td>
                <td>${b.provider}</td>
                <td>${b.date}</td>
                <td><span class="${statusClass}">${b.status}</span></td>
                <td>${b.type === "emergency" ? '<span style="color:var(--danger-color); font-weight:bold;">Emergency 🚨</span>' : "Normal"}</td>
                <td>${paymentInfo}</td>
            </tr>
        `;
  });
}

function renderFeedback(bookings) {
  const tbody = document.getElementById("feedback-body");
  tbody.innerHTML = "";
  const feedbackList = bookings.filter((b) => b.feedback);

  if (feedbackList.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='6' style='text-align:center; color: var(--text-muted);'>No feedback submitted yet.</td></tr>";
    return;
  }

  feedbackList.forEach((b) => {
    tbody.innerHTML += `
            <tr>
                <td><strong>${b.service}</strong></td>
                <td>${b.provider}</td>
                <td>${b.customerName || b.userName}</td>
                <td>${b.feedback.rating}</td>
                <td style="font-style: italic;">"${b.feedback.comment}"</td>
                <td>${new Date(b.date).toLocaleDateString()}</td>
            </tr>
        `;
  });
}

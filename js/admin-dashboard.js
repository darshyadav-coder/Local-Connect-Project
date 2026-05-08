// admin-dashboard.js - Pure Frontend Dashboard Logic
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

document.addEventListener("DOMContentLoaded", () => {
  // 1. Auth Check
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser || loggedInUser.role !== "admin") {
    showToast("You must log in as an Admin to view this dashboard.", "error");
    setTimeout(() => (window.location.href = "login.html"), 1500);
    return;
  }

  // 2. Fetch and Render
  renderAdminDashboard();
});

async function renderAdminDashboard() {
  try {
    // Show loading states if possible
    document.getElementById("stat-users").textContent = "...";
    document.getElementById("stat-providers").textContent = "...";
    document.getElementById("stat-bookings").textContent = "...";
    document.getElementById("stat-emergencies").textContent = "...";

    // Fetch data from backend
    const [stats, allUsers, allBookings] = await Promise.all([
      getDashboardStats(),
      getAllUsers(),
      getAllBookings()
    ]);

    const users = allUsers.filter(u => u.role === "user");
    const providers = allUsers.filter(u => u.role === "provider");
    const emergencyRequests = allBookings.filter(b => b.type === "emergency");

    // Populate Top Screen Counters
    document.getElementById("stat-users").textContent = users.length;
    document.getElementById("stat-providers").textContent = providers.length;
    document.getElementById("stat-bookings").textContent = allBookings.length;
    document.getElementById("stat-emergencies").textContent = emergencyRequests.length;

    // Render Tables
    renderUsers(users, "users-body");
    renderUsers(providers, "providers-body");
    renderGlobalBookings(allBookings);
    renderFeedback(allBookings);
  } catch (error) {
    console.error("Admin dashboard error:", error);
    showToast("Failed to load dashboard data: " + error.message, "error");
  }
}

function renderUsers(list, tableBodyId) {
  const tbody = document.getElementById(tableBodyId);
  tbody.innerHTML = "";
  if (list.length === 0) {
    const tableId = tableBodyId === "users-body" ? "Users" : "Providers";
    tbody.innerHTML = createEmptyStateRow(
      `No ${tableId} Yet`,
      `There are no registered ${tableId.toLowerCase()} at this time.`,
      3,
    );
    return;
  }
  list.forEach((u) => {
    tbody.innerHTML += `
            <tr>
                <td><strong>${sanitizeInput(u.fullname || "Anonymous")}</strong></td>
                <td><a href="mailto:${sanitizeInput(u.email)}" class="no-decoration text-primary">${sanitizeInput(u.email)}</a></td>
                <td>${sanitizeInput(u.location || "N/A")}</td>
            </tr>
        `;
  });
}

function renderGlobalBookings(bookings) {
  const tbody = document.getElementById("bookings-body");
  tbody.innerHTML = "";
  if (bookings.length === 0) {
    tbody.innerHTML = createEmptyStateRow(
      "No Bookings Yet",
      "No service bookings have been placed system-wide.",
      7,
    );
    return;
  }

  // Sort by chronological order (newest first)
  [...bookings].reverse().forEach((b) => {
    let statusClass = "status-pending";
    if (b.status === "Completed") statusClass = "status-completed";
    if (b.status === "Cancelled" || b.status === "Rejected")
      statusClass = "status-cancelled";

    let paymentInfo =
      b.paymentStatus === "Paid"
        ? `<span class="text-accent bold">Paid ✓<br><small class="text-muted">${sanitizeInput(b.paymentId || "")}</small></span>`
        : `<span class="text-danger bold">Unpaid</span>`;

    tbody.innerHTML += `
            <tr>
                <td>${sanitizeInput(b.customerName || b.userName)}</td>
                <td><strong>${sanitizeInput(b.service)}</strong></td>
                <td>${sanitizeInput(b.provider)}</td>
                <td>${sanitizeInput(b.date)}</td>
                <td><span class="${statusClass}">${sanitizeInput(b.status)}</span></td>
                <td>${b.type === "emergency" ? '<span class="text-danger bold">Emergency 🚨</span>' : "Normal"}</td>
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
    tbody.innerHTML = createEmptyStateRow(
      "No Feedback Yet",
      "Customers haven't submitted any feedback yet.",
      6,
    );
    return;
  }

  feedbackList.forEach((b) => {
    tbody.innerHTML += `
            <tr>
                <td><strong>${sanitizeInput(b.service)}</strong></td>
                <td>${sanitizeInput(b.provider)}</td>
                <td>${sanitizeInput(b.customerName || b.userName)}</td>
                <td>${sanitizeInput(b.feedback.rating)}</td>
                <td class="italic">"${sanitizeInput(b.feedback.comment)}"</td>
                <td>${new Date(b.date).toLocaleDateString()}</td>
            </tr>
        `;
  });
}

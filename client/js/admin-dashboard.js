// admin-dashboard.js - Backend Integrated with Admin Actions
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
    // Show loading states
    document.getElementById("stat-users").textContent = "...";
    document.getElementById("stat-providers").textContent = "...";
    document.getElementById("stat-bookings").textContent = "...";
    document.getElementById("stat-emergencies").textContent = "...";

    // Fetch data from backend
    const [statsRes, userRes, providerRes, bookingRes] = await Promise.all([
      getDashboardStats(),
      getAllUsers("user"), // Now only fetching customers (role: "user")
      getProviders(),
      getAllBookings()
    ]);

    const stats = statsRes || {};
    const customers = userRes.users || [];
    const providerProfiles = providerRes.providers || [];
    const allBookings = bookingRes.bookings || [];
    const emergencyRequests = allBookings.filter(b => b.type === "emergency");

    // Populate Top Screen Counters using Aggregate Stats from Backend
    document.getElementById("stat-users").textContent = stats.totalUsers || customers.length;
    document.getElementById("stat-providers").textContent = stats.totalProviders || 0;
    document.getElementById("stat-bookings").textContent = stats.totalBookings || allBookings.length;
    document.getElementById("stat-emergencies").textContent = emergencyRequests.length;

    // We still need ALL users to match with provider profiles correctly
    // So we fetch them or just use the customers + providers logic.
    // Actually, getProviders returns profiles with user objects populated.
    
    // To show ALL providers in the providers table (even those without profiles), 
    // we need to fetch all providers too.
    const allProvidersRes = await getAllUsers("provider");
    const providerUsers = allProvidersRes.users || [];

    // Render Tables
    renderUsers(customers, "users-body");
    renderProviders(providerUsers, providerProfiles, "providers-body");
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
    tbody.innerHTML = createEmptyStateRow(
      `No Customers Yet`,
      `There are no registered customers at this time.`,
      4,
    );
    return;
  }
  list.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td><strong>${sanitizeInput(u.fullname || u.name || "Anonymous")}</strong></td>
        <td><a href="mailto:${sanitizeInput(u.email)}" class="no-decoration text-primary">${sanitizeInput(u.email)}</a></td>
        <td>${sanitizeInput(u.location || u.address || "N/A")}</td>
        <td>
            <button class="btn btn-sm btn-danger" onclick="adminDeleteUser('${u.id || u._id}')">Delete</button>
        </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderProviders(providerUsers, profiles, tableBodyId) {
  const tbody = document.getElementById(tableBodyId);
  tbody.innerHTML = "";
  
  if (providerUsers.length === 0) {
    tbody.innerHTML = createEmptyStateRow(
      `No Providers Yet`,
      `There are no registered service providers at this time.`,
      5,
    );
    return;
  }

  providerUsers.forEach((u) => {
    // Find the profile for this provider user
    const p = profiles.find(profile => 
      (profile.user && (profile.user._id === u._id || profile.user.id === u._id)) || 
      (profile.userId === u._id)
    );
    
    const tr = document.createElement("tr");
    
    let statusHtml = "";
    let actionsHtml = "";
    
    if (p) {
      statusHtml = p.isApproved 
        ? '<span class="status-badge status-accepted">Verified ✅</span>' 
        : '<span class="status-badge status-pending">Pending ⏳</span>';
      
      actionsHtml = `
          ${!p.isApproved ? `<button class="btn btn-sm btn-primary" onclick="adminApproveProvider('${p.id || p._id}')">Approve</button>` : ""}
          <button class="btn btn-sm btn-danger" onclick="adminDeleteUser('${u.id || u._id}')">Delete</button>
      `;
    } else {
      statusHtml = '<span class="status-badge" style="background:#f1f5f9; color:#64748b;">No Profile ⚠️</span>';
      actionsHtml = `
          <button class="btn btn-sm btn-accent" onclick="adminInitializeProvider('${u._id}')">Init & Verify</button>
          <button class="btn btn-sm btn-danger" onclick="adminDeleteUser('${u.id || u._id}')">Delete</button>
      `;
    }

    tr.innerHTML = `
        <td><strong>${sanitizeInput(u.fullname || u.name || "Anonymous")}</strong></td>
        <td><a href="mailto:${sanitizeInput(u.email)}" class="no-decoration text-primary">${sanitizeInput(u.email)}</a></td>
        <td>${sanitizeInput(p ? (p.experience || "N/A") : "Not Set")}</td>
        <td>${statusHtml}</td>
        <td>${actionsHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderGlobalBookings(bookings) {
  const tbody = document.getElementById("bookings-body");
  tbody.innerHTML = "";
  if (bookings.length === 0) {
    tbody.innerHTML = createEmptyStateRow(
      "No Bookings Yet",
      "No service bookings have been placed system-wide.",
      8,
    );
    return;
  }

  // Sort by Emergency first, then chronological order (newest first)
  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.type === "emergency" && b.type !== "emergency") return -1;
    if (a.type !== "emergency" && b.type === "emergency") return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  sortedBookings.forEach((b) => {
    const tr = document.createElement("tr");
    if (b.type === "emergency") tr.classList.add("priority-emergency");
    let statusClass = "status-pending";
    if (b.status === "Completed") statusClass = "status-completed";
    if (b.status === "Cancelled" || b.status === "Rejected") statusClass = "status-cancelled";

    let paymentInfo =
      b.paymentStatus === "Paid"
        ? `<span class="text-accent bold">Paid ✓<br><small class="text-muted">${sanitizeInput(b.paymentId || "")}</small></span>`
        : `<span class="text-danger bold">Unpaid</span>`;

    tr.innerHTML = `
        <td>${sanitizeInput(b.customerName || b.userName)}</td>
        <td><strong>${sanitizeInput(b.service)}</strong></td>
        <td><small>${sanitizeInput(b.serviceAddress || "N/A")}</small></td>
        <td>${sanitizeInput(b.provider !== "Unassigned" ? b.provider : "None")}</td>
        <td>${sanitizeInput(b.date)}</td>
        <td><span class="${statusClass}">${sanitizeInput(b.status)}</span></td>
        <td>${b.type === "emergency" ? '<span class="text-danger bold">Emergency 🚨</span>' : "Normal"}</td>
        <td>${paymentInfo}</td>
        <td>
            ${b.status === "Pending" ? `<button class="btn btn-sm btn-danger" onclick="adminCancelBooking('${b.id || b._id}')">Cancel</button>` : "-"}
        </td>
    `;
    tbody.appendChild(tr);
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

// ==========================
// ADMIN ACTIONS
// ==========================

window.adminDeleteUser = function (userId) {
  showConfirmDialog(
    "Delete User?",
    "Are you sure you want to permanently delete this user? This action cannot be undone.",
    async () => {
      try {
        await deleteUser(userId);
        showToast("✅ User deleted successfully.", "success");
        renderAdminDashboard();
      } catch (err) {
        console.error("Delete user error:", err);
        showToast("❌ Could not delete user: " + err.message, "error");
      }
    },
    null,
    "Delete",
    "Cancel"
  );
};

window.adminCancelBooking = function (bookingId) {
  showConfirmDialog(
    "Cancel Booking?",
    "Are you sure you want to cancel this booking as an admin?",
    async () => {
      try {
        // Fetch booking details first to get user email
        const booking = await getBooking(bookingId);

        await cancelBooking(bookingId);

        // Create notification for the user
        await createNotification({
          email: booking.userEmail,
          type: "booking_cancelled",
          subject: "Booking Cancelled by Admin",
          message: `Your booking for ${booking.service} has been cancelled by an administrator.`,
          data: { bookingId: bookingId, service: booking.service }
        });

        showToast("✅ Booking cancelled successfully.", "success");
        renderAdminDashboard();
      } catch (err) {
        console.error("Cancel booking error:", err);
        showToast("❌ Could not cancel booking: " + err.message, "error");
      }
    },
    null,
    "Yes, Cancel",
    "No"
  );
};

window.adminApproveProvider = async function (providerId) {
  showConfirmDialog(
    "Approve Provider?",
    "Are you sure you want to approve this service provider? They will be able to accept bookings immediately.",
    async () => {
      try {
        await approveProvider(providerId, true);
        showToast("✅ Provider approved successfully!", "success");
        renderAdminDashboard();
      } catch (err) {
        console.error("Approve provider error:", err);
        showToast("❌ Could not approve provider: " + err.message, "error");
      }
    },
    null,
    "Approve",
    "Cancel"
  );
};

window.adminInitializeProvider = async function (userId) {
  showConfirmDialog(
    "Initialize & Verify Provider?",
    "This user hasn't completed their service provider profile. Initializing will create a basic profile and verify them automatically.",
    async () => {
      try {
        // 1. Create a basic provider profile
        const response = await createProvider({
          userId: userId,
          servicesOffered: ["General Services"], // Default placeholder
          experience: "1+ Years",
          bio: "Verified professional service provider."
        });

        const providerId = response.provider?._id || response.provider?.id;

        if (providerId) {
          // 2. Approve it
          await approveProvider(providerId, true);
          showToast("✅ Provider profile created and verified!", "success");
        } else {
          showToast("✅ Provider role activated.", "success");
        }
        
        renderAdminDashboard();
      } catch (err) {
        console.error("Initialize provider error:", err);
        showToast("❌ Could not initialize provider: " + err.message, "error");
      }
    },
    null,
    "Initialize",
    "Cancel"
  );
};

// provider-dashboard.js - Backend Integrated
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

  if (!loggedInUser || loggedInUser.role !== "provider") {
    showToast(
      "You must log in as a Service Provider to view this dashboard.",
      "error",
    );
    setTimeout(() => (window.location.href = "login.html"), 1500);
    return;
  }

  // Load dynamic data perfectly
  renderProviderDashboard();
  renderAvailabilityCalendar();
});

async function renderProviderDashboard() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) return;

  const providerIdentifier = loggedInUser.fullname || loggedInUser.email.split("@")[0];

  try {
    // 1. Fetch Pending Bookings
    const pendingRes = await getAllBookings({ status: "Pending" });
    const pendingBookings = pendingRes.bookings || [];
    
    // 2. Fetch My Bookings (Accepted/Completed)
    const myRes = await getAllBookings({ provider: providerIdentifier });
    const myBookings = myRes.bookings || [];

    // Filter categories dynamically
    const pendingEmergency = pendingBookings.filter((b) => b.type === "emergency");
    const pendingNormal = pendingBookings.filter((b) => b.type === "normal");

    const myAccepted = myBookings.filter((b) => b.status === "Accepted");
    const myCompleted = myBookings.filter((b) => b.status === "Completed");

    // Render HTML Views
    renderEmergency(pendingEmergency);
    renderIncoming(pendingNormal);
    renderAccepted(myAccepted);
    renderFeedback(myCompleted);
  } catch (err) {
    console.error("Error loading provider dashboard:", err);
    showToast("❌ Failed to load dashboard data.", "error");
  }
}

function renderFeedback(completedBookings) {
  const feedbackBody = document.getElementById("feedback-body");
  const trustScoreEl = document.getElementById("trust-score");

  if (!feedbackBody || !trustScoreEl) return;

  feedbackBody.innerHTML = "";
  let totalRatings = 0;
  let feedbackCount = 0;

  if (completedBookings.length === 0) {
    feedbackBody.innerHTML = createEmptyStateRow(
      "No Completed Services",
      "Complete some bookings to receive feedback and build your trust score.",
      5,
    );
    trustScoreEl.textContent = "No data";
    return;
  }

  completedBookings.forEach((booking) => {
    if (booking.feedback) {
      // rating might be "5 Stars" or just "5"
      const ratingVal = typeof booking.feedback.rating === 'string' 
        ? (parseInt(booking.feedback.rating.split(" ")[1]) || parseInt(booking.feedback.rating) || 5)
        : (booking.feedback.rating || 5);
      
      totalRatings += ratingVal;
      feedbackCount++;

      feedbackBody.innerHTML += `
                <tr>
                    <td><strong class="bold">${booking.service}</strong></td>
                    <td>${booking.customerName}</td>
                    <td><span class="status-badge status-completed">Completed ✅</span></td>
                    <td>${booking.feedback.rating}</td>
                    <td class="italic">${booking.feedback.comment}</td>
                    <td>${new Date(booking.date).toLocaleDateString()}</td>
                </tr>
            `;
    } else {
      feedbackBody.innerHTML += `
                <tr>
                    <td><strong class="bold">${booking.service}</strong></td>
                    <td>${booking.customerName}</td>
                    <td><span class="status-badge status-completed">Completed ✅</span></td>
                    <td class="text-muted">No rating</td>
                    <td class="text-muted">No feedback yet</td>
                    <td>${new Date(booking.date).toLocaleDateString()}</td>
                </tr>
            `;
    }
  });

  // Calculate Trust Score
  const completionRate =
    completedBookings.length > 0
      ? (feedbackCount / completedBookings.length) * 100
      : 0;
  const avgRating = feedbackCount > 0 ? totalRatings / feedbackCount : 0;
  const trustScore = Math.round(avgRating * 0.7 + completionRate * 0.3);

  trustScoreEl.textContent = `${trustScore}/100 (${avgRating.toFixed(1)}⭐ avg, ${feedbackCount}/${completedBookings.length} feedback)`;
}

function renderEmergency(requests) {
  const container = document.getElementById("emergency-requests-container");
  if (!container) return;
  
  container.innerHTML = "";
  if (requests.length === 0) {
    container.innerHTML = `<p class="text-muted text-center">No emergency requests right now.</p>`;
    return;
  }

  requests.forEach((req) => {
    let paymentInfo =
      req.paymentStatus === "Paid"
        ? `<span class="text-success bold">Paid ✓</span>`
        : `<span class="text-danger bold">Unpaid</span>`;

    container.innerHTML += `
            <div class="request-card emergency-card">
                <p><strong class="bold">Service:</strong> ${req.service}</p>
                <p><strong class="bold">Customer:</strong> ${req.customerName}</p>
                <p><strong class="bold">Phone:</strong> ${req.phone}</p>
                <p><strong class="bold">Payment:</strong> ${paymentInfo}</p>
                <p class="text-danger bold">🚨 Time: Immediate Action Required!</p>
                <div class="modal-btn-group mt-2">
                    <button class="btn btn-danger btn-flex" onclick="acceptBooking('${req._id || req.id}')">Accept</button>
                    <button class="btn btn-muted btn-flex" onclick="rejectBooking('${req._id || req.id}')">Decline</button>
                </div>
            </div>
        `;
  });
}

function renderIncoming(requests) {
  const tbody = document.getElementById("incoming-requests-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  if (requests.length === 0) {
    tbody.innerHTML = createEmptyStateRow(
      "No Incoming Requests",
      "All caught up! Check back later for new service requests.",
    );
    return;
  }

  requests.forEach((req) => {
    let paymentInfo =
      req.paymentStatus === "Paid"
        ? `<span class="text-success bold">Paid ✓</span>`
        : `<span class="text-danger bold">Unpaid</span>`;

    tbody.innerHTML += `
            <tr>
                <td>${req.customerName}</td>
                <td><strong class="bold">${req.service}</strong></td>
                <td>${req.date}</td>
                <td>Normal</td>
                <td>${paymentInfo}</td>
                <td>
                    <button class="btn btn-sm" onclick="acceptBooking('${req._id || req.id}')">Accept</button>
                    <button class="btn btn-sm btn-muted" onclick="rejectBooking('${req._id || req.id}')">Decline</button>
                </td>
            </tr>
        `;
  });
}

function renderAccepted(requests) {
  const container = document.getElementById("accepted-bookings-container");
  if (!container) return;
  
  container.innerHTML = "";
  if (requests.length === 0) {
    container.innerHTML = `<p class="text-muted text-center">You haven't accepted any active bookings yet.</p>`;
    return;
  }

  requests.forEach((req) => {
    let paymentInfo = "";
    if (req.paymentStatus === "Paid") {
      paymentInfo = `<span class="text-success bold">Paid ✓</span>`;
    } else if (req.paymentMethod === "Cash") {
      paymentInfo = `<span class="text-warning bold">Cash on Service</span> <span class="text-danger small">(To be collected)</span>`;
    } else {
      paymentInfo = `<span class="text-danger bold">Unpaid (Online)</span>`;
    }

    container.innerHTML += `
            <div class="card text-left">
                <p><strong class="bold">Customer:</strong> ${req.customerName}</p>
                <p><strong class="bold">Phone:</strong> <a href="tel:${req.phone}" class="text-primary no-decoration">${req.phone}</a></p>
                <p><strong class="bold">Service:</strong> ${req.service} (Scheduled: ${req.date})</p>
                <p><strong class="bold">Payment:</strong> ${paymentInfo}</p>
                <p class="text-primary bold mt-2">Status: In Progress 🛠️</p>
                <div class="modal-btn-group mt-3">
                  <button class="btn btn-flex" onclick="completeBooking('${req._id || req.id}')">Mark as Completed ✅</button>
                  ${req.paymentMethod === "Cash" && req.paymentStatus !== "Paid" ? `<button class="btn btn-success-outline btn-flex" onclick="confirmCashPayment('${req._id || req.id}')">Confirm Cash Received 💵</button>` : ""}
                </div>
            </div>
        `;

  });
}

// ==========================
// ACTIONS
// ==========================

window.acceptBooking = function (id) {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const providerIdentifier = loggedInUser.fullname || loggedInUser.email.split("@")[0];

  showConfirmDialog(
    "Accept Booking?",
    `Are you sure you want to accept this booking?`,
    async () => {
      try {
        // Fetch booking details first to get user email
        const booking = await getBooking(id);
        
        // 1. Assign provider
        await assignProvider(id, providerIdentifier);
        // 2. Update status to Accepted
        await updateBookingStatus(id, "Accepted");

        // 3. Create notification for the user
        await createNotification({
          email: booking.userEmail,
          type: "provider_assigned",
          subject: "Provider Assigned",
          message: `${providerIdentifier} has been assigned to your ${booking.service} booking on ${booking.date}.`,
          data: { bookingId: id, provider: providerIdentifier }
        });

        showToast("✅ Booking accepted successfully!", "success");
        setTimeout(() => renderProviderDashboard(), 800);
      } catch (err) {
        console.error("Accept error:", err);
        showToast("❌ Could not accept booking: " + err.message, "error");
      }
    },
    null,
    "Accept",
    "Cancel",
  );
};

window.rejectBooking = function (id) {
  showConfirmDialog(
    "Decline Booking?",
    `Are you sure you want to decline this request?`,
    async () => {
      try {
        await updateBookingStatus(id, "Rejected");
        showToast("✅ Booking declined.", "success");
        setTimeout(() => renderProviderDashboard(), 800);
      } catch (err) {
        console.error("Decline error:", err);
        showToast("❌ Could not decline booking: " + err.message, "error");
      }
    },
    null,
    "Yes, Decline",
    "Keep It",
  );
};

window.completeBooking = function (id) {
  showConfirmDialog(
    "Mark as Completed?",
    `Mark this service as completed?`,
    async () => {
      try {
        const booking = await getBooking(id);
        
        const updateData = { status: "Completed" };
        
        // If it's cash and not paid yet, maybe it's paid now? 
        // For simplicity, let's assume completion means cash was collected if it was a cash booking
        if (booking.paymentMethod === "Cash" && booking.paymentStatus !== "Paid") {
          updateData.paymentStatus = "Paid";
          updateData.paymentId = "cash_" + Date.now();
        }

        await updateBooking(id, updateData);

        await createNotification({
          email: booking.userEmail,
          type: "booking_completed",
          subject: "Service Completed",
          message: `Your ${booking.service} service has been completed. ${updateData.paymentStatus === "Paid" ? "Payment received via Cash." : "Please pay online in your dashboard."}`,
          data: { bookingId: id, service: booking.service }
        });

        showToast("✅ Booking marked as completed!", "success");
        setTimeout(() => renderProviderDashboard(), 800);
      } catch (err) {
        console.error("Completion error:", err);
        showToast("❌ Could not complete booking: " + err.message, "error");
      }
    }
  );
};

window.confirmCashPayment = function (id) {
  showConfirmDialog(
    "Confirm Cash Payment?",
    "Have you collected the cash payment from the customer?",
    async () => {
      try {
        await updateBooking(id, { 
          paymentStatus: "Paid", 
          paymentId: "cash_" + Date.now() 
        });
        showToast("✅ Payment confirmed!", "success");
        setTimeout(() => renderProviderDashboard(), 800);
      } catch (err) {
        console.error("Cash payment confirmation error:", err);
        showToast("❌ Could not confirm payment: " + err.message, "error");
      }
    }
  );
};


// ==========================
// AVAILABILITY CALENDAR
// ==========================

function renderAvailabilityCalendar() {
  const calendarContainer = document.getElementById("availability-calendar");
  if (!calendarContainer) return;
  
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const availability =
    JSON.parse(localStorage.getItem("providerAvailability")) || {};
  const providerAvailability = availability[loggedInUser.email] || {};

  // Generate next 7 days
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  calendarContainer.innerHTML = "";

  // Add day headers
  days.forEach((day) => {
    const dayHeader = document.createElement("div");
    dayHeader.textContent = day;
    dayHeader.className = "calendar-header";
    calendarContainer.appendChild(dayHeader);
  });

  // Add availability slots for next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    const daySlot = document.createElement("div");
    daySlot.className = "calendar-day calendar-slot";
    daySlot.dataset.date = dateStr;

    const isAvailable = providerAvailability[dateStr];
    if (isAvailable) {
      daySlot.classList.add("slot-available");
    }

    daySlot.innerHTML = `
      <div class="slot-date">${date.getDate()}</div>
      <div class="slot-status">${isAvailable ? "Available" : "Unavailable"}</div>
    `;

    daySlot.addEventListener("click", () =>
      toggleDayAvailability(loggedInUser.email, dateStr),
    );

    calendarContainer.appendChild(daySlot);
  }

  // Add toggle availability button functionality
  const toggleBtn = document.getElementById("toggle-availability");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const allAvailable = Object.values(providerAvailability).every((v) => v);
      const newAvailability = !allAvailable;

      const availability =
        JSON.parse(localStorage.getItem("providerAvailability")) || {};
      availability[loggedInUser.email] = availability[loggedInUser.email] || {};

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        availability[loggedInUser.email][dateStr] = newAvailability;
      }

      localStorage.setItem(
        "providerAvailability",
        JSON.stringify(availability),
      );
      renderAvailabilityCalendar();

      showToast(
        `${newAvailability ? "Available" : "Unavailable"} for the next 7 days!`,
        "info",
      );
    });
  }
}

function toggleDayAvailability(providerEmail, dateStr) {
  const availability =
    JSON.parse(localStorage.getItem("providerAvailability")) || {};
  if (!availability[providerEmail]) availability[providerEmail] = {};

  availability[providerEmail][dateStr] = !availability[providerEmail][dateStr];
  localStorage.setItem("providerAvailability", JSON.stringify(availability));

  renderAvailabilityCalendar();
}

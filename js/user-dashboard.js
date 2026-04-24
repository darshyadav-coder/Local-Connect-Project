// Viva: Pure Frontend Logic for User Dashboard Operations
window.logout = function () {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
};

document.addEventListener("DOMContentLoaded", () => {
  // 1. Authentication Check
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser || loggedInUser.role !== "user") {
    alert("❌ You must log in as a User to view this dashboard.");
    window.location.href = "login.html";
    return;
  }

  // Load notifications
  loadNotifications(loggedInUser.email);

  // 2. Data Retrieval (Simulating Database Fetch)
  const allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];

  // Filter bookings belonging strictly to this user
  const userBookings = allBookings.filter(
    (b) => b.userEmail === loggedInUser.email
  );

  // 3. Update Statistics UI
  document.getElementById("total-bookings").textContent = userBookings.length;
  document.getElementById("pending-requests").textContent = userBookings.filter(
    (b) => b.status === "Pending"
  ).length;
  document.getElementById("completed-services").textContent =
    userBookings.filter((b) => b.status === "Completed").length;

  // 4. Render Table
  const tbody = document.getElementById("bookings-body");
  tbody.innerHTML = "";

  if (userBookings.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='6' class='text-center'>No bookings found. Start a new booking!</td></tr>";
  }

  userBookings.forEach((booking) => {
    const tr = document.createElement("tr");

    // Styling status creatively based on our CSS classes
    let statusClass = "status-pending";
    if (booking.status === "Completed") statusClass = "status-completed";
    if (booking.status === "Cancelled" || booking.status === "Rejected")
      statusClass = "status-cancelled";

    // Payment logic
    let paymentInfo =
      booking.paymentStatus === "Paid"
        ? `<span class="text-success bold">Paid ✓<br><small class="text-muted small">${booking.paymentId || ""}</small></span>`
        : `<span class="text-danger bold">Unpaid</span>`;

    // Action / Feedback Logic
    let feedbackHtml = `<td>-</td>`;
    if (booking.status === "Pending") {
      feedbackHtml = `<td>
                <button class="btn btn-sm btn-danger" onclick="cancelBooking('${booking.id}')">Cancel</button>
                <button class="btn btn-sm" onclick="rescheduleBooking('${booking.id}', '${booking.date}')">Reschedule</button>
            </td>`;
    } else if (booking.status === "Completed") {
      if (booking.feedback) {
        feedbackHtml = `<td><span class="text-success bold">✓ Feedback Given</span></td>`;
      } else {
        feedbackHtml = `<td><button class="btn btn-sm" onclick="openFeedback('${booking.id}', '${booking.service}')">Give Feedback</button></td>`;
      }
    }

    // Table Injection
    tr.innerHTML = `
            <td>
                <strong class="bold">${booking.service}</strong><br>
                <small>${booking.type === "emergency" ? '<span class="text-danger bold">🚨 Emergency</span>' : "Normal"}</small>
            </td>
            <td>${booking.date}</td>
            <td><span class="${statusClass}">${booking.status}</span></td>
            <td>${paymentInfo}</td>
            <td>${booking.provider !== "Unassigned" ? booking.provider : "Waiting..."}</td>
            ${feedbackHtml}
        `;
    tbody.appendChild(tr);
  });
});

// Feedback Action
window.openFeedback = function (bookingId, serviceName) {
  const feedbackSection = document.getElementById("feedback-section");
  feedbackSection.classList.remove("hidden");
  document.getElementById("service-id").value = bookingId;
  document.getElementById("service-name").textContent = `Providing Feedback for: ${serviceName}`;

  // Scroll down to feedback section
  feedbackSection.scrollIntoView({ behavior: "smooth" });
};

// Handle Feedback Submission
const feedbackForm = document.getElementById("feedback-form");
if (feedbackForm) {
  feedbackForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const bookingId = document.getElementById("service-id").value;
    const rating = e.target.rating.value;
    const comment = e.target.Comment.value;

    // Fetch "Database"
    let allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];

    // Find specific record and mutate it
    const bIndex = allBookings.findIndex((b) => b.id === bookingId);
    if (bIndex > -1) {
      allBookings[bIndex].feedback = { rating, comment };
      localStorage.setItem("allBookings", JSON.stringify(allBookings));

      alert("✅ Thank you for your feedback! It helps us improve.");
      window.location.reload();
    }
  });
}

// Handle Booking Cancellation
window.cancelBooking = function (bookingId) {
  showConfirmDialog(
    "Cancel Booking?",
    "Are you sure you want to cancel this booking?",
    () => {
      let allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];
      const bIndex = allBookings.findIndex((b) => b.id === bookingId);

      if (bIndex > -1) {
        allBookings[bIndex].status = "Cancelled";
        localStorage.setItem("allBookings", JSON.stringify(allBookings));
        showToast("✅ Booking cancelled successfully.");
        setTimeout(() => window.location.reload(), 1500);
      }
    }
  );
};

// Handle Booking Rescheduling
window.rescheduleBooking = function (bookingId, currentDate) {
  // Create a custom input dialog instead of prompt()
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  const dialogContent = document.createElement("div");
  dialogContent.className = "modal-dialog";

  dialogContent.innerHTML = `
        <h2 class="text-primary">Reschedule Booking</h2>
        <p class="text-muted">
            Current date: <strong class="bold">${currentDate}</strong><br>
            Enter a new date (YYYY-MM-DD)
        </p>
        <input type="date" id="new-date-input" class="search-input mb-3">
        <div class="modal-btn-group">
            <button id="cancel-reschedule" class="btn btn-muted btn-flex">Cancel</button>
            <button id="confirm-reschedule" class="btn btn-flex">Reschedule</button>
        </div>
    `;

  modal.appendChild(dialogContent);
  document.body.appendChild(modal);

  // Set min date to today
  const dateInput = dialogContent.querySelector("#new-date-input");
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
  dateInput.value = currentDate;

  // Event handlers
  dialogContent.querySelector("#cancel-reschedule").addEventListener("click", () => {
      modal.remove();
    });

  dialogContent.querySelector("#confirm-reschedule").addEventListener("click", () => {
      const newDate = dateInput.value;

      if (!newDate) {
        showToast("❌ Please select a date.", "error");
        return;
      }

      if (newDate === currentDate) {
        showToast("❌ Please select a different date.", "warning");
        return;
      }

      if (newDate < today) {
        showToast("❌ Please select a future date.", "error");
        return;
      }

      modal.remove();

      // Confirm action
      showConfirmDialog(
        "Confirm Reschedule?",
        `Are you sure you want to reschedule to ${newDate}?`,
        () => {
          let allBookings =
            JSON.parse(localStorage.getItem("allBookings")) || [];
          const bIndex = allBookings.findIndex((b) => b.id === bookingId);

          if (bIndex > -1) {
            allBookings[bIndex].date = newDate;
            allBookings[bIndex].status = "Pending"; // Reset status when rescheduled
            localStorage.setItem("allBookings", JSON.stringify(allBookings));
            showToast("✅ Booking rescheduled successfully.", "success");
            setTimeout(() => window.location.reload(), 1500);
          } else {
            showToast(
              "❌ Could not find booking. Please refresh and try again.",
              "error"
            );
          }
        },
        null,
        "Yes, Reschedule",
        "Cancel"
      );
    });
};

// Load and display notifications
function loadNotifications(userEmail) {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  const userNotifications = notifications
    .filter((n) => n.email === userEmail)
    .slice(-5); // Last 5 notifications

  if (userNotifications.length > 0) {
    const notificationsSection = document.getElementById("notifications-section");
    const notificationsList = document.getElementById("notifications-list");

    notificationsSection.classList.remove("hidden");
    notificationsList.innerHTML = "";

    userNotifications.reverse().forEach((notification) => {
      const notificationDiv = document.createElement("div");
      notificationDiv.className = `notification ${notification.read ? "read" : "unread"}`;
      
      notificationDiv.innerHTML = `
                <div class="notification-item">
                    <div>
                        <strong class="bold">${notification.subject}</strong>
                        <p class="text-muted small">${notification.message}</p>
                        <small class="text-muted small">${new Date(notification.timestamp).toLocaleString()}</small>
                    </div>
                    ${!notification.read ? '<span class="text-success bold">●</span>' : ""}
                </div>
            `;

      notificationsList.appendChild(notificationDiv);

      // Mark as read when clicked
      notificationDiv.addEventListener("click", () => {
        if (!notification.read) {
          notification.read = true;
          localStorage.setItem("notifications", JSON.stringify(notifications));
          notificationDiv.classList.add("read");
          notificationDiv.querySelector(".text-success")?.remove();
        }
      });
    });
  }
}
// Viva: Pure Frontend Logic for User Dashboard Operations
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
  // 1. Authentication Check
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser || loggedInUser.role !== "user") {
    alert("❌ You must log in as a User to view this dashboard.");
    window.location.href = "login.html";
    return;
  }

  // Load notifications
  loadNotifications(loggedInUser.email);

  // 2. Data Retrieval (Fetching from Backend)
  getMyBookings(loggedInUser.email)
    .then((response) => {
      const userBookings = response.bookings || [];
      // 3. Update Statistics UI
      document.getElementById("total-bookings").textContent =
        userBookings.length;
      document.getElementById("pending-requests").textContent =
        userBookings.filter((b) => b.status === "Pending").length;
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
        let statusText = booking.status;
        if (booking.status === "Accepted") {
          statusClass = "status-accepted";
          statusText = "Provider Confirmed";
        }
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
                <button class="btn btn-sm btn-primary" onclick="editBooking('${booking.id}')" title="Edit booking details">Edit</button>
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
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>${paymentInfo}</td>
            <td>${booking.provider !== "Unassigned" ? booking.provider : "Waiting..."}</td>
            ${feedbackHtml}
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Error fetching bookings:", err);
      document.getElementById("bookings-body").innerHTML =
        "<tr><td colspan='6' class='text-center text-danger'>Failed to load bookings from backend.</td></tr>";
    });
});

// Feedback Action
window.openFeedback = function (bookingId, serviceName) {
  const feedbackSection = document.getElementById("feedback-section");
  feedbackSection.classList.remove("hidden");
  document.getElementById("service-id").value = bookingId;
  document.getElementById("service-name").textContent =
    `Providing Feedback for: ${serviceName}`;

  // Scroll down to feedback section
  feedbackSection.scrollIntoView({ behavior: "smooth" });
};

// Handle Feedback Submission
document.getElementById("feedback-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const bookingId = document.getElementById("service-id").value;
  const rating = e.target.rating.value;
  const comment = e.target.Comment.value;

  addBookingFeedback(bookingId, { rating, comment })
    .then(() => {
      showToast("✅ Thank you for your feedback!");
      setTimeout(() => window.location.reload(), 1500);
    })
    .catch((err) => {
      console.error("Feedback error:", err);
      showToast("❌ Failed to submit feedback: " + err.message, "error");
    });
});

// Handle Booking Cancellation
window.cancelBooking = function (bookingId) {
  showConfirmDialog(
    "Cancel Booking?",
    "Are you sure you want to cancel this booking?",
    async () => {
      try {
        await cancelBooking(bookingId);

        showToast("✅ Booking cancelled successfully.");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        console.error("Cancellation error:", err);
        showToast("❌ Failed to cancel booking: " + err.message, "error");
      }
    },
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
  dialogContent
    .querySelector("#cancel-reschedule")
    .addEventListener("click", () => {
      modal.remove();
    });

  dialogContent
    .querySelector("#confirm-reschedule")
    .addEventListener("click", () => {
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
        async () => {
          try {
            await updateBooking(bookingId, { date: newDate, status: "Pending" });
            showToast("✅ Booking rescheduled successfully.", "success");
            setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
            console.error("Reschedule error:", err);
            showToast("❌ Could not reschedule booking: " + err.message, "error");
          }
        },
        null,
        "Yes, Reschedule",
        "Cancel",
      );
    });
};

// Handle Booking Editing
window.editBooking = async function (bookingId) {
  try {
    const booking = await getBooking(bookingId);

    if (!booking) {
      showToast("❌ Booking not found.", "error");
      return;
    }

    // Create edit modal
    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    const dialogContent = document.createElement("div");
    dialogContent.className = "modal-dialog";

    dialogContent.innerHTML = `
        <h2 class="text-primary">Edit Booking Details</h2>
        <p class="text-muted">Service: <strong>${booking.service}</strong></p>

        <div class="form-group">
            <label for="edit-name">Full Name *</label>
            <input type="text" id="edit-name" class="search-input" value="${booking.customerName || booking.name || ""}" required>
            <div id="edit-name-error" class="error-text hidden"></div>
        </div>

        <div class="form-group">
            <label for="edit-phone">Phone Number *</label>
            <input type="tel" id="edit-phone" class="search-input" value="${booking.phone || ""}" required>
            <div id="edit-phone-error" class="error-text hidden"></div>
        </div>

        <div class="form-group">
            <label for="edit-date">Preferred Date *</label>
            <input type="date" id="edit-date" class="search-input" value="${booking.date}" required>
            <div id="edit-date-error" class="error-text hidden"></div>
        </div>

        <div class="form-group">
            <label for="edit-address">Address *</label>
            <textarea id="edit-address" class="search-input" rows="3" required>${booking.address || ""}</textarea>
            <div id="edit-address-error" class="error-text hidden"></div>
        </div>

        <div class="modal-btn-group">
            <button id="cancel-edit" class="btn btn-muted btn-flex">Cancel</button>
            <button id="save-edit" class="btn btn-flex">Save Changes</button>
        </div>
    `;

    modal.appendChild(dialogContent);
    document.body.appendChild(modal);

    // Set up form validation
    const nameInput = dialogContent.querySelector("#edit-name");
    const phoneInput = dialogContent.querySelector("#edit-phone");
    const dateInput = dialogContent.querySelector("#edit-date");
    const addressInput = dialogContent.querySelector("#edit-address");

    const nameError = dialogContent.querySelector("#edit-name-error");
    const phoneError = dialogContent.querySelector("#edit-phone-error");
    const dateError = dialogContent.querySelector("#edit-date-error");
    const addressError = dialogContent.querySelector("#edit-address-error");

    // Set min date to today
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;

    // Real-time validation
    nameInput.addEventListener("input", () => {
      if (nameInput.value.trim().length < 3) {
        nameError.textContent = "Name must be at least 3 characters";
        nameError.classList.remove("hidden");
      } else {
        nameError.classList.add("hidden");
      }
    });

    phoneInput.addEventListener("input", () => {
      if (!/^[6-9]\d{9}$/.test(phoneInput.value.trim())) {
        phoneError.textContent = "Enter valid 10-digit phone number starting with 6-9";
        phoneError.classList.remove("hidden");
      } else {
        phoneError.classList.add("hidden");
      }
    });

    dateInput.addEventListener("input", () => {
      if (!dateInput.value || dateInput.value < today) {
        dateError.textContent = "Select a valid future date";
        dateError.classList.remove("hidden");
      } else {
        dateError.classList.add("hidden");
      }
    });

    addressInput.addEventListener("input", () => {
      if (addressInput.value.trim().length < 10) {
        addressError.textContent = "Address must be at least 10 characters";
        addressError.classList.remove("hidden");
      } else {
        addressError.classList.add("hidden");
      }
    });

    // Event handlers
    dialogContent.querySelector("#cancel-edit").addEventListener("click", () => {
      modal.remove();
    });

    dialogContent.querySelector("#save-edit").addEventListener("click", () => {
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const date = dateInput.value;
      const address = addressInput.value.trim();

      let hasErrors = false;
      if (name.length < 3) { nameError.classList.remove("hidden"); hasErrors = true; }
      if (!/^[6-9]\d{9}$/.test(phone)) { phoneError.classList.remove("hidden"); hasErrors = true; }
      if (!date || date < today) { dateError.classList.remove("hidden"); hasErrors = true; }
      if (address.length < 10) { addressError.classList.remove("hidden"); hasErrors = true; }

      if (hasErrors) {
        showToast("❌ Please fix the errors and try again.", "error");
        return;
      }

      modal.remove();

      showConfirmDialog(
        "Confirm Changes?",
        "Are you sure you want to update this booking?",
        async () => {
          try {
            await updateBooking(bookingId, {
              customerName: name,
              phone: phone,
              date: date,
              address: address,
              status: "Pending"
            });
            showToast("✅ Booking updated successfully.", "success");
            setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
            console.error("Update error:", err);
            showToast("❌ Could not update booking: " + err.message, "error");
          }
        },
        null,
        "Yes, Update",
        "Cancel",
      );
    });
  } catch (err) {
    showToast("❌ Error loading booking details.", "error");
    console.error(err);
  }
};

// Load and display notifications from Backend
async function loadNotifications(userEmail) {
  try {
    const response = await getUserNotifications(userEmail);
    const userNotifications = response.notifications || [];

    if (userNotifications.length > 0) {
      const notificationsSection = document.getElementById("notifications-section");
      const notificationsList = document.getElementById("notifications-list");

      notificationsSection.classList.remove("hidden");
      notificationsList.innerHTML = "";

      userNotifications.slice(0, 5).forEach((notification) => {
        const notificationDiv = document.createElement("div");
        notificationDiv.className = `notification ${notification.read ? "read" : "unread"}`;

        notificationDiv.innerHTML = `
                  <div class="notification-item">
                      <div>
                          <strong class="bold">${notification.subject || 'Notification'}</strong>
                          <p class="text-muted small">${notification.message}</p>
                          <small class="text-muted small">${new Date(notification.createdAt).toLocaleString()}</small>
                      </div>
                      ${!notification.read ? '<span class="text-success bold">●</span>' : ""}
                  </div>
              `;

        notificationsList.appendChild(notificationDiv);

        notificationDiv.addEventListener("click", async () => {
          if (!notification.read) {
            try {
              await markNotificationAsRead(notification._id);
              notificationDiv.classList.add("read");
              notificationDiv.querySelector(".text-success")?.remove();
            } catch (err) {
              console.error("Error marking notification as read:", err);
            }
          }
        });
      });
    }
  } catch (err) {
    console.error("Error loading notifications:", err);
  }
}
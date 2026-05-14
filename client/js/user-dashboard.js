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

      // Sort by Emergency first, then newest
      const sortedBookings = [...userBookings].sort((a, b) => {
        if (a.type === "emergency" && b.type !== "emergency") return -1;
        if (a.type !== "emergency" && b.type === "emergency") return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      sortedBookings.forEach((booking) => {
        const tr = document.createElement("tr");
        if (booking.type === "emergency") tr.classList.add("priority-emergency");

        // Styling status creatively based on our CSS classes
        let statusClass = "status-pending";
        let statusText = booking.status || "Pending";

        if (booking.status === "Completed") {
          statusClass = "status-completed";
          statusText = "Completed ✅";
        } else if (booking.status === "Accepted") {
          statusClass = "status-accepted";
          statusText = "In Progress 🛠️";
        } else if (booking.status === "Cancelled" || booking.status === "Rejected") {
          statusClass = "status-cancelled";
        }

        // Payment logic
        let paymentInfo = "";
        if (booking.paymentStatus === "Paid") {
          paymentInfo = `<span class="text-success bold">Paid ✓<br><small class="text-muted small">${booking.paymentId || ""}</small></span>`;
        } else if (booking.status === "Completed" && booking.paymentMethod === "Online") {
          paymentInfo = `<div class="payment-action">
              <span class="text-danger bold">Unpaid</span><br>
              <button class="btn btn-sm btn-success mt-1" onclick="payNowAfterService('${booking._id || booking.id}')">Pay Now</button>
            </div>`;
        } else if (booking.paymentMethod === "Cash") {
          paymentInfo = `<span class="text-warning bold">Cash Payment</span><br><small class="text-muted small">${booking.paymentStatus === "Paid" ? "Collected" : "To be paid"}</small>`;
        } else {
          paymentInfo = `<span class="text-danger bold">Unpaid</span>`;
        }

        // Action / Feedback Logic
        let feedbackHtml = `<td>-</td>`;
        if (booking.status === "Pending") {
          feedbackHtml = `<td>
                <button class="btn btn-sm btn-primary" onclick="handleEditBooking('${booking._id || booking.id}')" title="Edit booking details">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="handleCancelBooking('${booking._id || booking.id}')">Cancel</button>
                <button class="btn btn-sm" onclick="handleRescheduleBooking('${booking._id || booking.id}', '${booking.date}')">Reschedule</button>
            </td>`;
        } else if (booking.status === "Accepted" || booking.status === "Confirmed" || booking.status === "In Progress") {
          feedbackHtml = `<td><span class="text-muted small italic">Awaiting completion...</span></td>`;
        } else if (booking.status === "Completed") {
          const hasFeedback = booking.feedback && (booking.feedback.rating || booking.feedback.comment);
          
          if (hasFeedback) {
            feedbackHtml = `<td>
              <div class="rating-info">
                <span class="text-success bold">${booking.feedback.rating || "N/A"}</span><br>
                <small class="text-muted italic">"${booking.feedback.comment || "No comment"}"</small>
              </div>
            </td>`;
          } else {
            feedbackHtml = `<td>
              <button class="btn btn-sm btn-success" onclick="openFeedback('${booking._id || booking.id}', '${booking.service.replace(/'/g, "\\'")}')">
                Rate & Finish ⭐
              </button>
            </td>`;
          }
        } else if (booking.status === "Cancelled" || booking.status === "Rejected") {
          feedbackHtml = `<td><span class="text-danger small">No action</span></td>`;
        }

        // OTP Logic for display
        let otpInfo = "";
        if (booking.status === "Accepted" || booking.status === "Confirmed" || booking.status === "In Progress") {
          otpInfo = `<div class="mt-1"><span class="badge badge-info" title="Share this code with the provider when they arrive">OTP: <strong class="text-white">${booking.serviceOTP}</strong></span></div>`;
        }

        // Table Injection
        tr.innerHTML = `
            <td>
                <strong class="bold">${booking.service}</strong><br>
                <small>${booking.type === "emergency" ? '<span class="text-danger bold">🚨 Emergency</span>' : "Normal"}</small>
                ${otpInfo}
                ${booking.serviceAddress ? `<div class="mt-1" style="font-size:12px; color: var(--text-muted);"><i class="fa-solid fa-location-dot" style="color:#10b981;"></i> ${booking.serviceAddress}</div>` : ''}
            </td>
            <td>${booking.date}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
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

// Handle Booking Cancellation (Renamed to avoid conflict with API)
window.handleCancelBooking = function (bookingId) {
  showConfirmDialog(
    "Cancel Booking?",
    "Are you sure you want to cancel this booking?",
    async () => {
      try {
        // This now correctly calls the API function from apiService.js
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


// Handle Booking Rescheduling (Renamed to avoid conflict with API)
window.handleRescheduleBooking = function (bookingId, currentDate) {

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

// Handle Booking Editing (Renamed to avoid conflict with API)
window.handleEditBooking = async function (bookingId) {

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
            <textarea id="edit-address" class="search-input" rows="3" required>${booking.serviceAddress || ""}</textarea>
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
              serviceAddress: address,
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

// Handle Post-Service Payment
window.payNowAfterService = async function (bookingId) {
  try {
    const booking = await getBooking(bookingId);
    if (!booking) throw new Error("Booking not found");

    const numericPrice = parseInt(booking.price.replace("₹", ""));

    showToast("Opening Payment Gateway...");

    // Use simulated Razorpay
    var options = {
      key: "rzp_test_dummykey123",
      amount: numericPrice * 100,
      currency: "INR",
      name: "Local Connect",
      description: "Payment for " + booking.service,
      handler: async function (response) {
        try {
          showToast("Verifying Payment...");
          // Simulate verification and update
          await updateBooking(bookingId, {
            paymentStatus: "Paid",
            paymentId: response.razorpay_payment_id || "pay_after_" + Math.random().toString(36).substr(2, 9)
          });

          showToast("✅ Payment Successful!");
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          showToast("❌ Payment Update Failed", "error");
        }
      },
      prefill: {
        name: booking.customerName,
        email: booking.userEmail,
      },
      theme: { color: "#2563eb" },
    };

    if (options.key === "rzp_test_dummykey123") {
      setTimeout(() => {
        options.handler({
          razorpay_payment_id: "pay_sim_" + Math.random().toString(36).substr(2, 9),
        });
      }, 2000);
    } else {
      var rzp1 = new Razorpay(options);
      rzp1.open();
    }
  } catch (err) {
    console.error("Payment error:", err);
    showToast("❌ Could not initiate payment: " + err.message, "error");
  }
};
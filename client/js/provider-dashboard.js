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

  try {
    // 0. Fetch Provider Profile to check Approval Status
    const providersRes = await getProviders({ userId: loggedInUser._id || loggedInUser.id });
    const providerProfile = providersRes.providers?.[0];
    const isApproved = providerProfile?.isApproved || false;

    // Show/Hide Approval Banner
    const approvalBanner = document.getElementById("approval-banner");
    if (approvalBanner) {
      approvalBanner.classList.toggle("hidden", isApproved);
    }

    const providerIdentifier = loggedInUser.fullname || loggedInUser.email.split("@")[0];

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
    renderEmergency(pendingEmergency, isApproved);
    renderIncoming(pendingNormal, isApproved);
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

function renderEmergency(requests, isApproved) {
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
                <p><strong class="bold">Address:</strong> <span class="text-primary">${req.serviceAddress || "N/A"}</span></p>
                <p><strong class="bold">Payment:</strong> ${paymentInfo}</p>
                <p class="text-danger bold">🚨 Time: Immediate Action Required!</p>
                <div class="modal-btn-group mt-2">
                    <button class="btn btn-danger btn-flex" ${!isApproved ? 'disabled title="Account pending approval"' : ''} onclick="acceptBooking('${req._id || req.id}')">Accept</button>
                    <button class="btn btn-muted btn-flex" onclick="rejectBooking('${req._id || req.id}')">Decline</button>
                </div>
            </div>
        `;
  });
}

function renderIncoming(requests, isApproved) {
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
                <td><small>${req.serviceAddress || "N/A"}</small></td>
                <td>${req.date}</td>
                <td>Normal</td>
                <td>${paymentInfo}</td>
                <td>
                    <button class="btn btn-sm" ${!isApproved ? 'disabled title="Account pending approval"' : ''} onclick="acceptBooking('${req._id || req.id}')">Accept</button>
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

    // Build Google Maps directions URL from address
    const address = req.serviceAddress || req.address || "";
    const mapsUrl = address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
      : null;

    const directionsBtn = mapsUrl
      ? `<a href="${mapsUrl}" target="_blank" class="btn btn-accent btn-flex" style="background: linear-gradient(135deg,#10b981,#059669); text-decoration:none; display:inline-flex; align-items:center; gap:8px;">
           <i class="fa-solid fa-location-dot"></i> Get Directions
         </a>`
      : `<span class="text-muted small">No address provided</span>`;

    container.innerHTML += `
            <div class="card text-left ${req.type === 'emergency' ? 'priority-emergency' : ''}">
                ${req.type === 'emergency' ? '<p class="text-danger bold">🚨 EMERGENCY — Respond Immediately</p>' : ''}
                <p><strong class="bold">Customer:</strong> ${req.customerName}</p>
                <p><strong class="bold">Phone:</strong> <a href="tel:${req.phone}" class="text-primary no-decoration">${req.phone}</a></p>
                <p><strong class="bold">Service:</strong> ${req.service} (Scheduled: ${req.date})</p>
                <p><strong class="bold">Payment:</strong> ${paymentInfo}</p>
                <div class="address-box" style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 15px; margin: 12px 0;">
                    <p style="margin:0 0 6px 0; font-size:13px; color: var(--text-muted); font-weight:600; text-transform: uppercase; letter-spacing: 0.5px;">📍 Service Location</p>
                    <p style="margin:0 0 10px 0; font-weight:600; font-size:15px;">${address || "Address not specified"}</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${directionsBtn}
                        <a href="https://wa.me/${req.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(`Hi ${req.customerName}, I am ${req.provider} from Local Connect. I've accepted your ${req.service} booking for ${req.date}. Could you please share any landmarks near ${address}?`)}" 
                           target="_blank" class="btn btn-flex" style="background: #25D366; color: white; text-decoration:none; display:inline-flex; align-items:center; gap:8px; border:none;">
                           <i class="fa-brands fa-whatsapp"></i> Chat with Customer
                        </a>
                    </div>
                </div>
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
  // Create OTP Modal
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  const dialogContent = document.createElement("div");
  dialogContent.className = "modal-dialog";

  dialogContent.innerHTML = `
        <h2 class="text-primary">Verify Completion</h2>
        <p class="text-muted">
            Please enter the 4-digit OTP provided by the customer to complete this service.
        </p>
        <div class="form-group mb-4">
            <input type="text" id="service-otp-input" class="search-input text-center" 
                   maxlength="4" placeholder="0 0 0 0" style="letter-spacing: 15px; font-size: 24px; font-weight: bold;">
            <div id="otp-error" class="text-danger small mt-2 hidden">Invalid OTP. Please try again.</div>
        </div>
        <div class="modal-btn-group">
            <button id="cancel-otp" class="btn btn-muted btn-flex">Cancel</button>
            <button id="verify-otp-btn" class="btn btn-flex">Verify & Complete</button>
        </div>
    `;

  modal.appendChild(dialogContent);
  document.body.appendChild(modal);

  const otpInput = dialogContent.querySelector("#service-otp-input");
  const otpError = dialogContent.querySelector("#otp-error");

  // Event handlers
  dialogContent.querySelector("#cancel-otp").addEventListener("click", () => {
    modal.remove();
  });

  dialogContent.querySelector("#verify-otp-btn").addEventListener("click", async () => {
    const otp = otpInput.value.trim();

    if (otp.length !== 4) {
      otpError.textContent = "Please enter all 4 digits.";
      otpError.classList.remove("hidden");
      return;
    }

    try {
      showToast("Verifying OTP...");
      await verifyBookingOTP(id, otp);
      
      modal.remove();
      
      // Proceed with Work Summary / Invoice Generation
      const booking = await getBooking(id);
      openInvoiceModal(id, booking);

    } catch (err) {
      console.error("OTP Error:", err);
      otpError.textContent = err.message || "Incorrect OTP. Please ask the customer for the correct code.";
      otpError.classList.remove("hidden");
    }
  });
};

function openInvoiceModal(bookingId, booking) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  const dialogContent = document.createElement("div");
  dialogContent.className = "modal-dialog";
  dialogContent.style.maxWidth = "500px";

  const basePriceStr = booking.price ? booking.price.toString().replace(/[^0-9.]/g, '') : "0";
  
  dialogContent.innerHTML = `
        <h2 class="text-primary">Work Summary & Invoice</h2>
        <p class="text-muted">
            Please detail the work completed for <strong>${booking.service}</strong>. This helps the customer understand the pricing.
        </p>
        <div class="form-group mb-3">
            <label for="invoice-scope">Scope of Work *</label>
            <select id="invoice-scope" class="search-input" required>
                <option value="" disabled selected>Select Scope</option>
                <option value="Whole House">Whole House</option>
                <option value="Specific Room/Area">Specific Room/Area</option>
                <option value="Single Item/Appliance">Single Item/Appliance</option>
                <option value="Inspection Only">Inspection Only</option>
                <option value="Custom/Other">Custom / Other</option>
            </select>
        </div>
        <div class="form-group mb-3">
            <label for="invoice-desc">Detailed Description *</label>
            <textarea id="invoice-desc" class="search-input" rows="3" placeholder="E.g., Fixed kitchen sink pipe leakage and replaced the washer." required></textarea>
        </div>
        <div class="form-group mb-3">
            <label for="invoice-base">Base Price (₹)</label>
            <input type="number" id="invoice-base" class="search-input" value="${basePriceStr}" readonly>
        </div>
        <div class="form-group mb-3">
            <label for="invoice-extra">Additional Charges (₹)</label>
            <input type="number" id="invoice-extra" class="search-input" value="0" min="0" placeholder="0">
        </div>
        <div class="form-group mb-4">
            <label for="invoice-total">Total Final Amount (₹)</label>
            <input type="number" id="invoice-total" class="search-input text-primary bold" value="${basePriceStr}" readonly style="font-size: 18px;">
        </div>
        <div class="modal-btn-group">
            <button id="cancel-invoice" class="btn btn-muted btn-flex">Cancel</button>
            <button id="submit-invoice-btn" class="btn btn-flex">Complete Service</button>
        </div>
    `;

  modal.appendChild(dialogContent);
  document.body.appendChild(modal);

  const scopeInput = dialogContent.querySelector("#invoice-scope");
  const descInput = dialogContent.querySelector("#invoice-desc");
  const baseInput = dialogContent.querySelector("#invoice-base");
  const extraInput = dialogContent.querySelector("#invoice-extra");
  const totalInput = dialogContent.querySelector("#invoice-total");

  // Auto-update total amount
  extraInput.addEventListener("input", () => {
      const base = parseFloat(baseInput.value) || 0;
      const extra = parseFloat(extraInput.value) || 0;
      totalInput.value = base + extra;
  });

  // Event handlers
  dialogContent.querySelector("#cancel-invoice").addEventListener("click", () => {
    modal.remove();
  });

  dialogContent.querySelector("#submit-invoice-btn").addEventListener("click", async () => {
    const scope = scopeInput.value;
    const desc = descInput.value.trim();
    const base = baseInput.value;
    const extra = extraInput.value || "0";
    const total = totalInput.value;

    if (!scope || !desc) {
      showToast("❌ Please fill in the Scope and Description.", "error");
      return;
    }

    try {
      showToast("Saving Invoice & Completing...");
      
      const invoiceData = {
          workScope: scope,
          workDescription: desc,
          basePrice: "₹" + base,
          additionalCharges: "₹" + extra,
          totalAmount: "₹" + total,
          generatedAt: new Date().toISOString()
      };

      const updateData = { 
          status: "Completed",
          price: "₹" + total, // update the main booking price to reflect the final total
          invoice: invoiceData
      };
      
      if (booking.paymentMethod === "Cash" && booking.paymentStatus !== "Paid") {
        updateData.paymentStatus = "Paid";
        updateData.paymentId = "cash_" + Date.now();
      }

      await updateBooking(bookingId, updateData);

      await createNotification({
        email: booking.userEmail,
        type: "booking_completed",
        subject: "Service Completed ✅",
        message: `Your ${booking.service} service has been completed successfully. You can now view your bill.`,
        data: { bookingId: bookingId, service: booking.service }
      });

      modal.remove();
      showToast("✅ Service Completed & Invoice Generated!", "success");
      setTimeout(() => renderProviderDashboard(), 800);
    } catch (err) {
      console.error("Invoice Error:", err);
      showToast("❌ Error saving invoice: " + err.message, "error");
    }
  });
}

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

    daySlot.addEventListener("click", () => {
      daySlot.classList.toggle("selected");
    });

    calendarContainer.appendChild(daySlot);
  }

  // Add toggle availability button functionality
  const toggleBtn = document.getElementById("toggle-availability");
  if (toggleBtn) {
    // Clone and replace to remove any old event listeners
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

    newToggleBtn.addEventListener("click", () => {
      const selectedSlots = document.querySelectorAll(".calendar-day.selected");
      
      if (selectedSlots.length === 0) {
        showToast("Please click on a date to select it first.", "info");
        return;
      }

      const availability = JSON.parse(localStorage.getItem("providerAvailability")) || {};
      availability[loggedInUser.email] = availability[loggedInUser.email] || {};

      let changedCount = 0;
      selectedSlots.forEach(slot => {
        const dateStr = slot.dataset.date;
        availability[loggedInUser.email][dateStr] = !availability[loggedInUser.email][dateStr];
        changedCount++;
      });

      localStorage.setItem("providerAvailability", JSON.stringify(availability));
      renderAvailabilityCalendar();

      showToast(`Updated availability for ${changedCount} day(s)!`, "success");
    });
  }
}

// Viva: Pure Frontend Logic for User Dashboard Operations
window.logout = function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
};
document.addEventListener("DOMContentLoaded", () => {
    // 1. Authentication Check
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser || loggedInUser.role !== 'user') {
        alert("❌ You must log in as a User to view this dashboard.");
        window.location.href = "login.html";
        return;
    }

    // Load notifications
    loadNotifications(loggedInUser.email);

    // 2. Data Retrieval (Simulating Database Fetch)
    const allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];

    // Filter bookings belonging strictly to this user
    const userBookings = allBookings.filter(b => b.userEmail === loggedInUser.email);

    // 3. Update Statistics UI
    document.getElementById("total-bookings").textContent = userBookings.length;
    document.getElementById("pending-requests").textContent = userBookings.filter(b => b.status === "Pending").length;
    document.getElementById("completed-services").textContent = userBookings.filter(b => b.status === "Completed").length;

    // 4. Render Table
    const tbody = document.getElementById("bookings-body");
    tbody.innerHTML = "";

    if (userBookings.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align: center;'>No bookings found. Start a new booking!</td></tr>";
    }

    userBookings.forEach(booking => {
        const tr = document.createElement("tr");

        // Styling status creatively based on our CSS classes
        let statusClass = "status-pending";
        if (booking.status === "Completed") statusClass = "status-completed";
        if (booking.status === "Cancelled" || booking.status === "Rejected") statusClass = "status-cancelled";

        // Payment logic
        let paymentInfo = booking.paymentStatus === 'Paid'
            ? `<span style="color:var(--accent-color); font-weight:bold;">Paid ✓<br><small style="color:var(--text-muted);font-size:10px;">${booking.paymentId || ''}</small></span>`
            : `<span style="color:var(--danger-color); font-weight:bold;">Unpaid</span>`;

        // Action / Feedback Logic
        let feedbackHtml = `<td>Not Available</td>`;
        if (booking.status === "Pending") {
            feedbackHtml = `<td>
                <button class="btn" style="padding: 6px 12px; font-size: 13px; background-color: var(--danger-color); margin-bottom: 5px;" onclick="cancelBooking('${booking.id}')">Cancel</button>
                <button class="btn" style="padding: 6px 12px; font-size: 13px; background-color: var(--primary-color);" onclick="rescheduleBooking('${booking.id}', '${booking.date}')">Reschedule</button>
            </td>`;
        } else if (booking.status === "Completed") {
            if (booking.feedback) {
                feedbackHtml = `<td><span style="color:var(--accent-color);font-weight:bold;">Thanks for feedback!</span></td>`;
            } else {
                feedbackHtml = `<td><button class="btn" style="padding: 6px 12px; font-size: 13px;" onclick="openFeedback('${booking.id}', '${booking.service}')">Give Feedback</button></td>`;
            }
        }

        // Table Injection
        tr.innerHTML = `
            <td>
                <strong>${booking.service}</strong><br>
                <small>${booking.type === 'emergency' ? '<span style="color:var(--danger-color); font-weight:bold;">🚨 Emergency</span>' : 'Normal'}</small>
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
    feedbackSection.style.display = "block";
    document.getElementById("service-id").value = bookingId;
    document.getElementById("service-name").textContent = `Providing Feedback for: ${serviceName}`;

    // Scroll down to feedback section
    feedbackSection.scrollIntoView({ behavior: 'smooth' });
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
        const bIndex = allBookings.findIndex(b => b.id === bookingId);
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
    if (confirm("Are you sure you want to cancel this booking?")) {
        let allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];
        const bIndex = allBookings.findIndex(b => b.id === bookingId);

        if (bIndex > -1) {
            allBookings[bIndex].status = "Cancelled";
            localStorage.setItem("allBookings", JSON.stringify(allBookings));
            alert("✅ Booking cancelled successfully.");
            window.location.reload();
        }
    }
};

// Handle Booking Rescheduling
window.rescheduleBooking = function (bookingId, currentDate) {
    const newDate = prompt("Enter new date (YYYY-MM-DD):", currentDate);
    if (newDate && newDate !== currentDate) {
        const today = new Date().toISOString().split("T")[0];
        if (newDate < today) {
            alert("Please select a future date.");
            return;
        }

        let allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];
        const bIndex = allBookings.findIndex(b => b.id === bookingId);

        if (bIndex > -1) {
            allBookings[bIndex].date = newDate;
            allBookings[bIndex].status = "Pending"; // Reset status when rescheduled
            localStorage.setItem("allBookings", JSON.stringify(allBookings));
            alert("✅ Booking rescheduled successfully.");
            window.location.reload();
        }
    }
};

// Load and display notifications
function loadNotifications(userEmail) {
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    const userNotifications = notifications.filter(n => n.email === userEmail).slice(-5); // Last 5 notifications

    if (userNotifications.length > 0) {
        const notificationsSection = document.getElementById("notifications-section");
        const notificationsList = document.getElementById("notifications-list");

        notificationsSection.style.display = "block";
        notificationsList.innerHTML = "";

        userNotifications.reverse().forEach(notification => {
            const notificationDiv = document.createElement("div");
            notificationDiv.className = `notification ${notification.read ? 'read' : 'unread'}`;
            notificationDiv.style.cssText = `
                padding: 10px;
                margin-bottom: 10px;
                border-radius: 8px;
                background: ${notification.read ? '#f8fafc' : '#e0f2fe'};
                border-left: 3px solid ${notification.read ? '#e2e8f0' : 'var(--accent-color)'};
            `;

            notificationDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <strong>${notification.subject}</strong>
                        <p style="margin: 5px 0; color: var(--text-muted); font-size: 14px;">${notification.message}</p>
                        <small style="color: var(--text-muted);">${new Date(notification.timestamp).toLocaleString()}</small>
                    </div>
                    ${!notification.read ? '<span style="color: var(--accent-color); font-weight: bold;">●</span>' : ''}
                </div>
            `;

            notificationsList.appendChild(notificationDiv);

            // Mark as read when clicked
            notificationDiv.addEventListener("click", () => {
                if (!notification.read) {
                    notification.read = true;
                    localStorage.setItem("notifications", JSON.stringify(notifications));
                    notificationDiv.style.background = "#f8fafc";
                    notificationDiv.style.borderLeftColor = "#e2e8f0";
                    notificationDiv.querySelector('span')?.remove();
                }
            });
        });
    }
}

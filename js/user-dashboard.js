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

    // Hide feedback initially
    const feedbackSection = document.getElementById("feedback-section");
    if (feedbackSection) feedbackSection.style.display = "none";

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
            feedbackHtml = `<td><button class="btn" style="padding: 6px 12px; font-size: 13px; background-color: var(--danger-color);" onclick="cancelBooking('${booking.id}')">Cancel Booking</button></td>`;
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

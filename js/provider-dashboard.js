// provider-dashboard.js - Pure Frontend logic
window.logout = function() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Auth Check
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser || loggedInUser.role !== 'provider') {
        alert("❌ You must log in as a Service Provider to view this dashboard.");
        window.location.href = "login.html";
        return;
    }

    // Load dynamic data perfectly
    renderProviderDashboard();
});

function renderProviderDashboard() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];

    // Filter categories dynamically (simulating SQL queries)
    const pendingEmergency = allBookings.filter(b => b.status === "Pending" && b.type === "emergency");
    const pendingNormal = allBookings.filter(b => b.status === "Pending" && b.type === "normal");
    
    // We bind the provider's name securely to the booking so they only see their own accepted jobs
    const providerIdentifier = loggedInUser.fullname || loggedInUser.email.split('@')[0];
    const myAccepted = allBookings.filter(b => b.status === "Accepted" && b.provider === providerIdentifier);
    const myCompleted = allBookings.filter(b => b.status === "Completed" && b.provider === providerIdentifier);

    // Render HTML Views
    renderEmergency(pendingEmergency);
    renderIncoming(pendingNormal);
    renderAccepted(myAccepted);
    renderFeedback(myCompleted); // Added: Render feedback section
}

function renderFeedback(completedBookings) {
    const feedbackBody = document.getElementById("feedback-body");
    const trustScoreEl = document.getElementById("trust-score");

    feedbackBody.innerHTML = "";
    let totalRatings = 0;
    let feedbackCount = 0;

    if (completedBookings.length === 0) {
        feedbackBody.innerHTML = "<tr><td colspan='5' style='text-align: center; color: var(--text-muted);'>No completed services yet.</td></tr>";
        trustScoreEl.textContent = "No data";
        return;
    }

    completedBookings.forEach(booking => {
        if (booking.feedback) {
            const rating = parseInt(booking.feedback.rating.split(' ')[1]); // Extract number from "⭐⭐ 2"
            totalRatings += rating;
            feedbackCount++;

            feedbackBody.innerHTML += `
                <tr>
                    <td>${booking.service}</td>
                    <td>${booking.customerName}</td>
                    <td>${booking.feedback.rating}</td>
                    <td>${booking.feedback.comment}</td>
                    <td>${new Date(booking.date).toLocaleDateString()}</td>
                </tr>
            `;
        } else {
            feedbackBody.innerHTML += `
                <tr>
                    <td>${booking.service}</td>
                    <td>${booking.customerName}</td>
                    <td>No rating</td>
                    <td>No feedback yet</td>
                    <td>${new Date(booking.date).toLocaleDateString()}</td>
                </tr>
            `;
        }
    });

    // Calculate Trust Score: Average rating * (feedback count / total completed) + completion rate
    const completionRate = completedBookings.length > 0 ? (feedbackCount / completedBookings.length) * 100 : 0;
    const avgRating = feedbackCount > 0 ? (totalRatings / feedbackCount) : 0;
    const trustScore = Math.round((avgRating * 0.7) + (completionRate * 0.3)); // Weighted formula

    trustScoreEl.textContent = `${trustScore}/100 (${avgRating.toFixed(1)}⭐ avg, ${feedbackCount}/${completedBookings.length} feedback)`;
}

function renderEmergency(requests) {
    const container = document.getElementById("emergency-requests-container");
    container.innerHTML = "";
    if (requests.length === 0) {
        container.innerHTML = "<p style='color: var(--text-muted);'>No emergency requests right now.</p>";
        return;
    }

    requests.forEach(req => {
        container.innerHTML += `
            <div class="request-card" style="border: 2px solid var(--danger-color); padding: 20px; margin-bottom: 15px; border-radius: 8px; background: white; box-shadow: var(--shadow-md);">
                <p><strong>Service:</strong> ${req.service}</p>
                <p><strong>Customer:</strong> ${req.customerName}</p>
                <p><strong>Phone:</strong> ${req.phone}</p>
                <p style="color:var(--danger-color); font-weight:bold; margin-bottom: 15px;">🚨 Time: Immediate Action Required!</p>
                <button class="btn" style="background: var(--danger-color);" onclick="acceptBooking('${req.id}')">Accept Emergency</button>
                <button class="btn" style="background:var(--text-muted);" onclick="rejectBooking('${req.id}')">Decline</button>
            </div>
        `;
    });
}

function renderIncoming(requests) {
    const tbody = document.getElementById("incoming-requests-body");
    tbody.innerHTML = "";
    if (requests.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align: center; color: var(--text-muted);'>No new normal requests at this moment</td></tr>";
        return;
    }

    requests.forEach(req => {
        tbody.innerHTML += `
            <tr>
                <td>${req.customerName}</td>
                <td><strong>${req.service}</strong></td>
                <td>${req.date}</td>
                <td>Normal</td>
                <td>
                    <button class="btn" style="padding: 6px 14px; font-size: 13px;" onclick="acceptBooking('${req.id}')">Accept</button>
                    <button class="btn" style="background:var(--text-muted); padding: 6px 14px; font-size: 13px;" onclick="rejectBooking('${req.id}')">Decline</button>
                </td>
            </tr>
        `;
    });
}

function renderAccepted(requests) {
    const container = document.getElementById("accepted-bookings-container");
    container.innerHTML = "";
    if (requests.length === 0) {
        container.innerHTML = "<p style='color: var(--text-muted);'>You haven't accepted any active bookings yet.</p>";
        return;
    }

    requests.forEach(req => {
        container.innerHTML += `
            <div class="card" style="border-top: 4px solid var(--primary-color); text-align: left;">
                <p><strong>Customer:</strong> ${req.customerName}</p>
                <p><strong>Phone:</strong> <a href="tel:${req.phone}" style="color: var(--primary-color); text-decoration: none;">${req.phone}</a></p>
                <p><strong>Service:</strong> ${req.service} (Scheduled: ${req.date})</p>
                <p style="color:var(--primary-color); font-weight:bold; margin-top: 10px;">Status: In Progress 🛠️</p>
                <button class="btn" style="margin-top: 15px; width: 100%;" onclick="completeBooking('${req.id}')">Mark as Completed ✅</button>
            </div>
        `;
    });
}

// ==========================
// ACTIONS (Database Simulation)
// ==========================

window.acceptBooking = function(id) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    let allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];
    
    // Find the exact booking ID
    const index = allBookings.findIndex(b => b.id === id);
    if (index > -1) {
        allBookings[index].status = "Accepted";
        // Assign this exact provider to the booking so others can't see it!
        allBookings[index].provider = loggedInUser.fullname || loggedInUser.email.split('@')[0];
        localStorage.setItem("allBookings", JSON.stringify(allBookings));
        
        // Re-render the view
        renderProviderDashboard();
    }
}

window.rejectBooking = function(id) {
    let allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];
    const index = allBookings.findIndex(b => b.id === id);
    if (index > -1) {
        allBookings[index].status = "Rejected"; // Customer dashboard will reflect this
        localStorage.setItem("allBookings", JSON.stringify(allBookings));
        renderProviderDashboard();
    }
}

window.completeBooking = function(id) {
    let allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];
    const index = allBookings.findIndex(b => b.id === id);
    if (index > -1) {
        allBookings[index].status = "Completed";
        localStorage.setItem("allBookings", JSON.stringify(allBookings));
        renderProviderDashboard();
    }
}

# 🎓 Viva Preparation Guide: Local Connect

This guide helps you explain the professional features we've implemented in your project. Each section covers **The Goal**, **The Logic**, and **The Code Location**.

---

## 0. Project Architecture (The "Professionalism" Feature)

**The Goal**: To follow industry standards by separating the Frontend (Client) from the Backend (Server).

- **The Logic**:
  - **Client Folder**: Contains all assets that the user interacts with (HTML, CSS, JS). It makes the frontend independent of the backend technology.
  - **Server Folder**: Contains all logic that interacts with the Database and handles security. 
  - **Separation of Concerns**: If we decide to change the UI to a mobile app later, we only change the `client` folder; the `server` stays the same.
- **Where is the Code?**:
  - `client/` -> The UI (Frontend).
  - `server/` -> The API (Backend).
  - `package.json` -> Configured to run the server from the root using `npm run dev`.

---

## 1. Google Maps & WhatsApp Integration (The "Reach" Feature)

**The Goal**: To solve the problem of how a provider actually finds the customer.

- **The Logic**:
  - **Google Maps**: We capture the `serviceAddress` during booking and encode it into a Maps URL.
  - **WhatsApp**: Facilitates direct communication. If the map is unclear, the provider can ask for landmarks with one click.
- **Where is the Code?**:
  - `js/provider-dashboard.js` -> `renderAccepted()` function.
  - `models/Booking.js` -> Added `serviceAddress` field.

---

## 2. Service OTP Verification (The "Security" Feature)

**The Goal**: To ensure the provider actually reached the customer and completed the work before the status is updated.

- **The Logic**:
  - When a booking is created, a random 4-digit code is generated.
  - The customer sees this code on their dashboard.
  - The provider cannot "Mark as Completed" without entering this code.
- **Where is the Code?**:
  - `controllers/bookingController.js` -> `createBooking()` (OTP Generation) & `verifyBookingOTP()` (Validation).
  - `js/user-dashboard.js` -> Displays the OTP badge.
  - `js/provider-dashboard.js` -> `completeBooking()` function (shows the verification modal).

---

## 3. Admin Approval Queue (The "Governance" Feature)

**The Goal**: To prevent fake or low-quality providers from joining the platform.

- **The Logic**:
  - New providers are set to `isApproved: false` by default.
  - They see a warning banner and cannot "Accept" jobs until the Admin verifies them.
- **Where is the Code?**:
  - `models/Provider.js` -> `isApproved` field.
  - `js/admin-dashboard.js` -> `renderProviders()` & `adminApproveProvider()`.
  - `js/provider-dashboard.js` -> `renderProviderDashboard()` (checks approval status).

---

## 4. Emergency Priority Queue (The "Logic" Feature)

**The Goal**: To highlight urgent requests that need immediate attention.

- **The Logic**:
  - Bookings are sorted so that `type: emergency` always appears at the top.
  - Emergency bookings have a special red styling and "Priority" badges.
- **Where is the Code?**:
  - `js/admin-dashboard.js` & `js/user-dashboard.js` -> Custom `.sort()` logic in the render functions.
  - `style.css` -> `.priority-emergency` and `.status-emergency` classes.

---

## 💡 Pro Tips for your Viva:

1.  **Demo Flow**:
    - Start as a **User** -> Book a service with an address.
    - Show the **Admin Dashboard** -> Approve the provider.
    - Show the **Provider Dashboard** -> Accept the job, click "Get Directions", then "Mark as Completed" (ask for OTP).
    - Go back to the **User** -> Give the OTP and then provide feedback.
2.  **Explain the Tech Stack**: "I used Node.js/Express for the backend, MongoDB for data persistence, and Vanilla JS for a fast, responsive UI."
3.  **Mention Scalability**: "The project is built using a REST API architecture, which means we can easily add a mobile app in the future using the same backend."

Good luck! You've built a robust, professional-grade marketplace. 🚀

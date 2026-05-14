# Local Connect - Full Stack Service Marketplace 🛠️

Local Connect is a professional, full-stack service booking platform that connects customers with verified local professionals (plumbers, electricians, cleaners, etc.). The project features a robust **MERN-like architecture** (Node.js, Express, MongoDB) with a clean **Client/Server** separation.

---

## 🏛️ Project Architecture

The project is organized into a professional Client-Server structure:

- **`/client`**: The Frontend. Built with modern HTML5, CSS3, and Vanilla JavaScript. It communicates with the backend via a centralized `apiService.js`.
- **`/server`**: The Backend. A Node.js and Express server that handles authentication, database operations, and business logic.
- **`MongoDB`**: Used for persistent data storage (Bookings, Users, Providers, Feedback).

---

## 🚀 Key Professional Features

- **Full-Stack Authentication**: Secure login/signup with Role-Based Access Control (Admin, Provider, Customer).
- **Service OTP Verification**: A security layer requiring a unique OTP from the customer to finalize service completion.
- **Admin Approval Workflow**: Real-time provider verification system to ensure platform quality.
- **Emergency Priority Queue**: Intelligent sorting and UI highlighting for urgent service requests.
- **Google Maps & WhatsApp Integration**: Direct navigation and communication tools for service providers.
- **Automated Email System**: Notifications for booking confirmations and status updates.
- **Dynamic Feedback System**: verified reviews that update provider ratings and trust scores.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Font Awesome.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (via Mongoose).
- **Payment Simulation**: Integrated Razorpay workflow.

---

## ▶️ How to Run

1.  **Clone/Download** the repository.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Create a `.env` file in the root with your `MONGO_URI` and `JWT_SECRET`.
4.  **Start the Server**:
    ```bash
    npm run dev
    ```
5.  **Access the App**: Open `http://localhost:5000` in your browser.

---

## 🎓 Viva Information

This project demonstrates proficiency in:
- **RESTful API Design**
- **State Management & Routing**
- **Database Schema Modeling**
- **Asynchronous Programming (Promises/Async-Await)**
- **Separation of Concerns (Client/Server)**

---

© 2026 Local Connect | Built for Academic Presentation
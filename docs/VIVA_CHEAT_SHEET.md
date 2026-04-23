# Viva Cheat Sheet: Smart Connect Local Services

**Project Name:** Smart Connect Local Services
**Architecture:** Pure Frontend (HTML, CSS, JS) with LocalStorage acting as a Mock Database.

---

## 1. How It Works (The Big Picture)

Since this project has no real backend (like Node.js or Python) and no real database (like MongoDB or MySQL), **all data is saved inside the browser's LocalStorage**.

### Primary LocalStorage Keys:
*   `loggedInUser`: Acts as our **Session Token**. When a user logs in, their profile is saved here. When they log out, it gets removed.
*   `registeredUsers`: Acts as our **Users Table**. Any new person who signs up gets pushed to this array.
*   `allBookings`: Acts as our **Bookings Table**. Every booking ever made is stored here. Dashboards read from this array to show charts and tables.
*   `servicesData` (Hardcoded in `js/data.js`): Acts as our **Products Table**. It contains all available services, sub-services, icons, and prices.

---

## 2. Key Data Flows to Explain

### A. The Signup & Login Flow
1. **Signup**: User fills the form (`js/signup.js`). We validate inputs. We check against `registeredUsers` to prevent duplicate emails. We save the new user to LocalStorage.
2. **Login**: User enters credentials (`js/login.js`). We combine our hardcoded *dummy users* with the *registeredUsers* from LocalStorage. We find a match. If successful, we save them to `loggedInUser` and redirect them to their respective dashboard based on their **role**.

### B. The Booking Flow
1. **Service Selection**: User clicks a service. We save their choice to `localStorage.setItem("selectedService", data)`. 
2. **Adding to Cart/Booking**: On the Booking Page (`js/booking.js`), we retrieve the "selectedService". 
3. **Checkout**: When they submit the form, we create a JSON Object containing their details + base price + emergency charges. We push this object to the `allBookings` array in LocalStorage. Default status is **"Pending"** and provider is **"Unassigned"**.

### C. The Dashboard Flow (Role-Based Access Control)
1. **User Dashboard**: Reads `allBookings`. Filters *only* rows where `booking.userEmail === loggedInUser.email`. Users can click "Cancel Booking" if it is Pending.
2. **Provider Dashboard**: Reads `allBookings`. Provides an interface to interact with "Pending" requests and theoretically accept/complete them.
3. **Admin Dashboard**: Has god-mode access. Reads *everything* from `allBookings` and `registeredUsers` to display global platform statistics.

---

## 3. Anticipated Teacher Questions & Answers

**Q: Where is your database?**
*"We opted for a LocalStorage-based mock database. This guarantees the project runs instantly on any machine without needing complicated server setup, while fully demonstrating CRUD (Create, Read, Update, Delete) operations conceptually."*

**Q: How do you handle Session Management?**
*"When a user logs in, their entire JSON object is saved to `loggedInUser` in LocalStorage. At the top of every dashboard JS file, we have an authentication check. If `loggedInUser` doesn't exist, or their role doesn't match the dashboard, they are instantly kicked back to `login.html`."*

**Q: How does UI updating happen without React/Angular?**
*"We heavily utilize standard DOM Manipulation (`document.createElement`, `innerHTML`). We clear the table bodies (`tbody.innerHTML = ""`) inside our JS files and dynamically rebuild rows using `forEach()` loops over our LocalStorage arrays."*

**Q: Why use `setTimeout()` in some places?**
*"To simulate realism! Real web apps have network latency. We use `setTimeout` on Login, Signup, and Booking to show loading states and disable submit buttons to prevent double-clicking, mimicking real-world UX."*

---

## 4. Files to Open & Show during Presentation

*   Show **`js/data.js`**: "This is our mock Schema/Database."
*   Show **`js/booking.js`**: "This shows robust form validation and object creation."
*   Show **`js/login.js`**: "This shows our authentication logic and Role-Based Redirection."
*   Show **`js/user-dashboard.js`**: "This shows how we filter data out of arrays and dynamically render HTML tables."

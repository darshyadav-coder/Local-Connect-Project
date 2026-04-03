# Local Connect - Smart Services Booking System

A frontend-only web app for booking local services with user, provider, and admin dashboards. The app uses browser Local Storage to simulate authentication, bookings, feedback, and support messages.

## Key Features

- Role-based authentication: user, provider, admin
- Signup with front-end validation and duplicate email checks
- Login with demo accounts plus newly registered users
- Service catalog rendering from `js/data.js`
- Live service search and categorized service cards
- Booking flow with normal and emergency booking options
- Emergency bookings add extra charges and a notice
- Bookings persist in Local Storage under `allBookings`
- User dashboard shows booking status, assigned provider, and feedback actions
- Feedback submission for completed bookings
- Provider dashboard for managing bookings and viewing assigned requests
- Admin dashboard metrics, global booking overview, emergency tracking, and feedback review
- Contact/support form with messages saved locally

## Current Pages

- `main.html` - Homepage showing featured services and navigation
- `services.html` - Browse services and select a category
- `booking.html` - Book a selected service with normal/emergency modes
- `user-dashboard.html` - User booking history, booking stats, and feedback form
- `provider-dashboard.html` - Provider booking management panel
- `admin-dashboard.html` - Admin overview with user/provider counts, bookings, emergencies, and feedback
- `login.html` - Login form with role selection and demo credentials
- `signup.html` - Signup form for new users
- `Contact.html` - Contact/support page with message submission
- `style.css` - Global styling and layout
- `js/` - JavaScript logic for every page
  - `admin-dashboard.js`
  - `booking.js`
  - `contact.js`
  - `data.js`
  - `login.js`
  - `main.js`
  - `provider-dashboard.js`
  - `services.js`
  - `signup.js`
  - `user-dashboard.js`

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Browser Local Storage for persistence
- Font Awesome icons

## Getting Started

1. Open `main.html` or `login.html` in a browser.
2. Create an account on `signup.html` or use demo credentials:
   - User: `user@gmail.com` / `123456`
   - Provider: `provider@gmail.com` / `123456`
   - Admin: `admin@gmail.com` / `123456`
3. Login with the selected role.
4. Browse services on `services.html`.
5. Choose a service and book it on `booking.html`.
6. View bookings on `user-dashboard.html`, `provider-dashboard.html`, or `admin-dashboard.html` depending on role.

## Notes

- This app is fully frontend-only and does not include a backend server.
- All data is stored locally in the browser and can be cleared by clearing browser storage.
- The app simulates realistic workflows for demos and presentations.

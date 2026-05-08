# ✅ Frontend Integration Checklist

## Step 1: Add API Service to HTML Files

Add this script tag to the `<head>` section of EACH HTML file (before other JavaScript files):

```html
<script src="js/apiService.js"></script>
```

### HTML Files to Update

- [ ] **login.html**
  ```html
  <script src="js/apiService.js"></script>
  <script src="js/login.js"></script>
  ```

- [ ] **signup.html**
  ```html
  <script src="js/apiService.js"></script>
  <script src="js/signup.js"></script>
  ```

- [ ] **booking.html**
  ```html
  <script src="js/apiService.js"></script>
  <script src="js/data.js"></script>
  <script src="js/booking.js"></script>
  ```

- [ ] **user-dashboard.html**
  ```html
  <script src="js/apiService.js"></script>
  <script src="js/data.js"></script>
  <script src="js/user-dashboard.js"></script>
  ```

- [ ] **provider-dashboard.html**
  ```html
  <script src="js/apiService.js"></script>
  <script src="js/data.js"></script>
  <script src="js/provider-dashboard.js"></script>
  ```

- [ ] **admin-dashboard.html**
  ```html
  <script src="js/apiService.js"></script>
  <script src="js/data.js"></script>
  <script src="js/admin-dashboard.js"></script>
  ```

- [ ] **services.html**
  ```html
  <script src="js/apiService.js"></script>
  <script src="js/data.js"></script>
  <script src="js/services.js"></script>
  ```

- [ ] **contact.html**
  ```html
  <script src="js/apiService.js"></script>
  <script src="js/contact.js"></script>
  ```

- [ ] **user-profile.html**
  ```html
  <script src="js/apiService.js"></script>
  <script src="js/user-profile.js"></script>
  ```

- [ ] **forgot-password.html**
  ```html
  <script src="js/apiService.js"></script>
  <script src="js/forgot-password.js"></script>
  ```

- [ ] **main.html**
  ```html
  <script src="js/apiService.js"></script>
  <script src="js/main.js"></script>
  ```

- [ ] **index.html**
  ```html
  <script src="js/apiService.js"></script>
  ```

---

## Step 2: Update Frontend Files (Already Done ✅)

These files have already been updated to use the API service:
- ✅ `js/login.js` - Uses `loginUser()` from apiService
- ✅ `js/signup.js` - Uses `registerUser()` from apiService

---

## Step 3: Update Remaining Frontend Files

### user-dashboard.js
**Current:** Uses fetch directly
**Update to:** Use `getMyBookings()`, `updateBookingStatus()`, etc.

```javascript
// OLD
fetch(`/api/bookings/mybookings?email=${loggedInUser.email}`)

// NEW
const userBookings = await getMyBookings(loggedInUser.email);
```

### admin-dashboard.js
**Current:** Uses localStorage
**Update to:** Use `getDashboardStats()`, `getAllBookings()`, etc.

```javascript
// OLD
const allBookings = JSON.parse(localStorage.getItem("allBookings")) || [];

// NEW
const stats = await getDashboardStats();
const bookings = await getAllBookings();
```

### services.js
**Current:** Uses data.js file
**Update to:** Use `getServices()`, `getServiceCategories()`

```javascript
// NEW
const services = await getServices();
const categories = await getServiceCategories();
```

### booking.js
**Current:** Partially uses API
**Update to:** Use `createBooking()` instead of fetch

```javascript
// OLD
fetch('/api/bookings', {
  method: 'POST',
  body: JSON.stringify(bookingPayload)
})

// NEW
const response = await createBooking(bookingPayload);
```

### contact.js
**Current:** Likely uses localStorage
**Update to:** Use `submitContact()`

```javascript
// NEW
const response = await submitContact({
  name, email, subject, message
});
```

### user-profile.js
**Current:** Likely uses localStorage
**Update to:** Use `getUserProfile()`, `updateUserProfile()`

```javascript
// NEW
const profile = await getUserProfile(email);
const updated = await updateUserProfile(profileData);
```

---

## Step 4: Test Each Feature

### Authentication
- [ ] Can register new user
- [ ] Can login with existing account
- [ ] Token is stored in localStorage
- [ ] Auto-redirect to dashboard after login
- [ ] Auto-redirect to login if not authenticated
- [ ] Logout clears token

### Bookings
- [ ] Can create booking
- [ ] Can view my bookings
- [ ] Can update booking status
- [ ] Can cancel booking
- [ ] Can add feedback

### Dashboard
- [ ] User dashboard loads bookings
- [ ] Provider dashboard loads provider info
- [ ] Admin dashboard shows statistics
- [ ] All data comes from backend

### Services
- [ ] Can view all services
- [ ] Can search services
- [ ] Can filter by category
- [ ] Service prices display correctly

### Profile
- [ ] Can view profile
- [ ] Can update profile info
- [ ] Can change password

---

## Step 5: Server Setup

Before testing, make sure backend is running:

```bash
# In backend folder
npm install
npm run dev

# Should show:
# Server running on port 5000
# MongoDB Connected: localhost
```

---

## Step 6: Common Issues & Fixes

### Issue: "Cannot find function registerUser"
**Fix:** Make sure `apiService.js` is included before `signup.js`

### Issue: "CORS error" or "Connection refused"
**Fix:** Backend server not running. Run `npm run dev` in backend folder

### Issue: "401 Unauthorized on protected endpoint"
**Fix:** Token not being sent. Check if token is stored: `localStorage.getItem('authToken')`

### Issue: "undefined is not a function"
**Fix:** Check script tag order - apiService.js must come FIRST

### Issue: "Booking not saving"
**Fix:** Check browser console for error messages. Make sure user is logged in.

---

## Step 7: Verify Integration

Open browser console and test:

```javascript
// Check if API service is loaded
typeof registerUser  // Should be "function"

// Check if token management works
setAuthToken("test-token");
getAuthToken();  // Should return "test-token"

// Check server health
checkServerHealth();  // Should return success response
```

---

## Quick Reference: API Service Functions

### Auth
- `registerUser(userData)`
- `loginUser(email, password)`
- `logoutUser()`
- `forgotPassword(email)`
- `resetPassword(email, securityAnswer, newPassword)`
- `getCurrentUser()`

### Bookings
- `createBooking(bookingData)`
- `getMyBookings(email)`
- `getAllBookings(filters)`
- `getBooking(bookingId)`
- `updateBookingStatus(bookingId, status)`
- `assignProvider(bookingId, providerName)`
- `addBookingFeedback(bookingId, feedback)`
- `cancelBooking(bookingId)`
- `getBookingStats()`

### Users
- `getUserProfile(email)`
- `updateUserProfile(profileData)`
- `changePassword(email, oldPassword, newPassword)`
- `getAllUsers(role)`
- `deleteUser(userId)`
- `updateUserRole(userId, role)`

### Services
- `getServices(filters)`
- `getServiceCategories()`
- `getService(serviceId)`
- `createService(serviceData)`
- `updateService(serviceId, serviceData)`
- `deleteService(serviceId)`

### Providers
- `getProviders(filters)`
- `createProvider(providerData)`
- `getProvider(providerId)`
- `updateProvider(providerId, providerData)`
- `getProviderBookings(providerId)`

### Feedback
- `submitFeedback(feedbackData)`
- `getAllFeedback(filters)`
- `getProviderFeedback(providerId)`
- `updateFeedback(feedbackId, feedbackData)`
- `deleteFeedback(feedbackId)`

### Contact
- `submitContact(contactData)`
- `getAllContacts(filters)`
- `getContact(contactId)`
- `updateContact(contactId, contactData)`
- `deleteContact(contactId)`

### Admin
- `getDashboardStats()`
- `getRecentBookings(limit)`
- `getRevenueAnalytics()`
- `getBookingTrends()`
- `getServicePerformance()`
- `getSystemHealth()`

---

## Completion Checklist

- [ ] Added apiService.js to all HTML files
- [ ] Updated login.js ✅
- [ ] Updated signup.js ✅
- [ ] Updated user-dashboard.js
- [ ] Updated admin-dashboard.js
- [ ] Updated booking.js
- [ ] Updated services.js
- [ ] Updated contact.js
- [ ] Updated user-profile.js
- [ ] Updated forgot-password.js
- [ ] Tested registration
- [ ] Tested login
- [ ] Tested booking creation
- [ ] Tested logout
- [ ] Tested admin dashboard
- [ ] Tested all main features

---

## Support

For detailed examples, see: `FRONTEND_INTEGRATION_GUIDE.md`
For API documentation, see: `docs/API_DOCUMENTATION.md`
For quick lookup, see: `docs/QUICK_REFERENCE.md`

---

**Status:** Ready for Integration  
**Version:** 1.0  
**Date:** May 7, 2026

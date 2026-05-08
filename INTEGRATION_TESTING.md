# 🧪 Frontend-Backend Integration Testing Guide

## Prerequisites

✅ Backend server running on `http://localhost:5000`
✅ MongoDB connected and running
✅ API service file added to HTML files

---

## Quick Start Test

### 1. Start Backend Server

```bash
cd College-Main-Project

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Expected output:
# Server running on port 5000
# MongoDB Connected: localhost
```

### 2. Test Server Health

Open browser console and run:

```javascript
// Test 1: Check if API service is loaded
console.log(typeof registerUser);  // Should print "function"

// Test 2: Check server health
checkServerHealth().then(data => console.log(data));
// Expected: { status: "OK", message: "Server is running" }
```

---

## Full Integration Test Flow

### Step 1: Test Registration

**File:** Open `signup.html` in browser

```javascript
// Manually test in console:
const testUser = {
  fullname: "Test User",
  email: "test" + Date.now() + "@example.com",
  password: "password123",
  location: "Test City",
  role: "user",
  securityQuestion: "What is your pet name?",
  securityAnswer: "Fluffy"
};

registerUser(testUser)
  .then(response => {
    console.log("✅ Registration successful:", response);
    console.log("Token:", getAuthToken());
  })
  .catch(error => console.error("❌ Error:", error.message));
```

**Expected Result:**
```json
{
  "_id": "...",
  "fullname": "Test User",
  "email": "test@example.com",
  "role": "user",
  "location": "Test City",
  "token": "eyJhbGc..."
}
```

### Step 2: Test Login

**File:** Open `login.html` in browser

```javascript
// Manually test in console:
loginUser("test@example.com", "password123")
  .then(response => {
    console.log("✅ Login successful:", response);
    console.log("Token stored:", getAuthToken());
  })
  .catch(error => console.error("❌ Error:", error.message));
```

### Step 3: Test Get Current User

```javascript
getCurrentUser()
  .then(user => console.log("✅ Current user:", user))
  .catch(error => console.error("❌ Error:", error.message));
```

### Step 4: Test Booking Creation

```javascript
const bookingData = {
  userEmail: "test@example.com",
  userName: "Test User",
  customerName: "Jane Doe",
  phone: "9876543210",
  service: "Plumbing Repair",
  price: "500",
  type: "normal",
  date: "2025-12-31",
  paymentId: "PAY123",
  paymentStatus: "Completed"
};

createBooking(bookingData)
  .then(response => {
    console.log("✅ Booking created:", response);
  })
  .catch(error => console.error("❌ Error:", error.message));
```

### Step 5: Test Get My Bookings

```javascript
getMyBookings("test@example.com")
  .then(bookings => {
    console.log("✅ Your bookings:", bookings);
  })
  .catch(error => console.error("❌ Error:", error.message));
```

### Step 6: Test Get Services

```javascript
getServices({ category: "Plumbing", sortBy: "price-low" })
  .then(response => {
    console.log("✅ Services loaded:", response.services);
  })
  .catch(error => console.error("❌ Error:", error.message));
```

### Step 7: Test Admin Dashboard

```javascript
getDashboardStats()
  .then(stats => {
    console.log("✅ Dashboard stats:", stats);
    console.log("Total bookings:", stats.totalBookings);
    console.log("Total revenue:", stats.totalRevenue);
  })
  .catch(error => console.error("❌ Error:", error.message));
```

---

## Testing via Postman / Insomnia

### 1. Create a New Request

**Method:** POST  
**URL:** `http://localhost:5000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Click Send** → Should get token back

### 2. Use Token for Protected Requests

**Method:** GET  
**URL:** `http://localhost:5000/api/auth/me`

**Headers:**
```
Authorization: Bearer <paste_token_here>
Content-Type: application/json
```

**Click Send** → Should return current user

---

## Automated Test Script

Create a file `test-integration.js` and run in browser console:

```javascript
/**
 * Automated Integration Test Suite
 */

console.log("🧪 Starting integration tests...\n");

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  return fn()
    .then(() => {
      console.log(`✅ ${name}`);
      testsPassed++;
    })
    .catch(error => {
      console.error(`❌ ${name}: ${error.message}`);
      testsFailed++;
    });
}

// Test Suite
async function runTests() {
  // 1. Server Health
  await test("Server health check", () => 
    checkServerHealth().then(data => {
      if (data.status !== "OK") throw new Error("Server not OK");
    })
  );

  // 2. Register User
  const uniqueEmail = `test${Date.now()}@example.com`;
  let registeredUser;
  
  await test("Register new user", () =>
    registerUser({
      fullname: "Test User",
      email: uniqueEmail,
      password: "password123",
      location: "Test City",
      role: "user",
      securityQuestion: "Pet name?",
      securityAnswer: "Fluffy"
    }).then(user => {
      registeredUser = user;
      if (!user.token) throw new Error("No token returned");
    })
  );

  // 3. Login User
  await test("Login user", () =>
    loginUser(uniqueEmail, "password123").then(user => {
      if (!user.email) throw new Error("Login failed");
      if (!getAuthToken()) throw new Error("Token not stored");
    })
  );

  // 4. Get Current User
  await test("Get current user", () =>
    getCurrentUser().then(user => {
      if (!user.email) throw new Error("No user returned");
    })
  );

  // 5. Get User Profile
  await test("Get user profile", () =>
    getUserProfile(uniqueEmail).then(profile => {
      if (!profile.email) throw new Error("No profile returned");
    })
  );

  // 6. Get Services
  await test("Get all services", () =>
    getServices().then(response => {
      if (!Array.isArray(response.services)) throw new Error("Not an array");
    })
  );

  // 7. Create Booking
  let bookingId;
  
  await test("Create booking", () =>
    createBooking({
      userEmail: uniqueEmail,
      userName: "Test User",
      customerName: "Customer",
      phone: "9876543210",
      service: "Test Service",
      price: "500",
      type: "normal",
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      paymentStatus: "Pending"
    }).then(response => {
      bookingId = response.booking._id;
      if (!bookingId) throw new Error("No booking ID returned");
    })
  );

  // 8. Get My Bookings
  await test("Get my bookings", () =>
    getMyBookings(uniqueEmail).then(bookings => {
      if (!Array.isArray(bookings)) throw new Error("Not an array");
      if (bookings.length === 0) throw new Error("No bookings found");
    })
  );

  // 9. Update Booking Status
  await test("Update booking status", () =>
    updateBookingStatus(bookingId, "Confirmed").then(response => {
      if (response.booking.status !== "Confirmed") 
        throw new Error("Status not updated");
    })
  );

  // 10. Add Feedback
  await test("Add booking feedback", () =>
    addBookingFeedback(bookingId, "Great service!").then(response => {
      if (!response.booking.feedback) throw new Error("Feedback not added");
    })
  );

  // 11. Submit Contact
  await test("Submit contact form", () =>
    submitContact({
      name: "Test Contact",
      email: "contact@example.com",
      subject: "Test",
      message: "This is a test message for contact form."
    }).then(response => {
      if (!response.contact._id) throw new Error("Contact not created");
    })
  );

  // 12. Get Dashboard Stats
  await test("Get dashboard statistics", () =>
    getDashboardStats().then(stats => {
      if (typeof stats.totalBookings !== "number") 
        throw new Error("Invalid stats");
    })
  );

  // Print Summary
  console.log("\n" + "=".repeat(50));
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log("=".repeat(50));
}

// Run tests
runTests();
```

---

## Debugging Tips

### 1. Check Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Perform an action (login, create booking, etc.)
4. Click on the request
5. Check:
   - Status code (200, 201, 401, 404, 500)
   - Request Headers (Authorization header present?)
   - Response (error message?)

### 2. Check Console Errors

1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Check if `apiService.js` is loaded

### 3. Verify Token Storage

```javascript
// In console:
localStorage.getItem('authToken')  // Should show token
localStorage.getItem('loggedInUser')  // Should show user object
```

### 4. Check if Server is Running

```bash
# Test in terminal
curl http://localhost:5000/api/health

# Should return:
# {"status":"OK","message":"Server is running"}
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find function registerUser" | Add `<script src="js/apiService.js"></script>` BEFORE other scripts |
| "CORS error" | Backend server not running. Run `npm run dev` |
| "401 Unauthorized" | Token expired. Login again |
| "404 Not Found" | Endpoint doesn't exist. Check URL |
| "Data not saving" | Check browser console for errors. Check backend logs |
| "Page refreshes on login" | Add `event.preventDefault()` to form submit |

---

## Manual Browser Testing

### 1. Register Flow
1. Open `signup.html`
2. Fill in all fields
3. Click "Sign Up"
4. Should redirect to dashboard or login

### 2. Login Flow
1. Open `login.html`
2. Enter email and password
3. Select role
4. Click "Login"
5. Should redirect to dashboard

### 3. Booking Flow
1. Login as user
2. Go to `booking.html`
3. Select service and fill details
4. Complete booking
5. Should appear in user dashboard

### 4. Admin Dashboard
1. Login as admin
2. Open `admin-dashboard.html`
3. Should show statistics and bookings
4. All data from backend

---

## Performance Testing

### Measure API Response Time

```javascript
async function measurePerformance() {
  const start = performance.now();
  
  const response = await getDashboardStats();
  
  const end = performance.now();
  console.log(`Response time: ${(end - start).toFixed(2)}ms`);
}

measurePerformance();
```

---

## Final Verification

- [ ] Can register new user → Token created
- [ ] Can login → Redirected to dashboard
- [ ] Can create booking → Data saved in DB
- [ ] Can view bookings → Data from backend
- [ ] Can update booking → Status changes
- [ ] Can view services → Loaded from backend
- [ ] Admin stats → Show correct numbers
- [ ] Logout → Token cleared, redirected to login

---

## Next Steps

✅ All tests passing?
1. Update remaining frontend files (see INTEGRATION_CHECKLIST.md)
2. Deploy to production
3. Add email notifications
4. Add payment gateway integration

---

**Test Date:** ___________  
**All Tests Passing:** ☐ Yes ☐ No  
**Issues Found:** ___________________

---

**Version:** 1.0  
**Last Updated:** May 7, 2026

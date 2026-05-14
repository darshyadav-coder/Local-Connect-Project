# 🔗 Frontend & Backend Integration Guide

## Quick Integration Steps

### 1. Include API Service in HTML Files

Add this script tag to the `<head>` section of ALL your HTML files (before other JS files):

```html
<script src="js/apiService.js"></script>
```

**Example for login.html:**
```html
<head>
  ...
  <script src="js/apiService.js"></script>
  <script src="js/login.js"></script>
</head>
```

---

## API Service Usage Examples

### Authentication

#### Register User
```javascript
const userData = {
  fullname: "John Doe",
  email: "john@example.com",
  password: "password123",
  location: "New York, NY",
  role: "user",
  securityQuestion: "What is your pet name?",
  securityAnswer: "Fluffy"
};

try {
  const response = await registerUser(userData);
  setAuthToken(response.token);
  localStorage.setItem("loggedInUser", JSON.stringify(response));
} catch (error) {
  console.error(error.message);
}
```

#### Login User
```javascript
try {
  const response = await loginUser("email@example.com", "password123");
  // Token is automatically stored by loginUser()
  localStorage.setItem("loggedInUser", JSON.stringify(response));
} catch (error) {
  console.error(error.message);
}
```

#### Logout
```javascript
clearAuthToken();
localStorage.removeItem("loggedInUser");
window.location.href = "login.html";
```

### Bookings

#### Create Booking
```javascript
const bookingData = {
  userEmail: loggedInUser.email,
  userName: loggedInUser.fullname,
  customerName: "Jane Doe",
  phone: "9876543210",
  service: "Plumbing Repair",
  price: "500",
  type: "normal",
  date: "2024-12-31",
  paymentId: "PAY123",
  paymentStatus: "Paid"
};

try {
  const response = await createBooking(bookingData);
  console.log("Booking created:", response.booking);
} catch (error) {
  console.error(error.message);
}
```

#### Get My Bookings
```javascript
try {
  const bookings = await getMyBookings(loggedInUser.email);
  console.log("My bookings:", bookings);
} catch (error) {
  console.error(error.message);
}
```

#### Update Booking Status
```javascript
try {
  const response = await updateBookingStatus(bookingId, "Completed");
  console.log("Status updated:", response.booking);
} catch (error) {
  console.error(error.message);
}
```

#### Add Feedback
```javascript
try {
  const response = await addBookingFeedback(bookingId, "Great service!");
  console.log("Feedback added:", response.booking);
} catch (error) {
  console.error(error.message);
}
```

### Services

#### Get All Services
```javascript
try {
  const response = await getServices({
    category: "Plumbing",
    sortBy: "price-low"
  });
  console.log("Services:", response.services);
} catch (error) {
  console.error(error.message);
}
```

#### Get Service Categories
```javascript
try {
  const response = await getServiceCategories();
  console.log("Categories:", response.categories);
} catch (error) {
  console.error(error.message);
}
```

### Users

#### Get User Profile
```javascript
try {
  const profile = await getUserProfile(email);
  console.log("User profile:", profile);
} catch (error) {
  console.error(error.message);
}
```

#### Update Profile
```javascript
try {
  const response = await updateUserProfile({
    email: loggedInUser.email,
    fullname: "New Name",
    location: "New City"
  });
  console.log("Profile updated:", response.user);
} catch (error) {
  console.error(error.message);
}
```

#### Change Password
```javascript
try {
  const response = await changePassword(
    email,
    "oldPassword",
    "newPassword"
  );
  console.log("Password changed:", response.message);
} catch (error) {
  console.error(error.message);
}
```

### Providers

#### Get All Providers
```javascript
try {
  const response = await getProviders({
    service: "Plumbing",
    sortBy: "rating-high"
  });
  console.log("Providers:", response.providers);
} catch (error) {
  console.error(error.message);
}
```

#### Create Provider Profile
```javascript
try {
  const response = await createProvider({
    userId: userId,
    servicesOffered: ["Plumbing", "Electrical"],
    bio: "Professional services",
    experience: "10 years"
  });
  console.log("Provider created:", response.provider);
} catch (error) {
  console.error(error.message);
}
```

### Admin Functions

#### Get Dashboard Stats
```javascript
try {
  const stats = await getDashboardStats();
  console.log("Total bookings:", stats.totalBookings);
  console.log("Total revenue:", stats.totalRevenue);
  console.log("Status breakdown:", stats.statusBreakdown);
} catch (error) {
  console.error(error.message);
}
```

#### Get All Bookings
```javascript
try {
  const response = await getAllBookings({
    status: "Pending",
    sortBy: "latest"
  });
  console.log("All bookings:", response.bookings);
} catch (error) {
  console.error(error.message);
}
```

#### Get Revenue Analytics
```javascript
try {
  const analytics = await getRevenueAnalytics();
  console.log("Total revenue:", analytics.totalRevenue);
  console.log("By service:", analytics.revenueByService);
} catch (error) {
  console.error(error.message);
}
```

### Contact

#### Submit Contact Form
```javascript
try {
  const response = await submitContact({
    name: "John Doe",
    email: "john@example.com",
    subject: "Issue with booking",
    message: "I have a problem with my recent booking..."
  });
  console.log("Contact submitted:", response.contact);
} catch (error) {
  console.error(error.message);
}
```

---

## Updated Files

### Files Already Updated to Use API Service
- ✅ `js/login.js` - Backend authentication
- ✅ `js/signup.js` - Backend registration

### Files Still Need Updates
These files are still using localStorage but could be updated to use backend APIs:
- `js/user-dashboard.js` - Fetch user bookings (already partially done)
- `js/provider-dashboard.js` - Fetch provider bookings
- `js/admin-dashboard.js` - Fetch all stats & bookings
- `js/services.js` - Load services from backend
- `js/booking.js` - Already uses backend API partially

---

## Authentication Flow

### 1. User Logs In
```javascript
// apiService.js automatically stores token
const response = await loginUser(email, password);
localStorage.setItem("loggedInUser", JSON.stringify(response));
```

### 2. Token is Sent with Every Request
```javascript
// apiService.js automatically adds header:
// Authorization: Bearer <token>
```

### 3. Protected Routes Check Token
```javascript
// In dashboard files, check if logged in:
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
const token = getAuthToken();

if (!token || !loggedInUser) {
  window.location.href = "login.html";
}
```

---

## Error Handling

All API functions throw errors that you can catch:

```javascript
try {
  const response = await getServices();
  // Handle success
} catch (error) {
  // error.message contains the error message
  console.error("Error:", error.message);
  showToast(error.message, "error");
}
```

Common error scenarios:
- **401 Unauthorized** - Token expired, redirect to login
- **404 Not Found** - Resource doesn't exist
- **400 Bad Request** - Invalid input data
- **500 Server Error** - Server-side issue

---

## Testing the Integration

### Test 1: Check Server Health
```javascript
// Should return { status: "OK", message: "Server is running" }
const health = await checkServerHealth();
console.log(health);
```

### Test 2: Register User
```javascript
const newUser = {
  fullname: "Test User",
  email: "test@example.com",
  password: "password123",
  location: "Test City",
  role: "user",
  securityQuestion: "Pet name?",
  securityAnswer: "Fluffy"
};
const response = await registerUser(newUser);
console.log(response);
```

### Test 3: Login User
```javascript
const login = await loginUser("test@example.com", "password123");
console.log("Token:", getAuthToken());
console.log("User:", login);
```

---

## HTML Files - Script Tag Order

**IMPORTANT:** Always include `apiService.js` BEFORE other JS files:

### login.html
```html
<script src="js/apiService.js"></script>
<script src="js/login.js"></script>
<script src="js/utils.js"></script>
```

### signup.html
```html
<script src="js/apiService.js"></script>
<script src="js/signup.js"></script>
<script src="js/utils.js"></script>
```

### user-dashboard.html
```html
<script src="js/apiService.js"></script>
<script src="js/data.js"></script>
<script src="js/user-dashboard.js"></script>
<script src="js/utils.js"></script>
```

### admin-dashboard.html
```html
<script src="js/apiService.js"></script>
<script src="js/data.js"></script>
<script src="js/admin-dashboard.js"></script>
<script src="js/utils.js"></script>
```

### booking.html
```html
<script src="js/apiService.js"></script>
<script src="js/data.js"></script>
<script src="js/booking.js"></script>
<script src="js/paymentService.js"></script>
<script src="js/utils.js"></script>
```

---

## Database Persistence

All data is now stored in MongoDB backend:
- ✅ User accounts
- ✅ Bookings
- ✅ Services
- ✅ Providers
- ✅ Feedback & ratings
- ✅ Contact messages

**No more localStorage for data** - Only use localStorage for:
- JWT token
- Current user info

---

## CORS Configuration

Backend is already configured with CORS enabled for `http://localhost:5000`:

```javascript
// In server.js
app.use(cors());
```

For production, update CORS to specific origin:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

---

## Token Management

### Store Token
```javascript
// Automatically called by loginUser() and registerUser()
setAuthToken(response.token);
```

### Retrieve Token
```javascript
const token = getAuthToken();
```

### Clear Token
```javascript
// Called when logging out or token expires
clearAuthToken();
```

### Check Authentication
```javascript
if (isAuthenticated()) {
  // User is logged in
}
```

---

## Troubleshooting

### "Cannot find API function"
- Make sure `apiService.js` is included BEFORE your page's JS file
- Check script tag order in HTML

### "Token not being sent"
- Make sure you called `setAuthToken()` after login
- Check browser DevTools → Network tab → Headers

### "401 Unauthorized errors"
- Token may be expired
- Try logging in again
- Check token in localStorage

### "CORS error"
- Backend server may not be running
- Check if `http://localhost:5000` is accessible
- Run `npm run dev` in backend folder

---

## Next Steps

1. ✅ Include `apiService.js` in all HTML files
2. ✅ Update remaining frontend files to use API service
3. ✅ Test each endpoint in browser console
4. ✅ Remove any localStorage-based data storage (except token & user info)
5. ✅ Deploy to production

---

**Version:** 1.0  
**Last Updated:** May 7, 2026

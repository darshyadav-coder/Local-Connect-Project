# Complete Backend API Documentation

## Local Connect - Backend Services

This is a complete backend system for a local service booking application built with Express.js and MongoDB.

---

## 🔐 Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "fullname": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "location": "City, State",
    "role": "user|provider|admin",
    "securityQuestion": "What is your pet's name?",
    "securityAnswer": "Fluffy"
  }
  ```
- **Response:** User object with JWT token

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** User object with JWT token

### Forgot Password
- **POST** `/api/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Response:** Security question for verification

### Verify Security Answer & Reset Password
- **POST** `/api/auth/verify-answer`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "securityAnswer": "Fluffy",
    "newPassword": "newpassword123"
  }
  ```
- **Response:** New JWT token

### Get Current User
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Current user object

### Logout
- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Logout success message

---

## 📅 Booking Endpoints

### Create Booking
- **POST** `/api/bookings`
- **Body:**
  ```json
  {
    "userEmail": "john@example.com",
    "userName": "John Doe",
    "customerName": "Jane Doe",
    "phone": "9876543210",
    "service": "Plumbing",
    "price": "500",
    "type": "normal|emergency",
    "date": "2024-12-31",
    "paymentId": "PAY123",
    "paymentStatus": "Completed"
  }
  ```

### Get My Bookings
- **GET** `/api/bookings/mybookings?email=john@example.com`

### Get All Bookings (Admin)
- **GET** `/api/bookings?status=Pending&service=Plumbing&sortBy=latest`

### Get Single Booking
- **GET** `/api/bookings/:id`

### Get Booking Statistics
- **GET** `/api/bookings/stats/overview`

### Update Booking Status
- **PUT** `/api/bookings/:id/status`
- **Body:**
  ```json
  {
    "status": "Confirmed|In Progress|Completed|Cancelled"
  }
  ```

### Assign Provider to Booking
- **PUT** `/api/bookings/:id/assign-provider`
- **Body:**
  ```json
  {
    "provider": "Provider Name"
  }
  ```

### Add Feedback to Booking
- **PUT** `/api/bookings/:id/feedback`
- **Body:**
  ```json
  {
    "feedback": "Great service, very professional"
  }
  ```

### Cancel Booking
- **DELETE** `/api/bookings/:id`

---

## 👥 User Management Endpoints

### Get User Profile
- **GET** `/api/users/profile?email=john@example.com`

### Update User Profile
- **PUT** `/api/users/profile`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "fullname": "John Doe",
    "location": "City, State"
  }
  ```

### Change Password
- **PUT** `/api/users/change-password`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "oldPassword": "oldpass123",
    "newPassword": "newpass123"
  }
  ```

### Get All Users (Admin)
- **GET** `/api/users?role=user|provider|admin`

### Delete User (Admin)
- **DELETE** `/api/users/:id`

### Update User Role (Admin)
- **PUT** `/api/users/:id/role`
- **Body:**
  ```json
  {
    "role": "user|provider|admin"
  }
  ```

---

## 🔧 Service Endpoints

### Get All Services
- **GET** `/api/services?category=Plumbing&sortBy=price-low`

### Get Service Categories
- **GET** `/api/services/categories/list`

### Get Single Service
- **GET** `/api/services/:id`

### Create Service (Admin)
- **POST** `/api/services`
- **Body:**
  ```json
  {
    "name": "Basic Plumbing",
    "category": "Plumbing",
    "description": "Basic plumbing repairs",
    "price": 500,
    "icon": "fa-wrench"
  }
  ```

### Update Service (Admin)
- **PUT** `/api/services/:id`
- **Body:** Same as create (all fields optional)

### Delete Service (Admin)
- **DELETE** `/api/services/:id`

---

## 📞 Contact Endpoints

### Submit Contact Form
- **POST** `/api/contact`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Issue with booking",
    "message": "I had an issue with my recent booking..."
  }
  ```

### Get All Contact Messages (Admin)
- **GET** `/api/contact?status=new&sortBy=latest`

### Get Single Contact
- **GET** `/api/contact/:id`

### Update Contact (Admin)
- **PUT** `/api/contact/:id`
- **Body:**
  ```json
  {
    "status": "new|read|resolved",
    "response": "Thank you for contacting us..."
  }
  ```

### Delete Contact (Admin)
- **DELETE** `/api/contact/:id`

---

## 👨‍💼 Provider Endpoints

### Create Provider Profile
- **POST** `/api/providers`
- **Body:**
  ```json
  {
    "userId": "user_id",
    "servicesOffered": ["Plumbing", "Electrical"],
    "bio": "Professional plumber with 10 years experience",
    "experience": "10 years in plumbing and electrical"
  }
  ```

### Get All Providers
- **GET** `/api/providers?service=Plumbing&rating=4&sortBy=rating-high`

### Get Provider Profile
- **GET** `/api/providers/:id`

### Update Provider Profile
- **PUT** `/api/providers/:id`
- **Body:** Same as create (all fields optional)

### Get Provider Bookings
- **GET** `/api/providers/:id/bookings`

### Update Provider Statistics
- **PUT** `/api/providers/:id/stats`

### Delete Provider (soft delete)
- **DELETE** `/api/providers/:id`

---

## 📊 Admin Dashboard Endpoints

### Get Dashboard Statistics
- **GET** `/api/admin/stats`
- **Response:**
  ```json
  {
    "totalUsers": 100,
    "totalProviders": 20,
    "totalBookings": 500,
    "totalServices": 15,
    "totalRevenue": 50000,
    "statusBreakdown": {...},
    "unreadContacts": 5
  }
  ```

### Get Recent Bookings
- **GET** `/api/admin/recent-bookings?limit=10`

### Get Revenue Analytics
- **GET** `/api/admin/revenue`

### Get Booking Trends
- **GET** `/api/admin/trends`

### Get Service Performance
- **GET** `/api/admin/service-performance`

### System Health Check
- **GET** `/api/admin/health`

---

## 🏥 Utility Endpoints

### Health Check
- **GET** `/api/health`
- **Response:** `{ "status": "OK", "message": "Server is running" }`

---

## Error Response Format

All errors follow this format:
```json
{
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## 📦 Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   Copy `.env.example` to `.env` and fill in your values:
   ```
   MONGO_URI=mongodb://localhost:27017/localconnect
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

3. **Run Server:**
   ```bash
   npm start          # Production
   npm run dev        # Development (with nodemon)
   ```

---

## 🔑 Authentication

Most endpoints (except auth and public endpoints) require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Validation Rules

- **Email:** Valid email format required
- **Password:** Minimum 6 characters
- **Phone:** 10 digits, starting with 6-9 (India format)
- **Booking Date:** Must be future date
- **Security Answer:** Case-insensitive comparison

---

## 🚀 Advanced Features

1. **Booking Management:** Create, update, cancel, assign providers
2. **Role-based Access:** User, Provider, Admin roles
3. **Service Catalog:** Manage services with categories
4. **Provider Profiles:** Track provider stats and services
5. **Admin Dashboard:** Comprehensive analytics and statistics
6. **Contact Management:** Customer support ticket system
7. **Password Recovery:** Security question-based password reset

---

Last Updated: May 7, 2026

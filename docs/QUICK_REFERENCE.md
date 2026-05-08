# 🔗 Backend API Quick Reference

## Authentication (6 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Initiate password reset |
| POST | `/api/auth/verify-answer` | Verify security answer & reset |
| GET | `/api/auth/me` | Get current user (protected) |
| POST | `/api/auth/logout` | Logout user (protected) |

## Bookings (9 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Get all bookings (with filters) |
| GET | `/api/bookings/mybookings` | Get user's bookings |
| GET | `/api/bookings/stats/overview` | Get booking statistics |
| GET | `/api/bookings/:id` | Get single booking |
| PUT | `/api/bookings/:id/status` | Update booking status |
| PUT | `/api/bookings/:id/assign-provider` | Assign provider |
| PUT | `/api/bookings/:id/feedback` | Add feedback |
| DELETE | `/api/bookings/:id` | Cancel booking |

## Users (6 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/change-password` | Change password |
| GET | `/api/users` | Get all users (admin) |
| DELETE | `/api/users/:id` | Delete user (admin) |
| PUT | `/api/users/:id/role` | Update user role (admin) |

## Services (6 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services |
| GET | `/api/services/categories/list` | Get categories |
| POST | `/api/services` | Create service (admin) |
| GET | `/api/services/:id` | Get service details |
| PUT | `/api/services/:id` | Update service (admin) |
| DELETE | `/api/services/:id` | Delete service (admin) |

## Providers (7 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/providers` | Get all providers |
| POST | `/api/providers` | Create provider |
| GET | `/api/providers/:id` | Get provider profile |
| PUT | `/api/providers/:id` | Update provider |
| DELETE | `/api/providers/:id` | Delete provider |
| GET | `/api/providers/:id/bookings` | Get provider bookings |
| PUT | `/api/providers/:id/stats` | Update provider stats |

## Feedback (5 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit feedback |
| GET | `/api/feedback` | Get all feedback (admin) |
| GET | `/api/feedback/provider/:providerId` | Get provider feedback |
| PUT | `/api/feedback/:id` | Update feedback |
| DELETE | `/api/feedback/:id` | Delete feedback |

## Contact (5 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form |
| GET | `/api/contact` | Get all messages (admin) |
| GET | `/api/contact/:id` | Get message details |
| PUT | `/api/contact/:id` | Update message status |
| DELETE | `/api/contact/:id` | Delete message |

## Admin Dashboard (6 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/recent-bookings` | Recent bookings |
| GET | `/api/admin/revenue` | Revenue analytics |
| GET | `/api/admin/trends` | Booking trends |
| GET | `/api/admin/service-performance` | Service performance |
| GET | `/api/admin/health` | System health |

## Utilities (1 endpoint)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

---

## Common Query Parameters

### Filtering
- `status`: Filter by status
- `service`: Filter by service name
- `category`: Filter by category
- `role`: Filter by user role
- `email`: Get specific user email

### Sorting
- `sortBy=latest`: Most recent first
- `sortBy=oldest`: Oldest first
- `sortBy=price-high`: Highest price first
- `sortBy=price-low`: Lowest price first
- `sortBy=rating-high`: Highest rating first
- `sortBy=rating-low`: Lowest rating first

### Pagination
- `limit`: Number of results (used in admin endpoints)

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - No/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

## Required Headers

### For All Requests
```
Content-Type: application/json
```

### For Protected Endpoints
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Sample Request/Response

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "location": "New York, NY",
    "role": "user",
    "securityQuestion": "What is your pet name?",
    "securityAnswer": "Fluffy"
  }'
```

### Response
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "fullname": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "location": "New York, NY",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Booking Status Flow

```
Pending → Confirmed → In Progress → Completed
                   ↓
              Cancelled (anytime)
```

---

## Service Fields

```json
{
  "_id": "ObjectId",
  "name": "string",
  "category": "string",
  "description": "string",
  "price": "number",
  "icon": "string (FontAwesome class)",
  "isActive": "boolean"
}
```

---

## Booking Types

- `normal` - Regular booking
- `emergency` - Emergency booking (25% surcharge)

---

## User Roles

- `user` - Regular customer
- `provider` - Service provider
- `admin` - Administrator

---

## Contact Status

- `new` - New message
- `read` - Message read
- `resolved` - Issue resolved

---

## Feedback Rating

- Scale: 1-5 stars
- 1: Poor
- 2: Fair
- 3: Good
- 4: Very Good
- 5: Excellent

---

## Validation Rules

| Field | Rule |
|-------|------|
| Email | Valid email format |
| Password | Min 6 characters |
| Phone | 10 digits, starts with 6-9 |
| Rating | 1-5 |
| Booking Date | Future date only |

---

## Error Response Format

```json
{
  "message": "Error description here"
}
```

---

## Database Models

### User
- fullname, email, password, location, role, securityQuestion, securityAnswer, timestamps

### Booking
- userEmail, userName, customerName, phone, service, price, type, date, status, provider, feedback, paymentId, paymentStatus, timestamps

### Provider
- user (ref), servicesOffered, rating, totalBookings, completedBookings, cancelledBookings, avgRating, totalReviews, isActive, bio, experience, timestamps

### Service
- name, category, description, price, icon, isActive, timestamps

### Contact
- name, email, subject, message, status, response, timestamps

### Feedback
- booking (ref), userEmail, rating, comment, providerId, timestamps

---

**Total Endpoints: 50+**  
**Last Updated: May 7, 2026**

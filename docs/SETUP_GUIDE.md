# 🚀 Backend Setup & Installation Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

---

## 📦 Installation Steps

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- nodemon (dev)

### Step 2: Set Up Environment Variables

1. Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/localconnect
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Configuration
JWT_SECRET=your_very_secure_secret_key_here_change_this

# Server Port
PORT=5000

# Environment
NODE_ENV=development
```

### Step 3: Set Up MongoDB

#### Option A: Local MongoDB

1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo service mongod start
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Add to `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/localconnect
   ```

### Step 4: Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Expected output:
```
Server running on port 5000
MongoDB Connected: localhost
```

---

## ✅ Verification

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### Test 2: Admin Health
```bash
curl http://localhost:5000/api/admin/health
```

### Test 3: Create a User (Register)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "location": "City, State",
    "role": "user",
    "securityQuestion": "What is your pet name?",
    "securityAnswer": "Fluffy"
  }'
```

---

## 🔧 Configuration Details

### Database Connection
- Mongoose handles connection pooling
- Automatic reconnection on failure
- Connection timeout: default settings

### JWT Tokens
- Expiration: 30 days
- Algorithm: HS256
- Secret: Set in `.env`

### CORS Settings
- All origins allowed in development
- Modify in production for security

### Static Files
- Frontend files served from root directory
- HTML files accessible at `/`

---

## 📁 Project Structure Quick Reference

```
├── server.js              # Main server file
├── config/
│   └── db.js             # Database connection
├── models/               # Mongoose schemas
├── controllers/          # Business logic
├── routes/               # API endpoints
├── middleware/           # Auth, error handling
├── utils/               # Helpers & validators
└── docs/                # Documentation
```

---

## 🧪 Testing APIs with Postman/Insomnia

### Import Collection

1. Open Postman/Insomnia
2. Create new collection: "Local Connect API"
3. Add requests for each endpoint

### Common Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

### Example: Login Flow

1. **Register**
   ```
   POST /api/auth/register
   Body: { fullname, email, password, location, role, securityQuestion, securityAnswer }
   ```

2. **Login**
   ```
   POST /api/auth/login
   Body: { email, password }
   Response: { token }
   ```

3. **Use Token**
   ```
   GET /api/auth/me
   Headers: Authorization: Bearer <token>
   ```

---

## 🐛 Troubleshooting

### Problem: "MongoDB Connected" not showing

**Solution:**
- Check MongoDB is running
- Verify MONGO_URI in .env
- Check network connectivity

### Problem: "Cannot find module 'express'"

**Solution:**
```bash
npm install
```

### Problem: Port 5000 already in use

**Solution:**
```bash
# Option 1: Change port in .env
PORT=5001

# Option 2: Kill process using port (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Option 2: Kill process using port (macOS/Linux)
lsof -ti:5000 | xargs kill -9
```

### Problem: JWT_SECRET not set

**Solution:**
- Create `.env` file
- Add: `JWT_SECRET=your_secret_key`

### Problem: CORS errors

**Solution:**
- CORS is enabled for all origins
- Check headers in requests
- Verify Content-Type is application/json

---

## 📊 Database Initialization

### Create Sample Services (Optional)

```javascript
// In MongoDB shell or via API
db.services.insertMany([
  {
    name: "Plumbing Repair",
    category: "Plumbing",
    description: "General plumbing repairs",
    price: 500,
    icon: "fa-wrench"
  },
  {
    name: "Electrical Work",
    category: "Electrical",
    description: "General electrical services",
    price: 600,
    icon: "fa-bolt"
  }
  // ... more services
])
```

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to a strong value
- [ ] Set NODE_ENV=production for production
- [ ] Use HTTPS in production
- [ ] Enable MongoDB authentication
- [ ] Restrict CORS to specific origins
- [ ] Use environment variables for all secrets
- [ ] Implement rate limiting
- [ ] Enable logging and monitoring

---

## 📈 Performance Tips

1. **Add Indexes**
   ```javascript
   // In MongoDB
   db.users.createIndex({ email: 1 })
   db.bookings.createIndex({ userEmail: 1 })
   ```

2. **Enable Compression**
   ```bash
   npm install compression
   ```

3. **Use Connection Pooling**
   - Already built-in with Mongoose

4. **Implement Caching**
   - Consider Redis for frequently accessed data

---

## 📚 Useful Commands

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Run in production
npm start

# Check Node version
node --version

# Check npm version
npm --version

# List installed packages
npm list
```

---

## 🎯 Next Steps

1. **Frontend Integration**
   - Update frontend API calls to use new endpoints
   - Store JWT token from login
   - Send token in Authorization header

2. **Database Seeding**
   - Add initial services data
   - Add test users/providers
   - Set up admin account

3. **Testing**
   - Use Postman to test endpoints
   - Load test with Apache Bench or artillery
   - Test error scenarios

4. **Deployment**
   - Deploy to Heroku, DigitalOcean, or AWS
   - Set up production MongoDB
   - Configure CI/CD pipeline

---

## 📞 Support

For issues or questions:
1. Check API documentation in `docs/API_DOCUMENTATION.md`
2. Review error messages in server logs
3. Check MongoDB connection
4. Verify environment variables

---

**Last Updated:** May 7, 2026  
**Version:** 1.0.0

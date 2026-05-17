/**
 * =========================================================================
 * API SERVICE - Centralized Backend Communication
 * =========================================================================
 * This service handles all API calls to the backend with:
 * - JWT token management
 * - Error handling
 * - Request/response formatting
 * - CORS support
 */

const isDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const PROD_API_URL = "https://local-connect-project.onrender.com/api";
const API_BASE_URL = isDevelopment ? "http://localhost:5000/api" : PROD_API_URL;

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Store JWT token in localStorage
 */
function setAuthToken(token) {
  if (token) {
    localStorage.setItem("authToken", token);
  }
}

/**
 * Get JWT token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem("authToken");
}

/**
 * Clear JWT token
 */
function clearAuthToken() {
  localStorage.removeItem("authToken");
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return !!getAuthToken();
}

// ============================================
// REQUEST HELPER
// ============================================

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} body - Request body for POST/PUT
 * @returns {Promise} Response data
 */
async function apiCall(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    // Handle 401 - Unauthorized (token expired)
    if (response.status === 401) {
      clearAuthToken();
      window.location.href = "login.html";
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * Register new user
 */
async function registerUser(userData) {
  return apiCall("/auth/register", "POST", userData);
}

/**
 * Login user
 */
async function loginUser(email, password) {
  const response = await apiCall("/auth/login", "POST", { email, password });
  if (response.token) {
    setAuthToken(response.token);
  }
  return response;
}

/**
 * Logout user
 */
async function logoutUser() {
  clearAuthToken();
  return apiCall("/auth/logout", "POST");
}

/**
 * Forgot password - get security question
 */
async function forgotPassword(email) {
  return apiCall("/auth/forgot-password", "POST", { email });
}

/**
 * Verify security answer and reset password
 */
async function resetPassword(email, securityAnswer, newPassword) {
  const response = await apiCall("/auth/verify-answer", "POST", {
    email,
    securityAnswer,
    newPassword,
  });
  if (response.token) {
    setAuthToken(response.token);
  }
  return response;
}

/**
 * Get current user
 */
async function getCurrentUser() {
  return apiCall("/auth/me", "GET");
}

// ============================================
// BOOKING ENDPOINTS
// ============================================

/**
 * Create new booking
 */
async function createBooking(bookingData) {
  return apiCall("/bookings", "POST", bookingData);
}

/**
 * Get user's bookings
 */
async function getMyBookings(email) {
  return apiCall(`/bookings/mybookings?email=${email}`, "GET");
}

/**
 * Get all bookings (admin)
 */
async function getAllBookings(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiCall(`/bookings?${params}`, "GET");
}

/**
 * Get single booking
 */
async function getBooking(bookingId) {
  return apiCall(`/bookings/${bookingId}`, "GET");
}

/**
 * Update booking status
 */
async function updateBookingStatus(bookingId, status) {
  return apiCall(`/bookings/${bookingId}/status`, "PUT", { status });
}

/**
 * Update booking details
 */
async function updateBooking(bookingId, bookingData) {
  return apiCall(`/bookings/${bookingId}`, "PUT", bookingData);
}

/**
 * Assign provider to booking
 */
async function assignProvider(bookingId, providerName) {
  return apiCall(`/bookings/${bookingId}/assign-provider`, "PUT", {
    provider: providerName,
  });
}

/**
 * Add feedback to booking
 */
async function addBookingFeedback(bookingId, feedback) {
  return apiCall(`/bookings/${bookingId}/feedback`, "PUT", { feedback });
}

/**
 * Cancel booking
 */
async function cancelBooking(bookingId) {
  return apiCall(`/bookings/${bookingId}`, "DELETE");
}

/**
 * Verify booking OTP
 */
async function verifyBookingOTP(bookingId, otp) {
  return apiCall(`/bookings/${bookingId}/verify-otp`, "POST", { otp });
}

/**
 * Get booking statistics
 */
async function getBookingStats() {
  return apiCall("/bookings/stats/overview", "GET");
}

// ============================================
// USER ENDPOINTS
// ============================================

/**
 * Get user profile
 */
async function getUserProfile(email) {
  return apiCall(`/users/profile?email=${email}`, "GET");
}

/**
 * Update user profile
 */
async function updateUserProfile(profileData) {
  return apiCall("/users/profile", "PUT", profileData);
}

/**
 * Change password
 */
async function changePassword(email, oldPassword, newPassword) {
  return apiCall("/users/change-password", "PUT", {
    email,
    oldPassword,
    newPassword,
  });
}

/**
 * Get all users (admin)
 */
async function getAllUsers(role = null) {
  const params = role ? `?role=${role}` : "";
  return apiCall(`/users${params}`, "GET");
}

/**
 * Delete user (admin)
 */
async function deleteUser(userId) {
  return apiCall(`/users/${userId}`, "DELETE");
}

/**
 * Update user role (admin)
 */
async function updateUserRole(userId, role) {
  return apiCall(`/users/${userId}/role`, "PUT", { role });
}

// ============================================
// SERVICE ENDPOINTS
// ============================================

/**
 * Get all services
 */
async function getServices(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiCall(`/services?${params}`, "GET");
}

/**
 * Get service categories
 */
async function getServiceCategories() {
  return apiCall("/services/categories/list", "GET");
}

/**
 * Get single service
 */
async function getService(serviceId) {
  return apiCall(`/services/${serviceId}`, "GET");
}

/**
 * Create service (admin)
 */
async function createService(serviceData) {
  return apiCall("/services", "POST", serviceData);
}

/**
 * Update service (admin)
 */
async function updateService(serviceId, serviceData) {
  return apiCall(`/services/${serviceId}`, "PUT", serviceData);
}

/**
 * Delete service (admin)
 */
async function deleteService(serviceId) {
  return apiCall(`/services/${serviceId}`, "DELETE");
}

// ============================================
// PROVIDER ENDPOINTS
// ============================================

/**
 * Get all providers
 */
async function getProviders(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiCall(`/providers?${params}`, "GET");
}

/**
 * Create provider profile
 */
async function createProvider(providerData) {
  return apiCall("/providers", "POST", providerData);
}

/**
 * Get provider profile
 */
async function getProvider(providerId) {
  return apiCall(`/providers/${providerId}`, "GET");
}

/**
 * Update provider profile
 */
async function updateProvider(providerId, providerData) {
  return apiCall(`/providers/${providerId}`, "PUT", providerData);
}

/**
 * Approve provider (admin)
 */
async function approveProvider(providerId, isApproved = true) {
  return apiCall(`/providers/${providerId}/approve`, "PUT", { isApproved });
}

/**
 * Get provider bookings
 */
async function getProviderBookings(providerId) {
  return apiCall(`/providers/${providerId}/bookings`, "GET");
}

/**
 * Update provider statistics
 */
async function updateProviderStats(providerId) {
  return apiCall(`/providers/${providerId}/stats`, "PUT");
}

// ============================================
// FEEDBACK ENDPOINTS
// ============================================

/**
 * Submit feedback
 */
async function submitFeedback(feedbackData) {
  return apiCall("/feedback", "POST", feedbackData);
}

/**
 * Get all feedback (admin)
 */
async function getAllFeedback(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiCall(`/feedback?${params}`, "GET");
}

/**
 * Get provider feedback
 */
async function getProviderFeedback(providerId) {
  return apiCall(`/feedback/provider/${providerId}`, "GET");
}

/**
 * Update feedback
 */
async function updateFeedback(feedbackId, feedbackData) {
  return apiCall(`/feedback/${feedbackId}`, "PUT", feedbackData);
}

/**
 * Delete feedback
 */
async function deleteFeedback(feedbackId) {
  return apiCall(`/feedback/${feedbackId}`, "DELETE");
}

// ============================================
// CONTACT ENDPOINTS
// ============================================

/**
 * Submit contact form
 */
async function submitContact(contactData) {
  return apiCall("/contact", "POST", contactData);
}

/**
 * Get all contacts (admin)
 */
async function getAllContacts(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiCall(`/contact?${params}`, "GET");
}

/**
 * Get single contact
 */
async function getContact(contactId) {
  return apiCall(`/contact/${contactId}`, "GET");
}

/**
 * Update contact
 */
async function updateContact(contactId, contactData) {
  return apiCall(`/contact/${contactId}`, "PUT", contactData);
}

/**
 * Delete contact
 */
async function deleteContact(contactId) {
  return apiCall(`/contact/${contactId}`, "DELETE");
}

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * Get dashboard statistics
 */
async function getDashboardStats() {
  return apiCall("/admin/stats", "GET");
}

/**
 * Get recent bookings
 */
async function getRecentBookings(limit = 10) {
  return apiCall(`/admin/recent-bookings?limit=${limit}`, "GET");
}

/**
 * Get revenue analytics
 */
async function getRevenueAnalytics() {
  return apiCall("/admin/revenue", "GET");
}

/**
 * Get booking trends
 */
async function getBookingTrends() {
  return apiCall("/admin/trends", "GET");
}

/**
 * Get service performance
 */
async function getServicePerformance() {
  return apiCall("/admin/service-performance", "GET");
}

/**
 * Get health status
 */
async function getSystemHealth() {
  return apiCall("/admin/health", "GET");
}

// ============================================
// NOTIFICATION ENDPOINTS
// ============================================

/**
 * Get user notifications
 */
async function getUserNotifications(email) {
  return apiCall(`/notifications?email=${email}`, "GET");
}

/**
 * Create a notification
 */
async function createNotification(notificationData) {
  return apiCall("/notifications", "POST", notificationData);
}

/**
 * Mark notification as read
 */
async function markNotificationAsRead(notificationId) {
  return apiCall(`/notifications/${notificationId}/read`, "PUT");
}

/**
 * Delete a notification
 */
async function deleteNotification(notificationId) {
  return apiCall(`/notifications/${notificationId}`, "DELETE");
}

// ============================================
// UTILITY ENDPOINTS
// ============================================

/**
 * Check server health
 */
async function checkServerHealth() {
  return apiCall("/health", "GET");
}

// ============================================
// EXPORT FOR GLOBAL USE
// ============================================
// All functions are now available globally since this is included in HTML

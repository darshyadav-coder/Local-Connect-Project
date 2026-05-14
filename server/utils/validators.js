// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (minimum 6 characters)
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Phone validation (India format)
const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Date validation (must be future date)
const isFutureDate = (date) => {
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDate >= today;
};

// Validate registration input
const validateRegister = (data) => {
  const errors = [];

  if (!data.fullname || data.fullname.trim() === '') {
    errors.push('Full name is required');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.push('Password must be at least 6 characters');
  }

  if (!data.location || data.location.trim() === '') {
    errors.push('Location is required');
  }

  if (!data.securityQuestion || data.securityQuestion.trim() === '') {
    errors.push('Security question is required');
  }

  if (!data.securityAnswer || data.securityAnswer.trim() === '') {
    errors.push('Security answer is required');
  }

  return errors;
};

// Validate booking input
const validateBooking = (data) => {
  const errors = [];

  if (!data.customerName || data.customerName.trim() === '') {
    errors.push('Customer name is required');
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push('Valid phone number is required (10 digits, starting with 6-9)');
  }

  if (!data.service || data.service.trim() === '') {
    errors.push('Service is required');
  }

  if (!data.date || !isFutureDate(data.date)) {
    errors.push('Booking date must be in the future');
  }

  if (!data.serviceAddress || data.serviceAddress.trim() === '') {
    errors.push('Service address is required');
  }

  return errors;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isFutureDate,
  validateRegister,
  validateBooking,
};

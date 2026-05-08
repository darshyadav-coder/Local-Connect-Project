const nodemailer = require('nodemailer');

/**
 * Configure Transporter
 * Using environment variables for security
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send Email Utility
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Local Connect" <${process.env.EMAIL_USER || 'noreply@localconnect.com'}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't throw error to avoid breaking the main request flow
    return null;
  }
};

/**
 * Email Templates
 */
const emailTemplates = {
  bookingConfirmation: (booking) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb;">Booking Confirmed!</h2>
      <p>Hello ${booking.customerName || 'Customer'},</p>
      <p>Your booking for <strong>${booking.service}</strong> has been successfully placed.</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Status:</strong> Pending Provider Assignment</p>
      </div>
      <p>We will notify you once a service provider is assigned to your request.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #64748b;">© 2026 Local Connect | All Rights Reserved</p>
    </div>
  `,

  providerAssigned: (booking) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #10b981;">Provider Assigned!</h2>
      <p>Great news! A provider has been assigned to your booking.</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Provider Name:</strong> ${booking.provider}</p>
        <p><strong>Scheduled Date:</strong> ${booking.date}</p>
      </div>
      <p>Your provider will contact you shortly if any additional details are needed.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #64748b;">© 2026 Local Connect | All Rights Reserved</p>
    </div>
  `,

  bookingCancelled: (booking) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #ef4444;">Booking Cancelled</h2>
      <p>Your booking for <strong>${booking.service}</strong> has been cancelled.</p>
      <p>If you didn't request this cancellation, please contact our support team immediately.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #64748b;">© 2026 Local Connect | All Rights Reserved</p>
    </div>
  `,

  welcome: (user) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb;">Welcome to Local Connect!</h2>
      <p>Hello ${user.fullname},</p>
      <p>Thank you for joining Local Connect. We're excited to have you on board!</p>
      <p>You can now book local services or manage your service requests directly from your dashboard.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5000/login.html" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
      </div>
      <p>If you have any questions, feel free to reply to this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #64748b;">© 2026 Local Connect | All Rights Reserved</p>
    </div>
  `,

  passwordChanged: (user) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #f59e0b;">Password Changed</h2>
      <p>Hello ${user.fullname},</p>
      <p>Your account password has been successfully updated.</p>
      <p>If you did not perform this change, please contact our support team immediately to secure your account.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #64748b;">© 2026 Local Connect | All Rights Reserved</p>
    </div>
  `
};

module.exports = { sendEmail, emailTemplates };

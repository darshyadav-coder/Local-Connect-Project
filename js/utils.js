/**
 * =========================================================================
 * UTILITY FUNCTIONS - Sanitization, Helpers, and Shared Logic
 * =========================================================================
 * This file contains reusable utility functions for:
 * - Confirmation dialogs
 * - Toast notifications
 * - Data formatting
 */

// ============================================
// CUSTOM CONFIRMATION DIALOG
// ============================================

/**
 * Show a custom confirmation dialog with better UX
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {function} onConfirm - Callback when user clicks OK
 * @param {function} onCancel - Callback when user clicks Cancel
 * @param {string} confirmText - Text for confirm button (default: "Confirm")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 */
function showConfirmDialog(title, message, onConfirm, onCancel = null, confirmText = "Confirm", cancelText = "Cancel") {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  // Create modal dialog
  const modal = document.createElement('div');
  modal.className = 'modal-dialog';

  modal.innerHTML = `
    <h2>${title}</h2>
    <p>${message}</p>
    <div class="modal-btn-group">
      <button id="cancel-btn" class="btn btn-muted btn-flex">${cancelText}</button>
      <button id="confirm-btn" class="btn btn-primary btn-flex">${confirmText}</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Event handlers
  const confirmBtn = modal.querySelector('#confirm-btn');
  const cancelBtn = modal.querySelector('#cancel-btn');

  const closeDialog = () => {
    overlay.style.animation = 'slideUp 0.3s ease-out reverse';
    setTimeout(() => overlay.remove(), 300);
  };

  confirmBtn.addEventListener('click', () => {
    closeDialog();
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  });

  cancelBtn.addEventListener('click', () => {
    closeDialog();
    if (typeof onCancel === 'function') {
      onCancel();
    }
  });

  // Allow ESC key to close
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', handleEsc);
      closeDialog();
      if (typeof onCancel === 'function') {
        onCancel();
      }
    }
  };
  document.addEventListener('keydown', handleEsc);
}

// ============================================
// TOAST NOTIFICATION
// ============================================

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: "success", "error", "warning", "info"
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showToast(message, type = "success", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast-fixed toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// EMPTY STATE MESSAGE HELPER
// ============================================

/**
 * Create an empty state HTML message
 * @param {string} title - Title of empty state
 * @param {string} description - Description
 * @param {number} colSpan - Column span for table rows
 * @returns {string} - HTML table row
 */
function createEmptyStateRow(title, description, colSpan = 6) {
  return `
    <tr>
      <td colspan="${colSpan}" class="empty-state-cell">
        <div class="text-muted">
          <p class="empty-state-title">📭 ${title}</p>
          <p class="empty-state-desc">${description}</p>
        </div>
      </td>
    </tr>
  `;
}

// ============================================
// DATA SANITIZATION HELPERS
// ============================================

/**
 * Sanitize input to prevent XSS attacks by escaping HTML characters
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string safe for HTML display
 */
function sanitizeInput(input) {
  if (input == null) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

/**
 * Simulate sending a notification to a user
 * @param {string} email - User email to send notification to
 * @param {string} type - Notification type
 * @param {object} data - Additional data for the notification
 */
function simulateNotification(email, type, data = {}) {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  let message = "";
  let subject = "";

  switch (type) {
    case "booking_requested":
      subject = "Booking Request Received";
      message = `Your booking request for ${data.service} on ${data.date} has been received. A provider will confirm your service soon.`;
      break;
    case "booking_confirmed":
      subject = "Booking Confirmed";
      message = `Your booking for ${data.service} on ${data.date} has been confirmed. A provider will be assigned soon.`;
      break;
    case "booking_completed":
      subject = "Service Completed";
      message = `Your ${data.service} service has been completed. Please provide feedback in your dashboard.`;
      break;
    case "booking_cancelled":
      subject = "Booking Cancelled";
      message = `Your booking for ${data.service} has been cancelled.`;
      break;
    case "booking_rescheduled":
      subject = "Booking Rescheduled";
      message = `Your booking for ${data.service} has been rescheduled to ${data.newDate}.`;
      break;
    case "provider_assigned":
      subject = "Provider Assigned";
      message = `${data.provider} has been assigned to your ${data.service} booking on ${data.date}.`;
      break;
  }

  notifications.push({
    id: Date.now().toString(),
    email: email,
    type: type,
    subject: subject,
    message: message,
    timestamp: new Date().toISOString(),
    read: false,
    data: data,
  });

  localStorage.setItem("notifications", JSON.stringify(notifications));
}

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
// DATA FORMATTING HELPERS
// ============================================

/**
 * Format date to readable format
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDate(date) {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} - Truncated text
 */
function truncateText(text, length = 50) {
  if (!text) return '';
  text = text.toString();
  return text.length > length ? text.substring(0, length) + '...' : text;
}

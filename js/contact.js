// contact.js - Logic for the general Contact/Support Form

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");
  const successMsg = document.getElementById("success-msg");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Simulate form processing UX
      const btn = contactForm.querySelector("button[type='submit']");
      const originalText = btn.textContent;

      btn.textContent = "Sending Messages...";
      btn.disabled = true;

      // UI Switch
      submitContact({
        name: document.getElementById("contact-name").value,
        email: document.getElementById("contact-email").value,
        subject: document.getElementById("contact-subject").value,
        message: document.getElementById("contact-message").value,
      })
      .then(() => {
        contactForm.classList.add("hidden");
        successMsg.classList.remove("hidden");
      })
      .catch(err => {
        console.error("Contact error:", err);
        showToast("❌ Failed to send message: " + err.message, "error");
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  }
});

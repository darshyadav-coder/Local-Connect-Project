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

      setTimeout(() => {
        // UI Switch
        contactForm.style.display = "none";
        successMsg.style.display = "block";

        // Viva Database Simulation: Save it to localStorage!
        const contactMsgs =
          JSON.parse(localStorage.getItem("contactMessages")) || [];
        contactMsgs.push({
          id: "MSG-" + Date.now(),
          name: document.getElementById("contact-name").value,
          email: document.getElementById("contact-email").value,
          subject: document.getElementById("contact-subject").value,
          message: document.getElementById("contact-message").value,
          date: new Date().toLocaleDateString(),
        });
        localStorage.setItem("contactMessages", JSON.stringify(contactMsgs));
      }, 1000); // 1 second fake network delay for realism
    });
  }
});

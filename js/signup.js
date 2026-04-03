// signup.js - Frontend Only Authentication Logic (No Backend Needed)

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById("signupForm");
    const errorMsg = document.getElementById("error-msg");
    const signupBtn = document.getElementById("signupBtn");

    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();

            // 1. Gather form data
            const fullname = document.getElementById("fullname").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const location = document.getElementById("location").value.trim();
            const role = document.getElementById("role").value;

            // Reset error
            errorMsg.textContent = "";

            // 2. Viva Check: Form Validation
            if (!fullname || !email || !password || !location || !role) {
                errorMsg.textContent = "Please fill in all fields.";
                return;
            }

            if (password.length < 6) {
                errorMsg.textContent = "Password must be at least 6 characters.";
                return;
            }

            // 3. Create the User Object
            const newUser = {
                fullname,
                email,
                password,
                location,
                role
            };

            // 4. Viva Feature: Using Frontend LocalStorage! 
            // We fetch existing users first so we don't overwrite them. (No backend needed!)
            let existingUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

            // Prevent duplicate emails
            const userExists = existingUsers.some(u => u.email === email);
            if (userExists) {
                errorMsg.textContent = "Error: Email is already registered!";
                return;
            }

            // Update UI to show progress
            signupBtn.textContent = "Creating Account...";
            signupBtn.disabled = true;

            // Simulate a fake "Network Request" for realism in your viva presentation
            setTimeout(() => {
                // Add our new user and save back to local storage
                existingUsers.push(newUser);
                localStorage.setItem("registeredUsers", JSON.stringify(existingUsers));

                // Show our custom Toast Notification if it exists (imported from main.js)
                if (typeof showToast === 'function') {
                    showToast("Account created successfully! Redirecting...");
                } else {
                    alert("Account created successfully! Redirecting...");
                }

                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);

            }, 1000); // 1 sec fake delay
        });
    }
});

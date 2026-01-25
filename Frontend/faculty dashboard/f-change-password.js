// Configuration
const PASSWORD_API_URL = "https://temp-zw0w.onrender.com/user/profile/password";

// DOM Elements
const form = document.getElementById("passwordForm");
const currentPassInput = document.getElementById("currentPassword");
const newPassInput = document.getElementById("newPassword");
const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById("statusMessage");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = currentPassInput.value.trim();
    const newPassword = newPassInput.value.trim();
    const token = localStorage.getItem("token");

    // 1. Authorization Check
    if (!token) {
        alert("Session expired. Please login again.");
        window.location.href = "../login page/login.html";
        return;
    }

    // 2. UI Loading State
    submitBtn.innerText = "Updating...";
    submitBtn.disabled = true;
    statusMessage.innerText = "";

    try {
        // 3. Send PUT Request to Backend
        const response = await fetch(PASSWORD_API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        // 4. Handle Response
        if (response.ok) {
            alert("Faculty password updated successfully! Please login again.");
            
            // Clear local storage (clears JWT and User info)
            localStorage.clear();
            
            // Redirect to login page
            window.location.href = "../login page/login.html";
        } else {
            // Show server-side error (e.g., incorrect current password)
            statusMessage.innerText = data.message || "Failed to update password.";
            statusMessage.style.color = "#dc2626";
            submitBtn.innerText = "Update Password";
            submitBtn.disabled = false;
        }

    } catch (error) {
        console.error("Network Error:", error);
        statusMessage.innerText = "Network error. Please check your connection.";
        statusMessage.style.color = "#dc2626";
        submitBtn.innerText = "Update Password";
        submitBtn.disabled = false;
    }
});
const PASSWORD_API_URL = "https://temp-zw0w.onrender.com/user/profile/password";

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

    if (!token) {
        alert("Session expired. Please login again.");
        window.location.href = "../login page/login.html";
        return;
    }

    submitBtn.innerText = "Updating...";
    submitBtn.disabled = true;

    try {
        const response = await fetch(PASSWORD_API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Password updated successfully! Please login again with your new password.");
            
            // Clear local storage (clears JWT and User info)
            localStorage.clear();
            
            // Redirect to login page using the correct relative path
            window.location.href = "../login page/login.html";
        } else {
            statusMessage.innerText = data.message || "Failed to update password.";
            statusMessage.style.color = "#dc2626";
            submitBtn.innerText = "Update Password";
            submitBtn.disabled = false;
        }

    } catch (error) {
        console.error("Error:", error);
        statusMessage.innerText = "Network error. Please try again later.";
        statusMessage.style.color = "#dc2626";
        submitBtn.innerText = "Update Password";
        submitBtn.disabled = false;
    }
});
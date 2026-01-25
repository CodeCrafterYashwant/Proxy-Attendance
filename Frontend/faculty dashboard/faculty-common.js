/**
 * Faculty Portal Common Logic
 * Handles Auth, Greetings, and Logout functionality.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Run Security Check
    checkAuth();

    // 2. Initialize Components
    setupLogout();
    updateGreeting();
});

/* =========================================
   1. AUTHENTICATION & SECURITY
   ========================================= */
function checkAuth() {
    const token = localStorage.getItem("token");
    
    // Redirect to login if no token is found
    if (!token) {
        window.location.href = "../login page/login.html";
        return;
    }
}

function getUserData() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return { name: "Professor" };

    // Extract name or use a default
    let name = user.name || (user.email ? user.email.split('@')[0] : "Professor");
    
    // Capitalize first letter
    return {
        ...user,
        name: name.charAt(0).toUpperCase() + name.slice(1)
    };
}

/* =========================================
   2. DYNAMIC GREETING
   ========================================= */
function updateGreeting() {
    const nameDisplay = document.getElementById("userNameDisplay");
    if (!nameDisplay) return;

    const user = getUserData();
    const hour = new Date().getHours();
    let greeting = "Welcome back";

    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    nameDisplay.textContent = `${greeting}, ${user.name}!`;
}

/* =========================================
   3. LOGOUT LOGIC (REDIRECT & TOKEN CLEAR)
   ========================================= */
function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            
            if (confirm("Are you sure you want to log out from the Faculty Portal?")) {
                // 1. Clear JWT Token and User Data from Local Storage
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                
                // Optional: Clear any session-specific data
                // localStorage.clear(); 

                // 2. Redirect to Login Page
                // Using "../" to navigate out of faculty folder to login page folder
                window.location.href = "../login page/login.html";
            }
        });
    }
}
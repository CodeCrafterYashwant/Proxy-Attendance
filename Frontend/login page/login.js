const BASE_URL = "https://temp-zw0w.onrender.com";

const form = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const messageBox = document.getElementById("messageBox");

// --- 1. Helper: Parse JWT to get Role ---
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// --- 2. Check Auth on Page Load (Auto-Redirect) ---
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    const decoded = parseJwt(token);
    if (decoded && decoded.role) {
      redirectUser(decoded.role);
    }
  }
});

// --- 3. Login Submission Logic ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Validation
  if (!email || !password) {
    showMessage("Email and password are required.", "error");
    return;
  }

  if (!email.includes("@")) {
    showMessage("Please enter a valid email address.", "error");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(`${BASE_URL}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      // 1. Save Token
      localStorage.setItem("token", data.token);

      // 2. Decode Token to find Role
      const decodedToken = parseJwt(data.token);
      let userRole = decodedToken ? decodedToken.role : (data.user ? data.user.role : null);

      if (userRole) {
        localStorage.setItem("user", JSON.stringify({ email, role: userRole }));
        showMessage("Login successful! Redirecting...", "success");
        setTimeout(() => {
          redirectUser(userRole);
        }, 1000);
      } else {
        showMessage("Login successful, but user role not found.", "error");
      }
    } else {
      showMessage(data.message || "Invalid credentials.", "error");
    }

  } catch (err) {
    console.error("Login Error:", err);
    showMessage("Unable to connect to server.", "error");
  } finally {
    setLoading(false);
  }
});

function redirectUser(role) {
  if (role === "student") {
    window.location.href = "../student dashboard/studentdashboard.html"; 
  } else if (role === "faculty") {
    window.location.href = "../faculty dashboard/facultydashboard.html"; 
  } else {
    console.warn("Unknown role:", role);
  }
}

function showMessage(msg, type) {
  messageBox.textContent = msg;
  messageBox.className = `message-box ${type}`; 
}

function setLoading(isLoading) {
  if (isLoading) {
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
    loginBtn.style.opacity = "0.7";
  } else {
    if (!messageBox.classList.contains("success")) {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
      loginBtn.style.opacity = "1";
    }
  }
}
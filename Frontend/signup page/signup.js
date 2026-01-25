const BASE_URL = "https://temp-zw0w.onrender.com";

const form = document.getElementById("signupForm");
const submitBtn = document.getElementById("submitBtn");
const messageBox = document.getElementById("messageBox");

// Form Submission Logic
form.addEventListener("submit", async (e) => {
  e.preventDefault(); 

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  // 1. Basic Empty Field Check
  if (!name || !email || !password) {
    showMessage("All fields are required.", "error");
    return;
  }

  // 2. Email Validation (Must contain '@')
  if (!email.includes("@")) {
    showMessage("Please enter a valid email address containing '@'.", "error");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`${BASE_URL}/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();

    if (response.ok) {
      // Success! Just show message and clear form. No redirect.
      showMessage("Account created successfully!", "success");
      form.reset();
      
    } else {
      showMessage(data.message || "Signup failed. Please try again.", "error");
    }

  } catch (error) {
    console.error("Network Error:", error);
    showMessage("Unable to connect to the server.", "error");
  } finally {
    setLoading(false);
  }
});

function showMessage(msg, type) {
  messageBox.textContent = msg;
  messageBox.className = `message-box ${type}`; 
}

function setLoading(isLoading) {
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";
    submitBtn.style.opacity = "0.7";
  } else {
    // Only re-enable if we didn't just succeed (optional: you can remove this check if you want them to be able to submit again immediately)
    if (!messageBox.classList.contains("success")) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Signup";
      submitBtn.style.opacity = "1";
    } else {
      // If success, we reset the button text but keep it enabled or disabled based on preference. 
      // Here we reset it so they can technically sign up another user if they want.
      submitBtn.disabled = false;
      submitBtn.textContent = "Signup";
      submitBtn.style.opacity = "1";
    }
  }
}
// ==========================================
// CONFIGURATION
// ==========================================
const API_URL = "https://temp-zw0w.onrender.com/attendance/mark";
const API_HISTORY_URL = "https://temp-zw0w.onrender.com/attendance/history";

// ==========================================
// DOM ELEMENTS
// ==========================================
const form = document.getElementById("attendanceForm");
const sessionIdInput = document.getElementById("sessionId");
const otpInput = document.getElementById("otpCode");
const locationBtn = document.getElementById("locationBtn");
const locationStatus = document.getElementById("locationStatus");
const submitBtn = document.getElementById("submitBtn");
const historyList = document.getElementById("historyList");
const refreshBtn = document.getElementById("refreshBtn");

let userLocation = null; 

// ==========================================
// 1. LOAD HISTORY (WITH EXPIRY CHECK)
// ==========================================
async function loadAttendancePageHistory() {
    if (!historyList) return;

    const token = localStorage.getItem("token");
    if (!token) {
        // Redirect if no token is found initially
        window.location.href = "../login page/login.html";
        return;
    }

    try {
        historyList.innerHTML = `<p style="text-align: center; color: #94a3b8;">Loading history...</p>`;

        const response = await fetch(API_HISTORY_URL, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        // 👇 SESSION EXPIRY CHECK (401)
        if (response.status === 401) {
            alert("Session Expired. Please login again.");
            localStorage.removeItem("token");
            window.location.href = "../login page/login.html";
            return;
        }

        const data = await response.json();
        historyList.innerHTML = "";

        if (!data || data.length === 0) {
            historyList.innerHTML = `<p style="text-align: center; color: #94a3b8;">No records found.</p>`;
            return;
        }

        data.forEach(record => {
            const session = record.session_id || {}; 

            // Safe Data Extraction
            const subject = session.class_name || "Unknown Subject";
            const faculty = session.creator_name || "Unknown Faculty";
            
            // Robust Date Handling
            const rawDate = record.createdAt || record.timestamp || record.date || session.createdAt;
            
            let dateStr = "Date N/A";
            let timeStr = "--:--";

            if (rawDate) {
                const dateObj = new Date(rawDate);
                if (!isNaN(dateObj.getTime())) { 
                    dateStr = dateObj.toLocaleDateString();
                    timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
            }

            const div = document.createElement("div");
            div.className = "history-item";
            div.style = "display:flex; justify-content:space-between; padding:15px; border-bottom:1px solid #eee; align-items:center;";
            
            div.innerHTML = `
                <div>
                    <strong style="display:block; color:#1f3c88; font-size: 1rem;">${subject}</strong>
                    <div style="font-size: 0.85rem; color: #555; margin-top: 4px;">
                        <i class="ri-user-star-line" style="vertical-align:middle"></i> ${faculty}
                    </div>
                    <div style="font-size: 0.75rem; color: gray; margin-top: 4px;">
                        ${dateStr} • ${timeStr}
                    </div>
                </div>
                <span style="background:#dcfce7; color:#166534; padding:5px 12px; border-radius:15px; font-size:12px; font-weight:bold;">
                    Present
                </span>
            `;
            historyList.appendChild(div);
        });

    } catch (error) {
        console.error("History Error:", error);
        historyList.innerHTML = `<p style="text-align: center; color: #dc2626;">Failed to load history.</p>`;
    }
}

// ==========================================
// 2. HANDLE LOCATION
// ==========================================
if(locationBtn) {
    locationBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
            locationStatus.textContent = "Geolocation not supported.";
            return;
        }

        locationStatus.innerHTML = `<i class="ri-loader-4-line"></i> Fetching location...`;
        locationBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                locationStatus.innerHTML = `<i class="ri-checkbox-circle-fill"></i> Location Verified`;
                locationStatus.style.color = "#16a34a";
                
                locationBtn.classList.add("success");
                locationBtn.innerHTML = `<i class="ri-check-line"></i> Verified`;
                submitBtn.disabled = false;
            },
            (error) => {
                locationBtn.disabled = false;
                locationStatus.textContent = "Location access denied.";
                locationStatus.style.color = "#dc2626";
            },
            { enableHighAccuracy: true }
        );
    });
}

// ==========================================
// 3. HANDLE SUBMIT (WITH EXPIRY CHECK)
// ==========================================
if(form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const sessionId = sessionIdInput.value.trim();
        const otp = otpInput.value.trim();
        const token = localStorage.getItem("token");

        if (!sessionId || !otp) return alert("Please fill all fields.");
        if (!userLocation) return alert("Please verify location first.");
        if (!token) {
            alert("Session expired.");
            window.location.href = "../login page/login.html";
            return;
        }

        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerText = "Processing...";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    otp: otp,
                    latitude: userLocation.lat,
                    longitude: userLocation.lng
                })
            });

            // 👇 SESSION EXPIRY CHECK (401)
            if (response.status === 401) {
                alert("Session Expired. Please login again.");
                localStorage.removeItem("token");
                window.location.href = "../login page/login.html";
                return;
            }

            const data = await response.json();

            if (response.ok) {
                alert("Attendance Marked Successfully! ✅");
                form.reset();
                submitBtn.disabled = true;
                locationBtn.disabled = false;
                locationBtn.classList.remove("success");
                locationBtn.innerHTML = `<i class="ri-map-pin-line"></i> Detect My Location`;
                userLocation = null;
                locationStatus.textContent = "Location required to submit.";

                loadAttendancePageHistory(); // Refresh list
            } else {
                alert(data.message || "Failed to mark attendance.");
            }

        } catch (error) {
            console.error(error);
            alert("Network Error.");
        } finally {
            submitBtn.innerHTML = originalText;
            if (userLocation) submitBtn.disabled = false;
        }
    });
}

// ==========================================
// 4. INITIALIZE
// ==========================================
document.addEventListener("DOMContentLoaded", loadAttendancePageHistory);

if(refreshBtn) {
    refreshBtn.addEventListener("click", loadAttendancePageHistory);
}
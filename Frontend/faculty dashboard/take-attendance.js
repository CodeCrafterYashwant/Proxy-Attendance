// CONFIGURATION
const API_CREATE_URL = "https://temp-zw0w.onrender.com/attendance/create_session";
const API_HISTORY_URL = "https://temp-zw0w.onrender.com/attendance/faculty/history";

// ELEMENTS
const startBtn = document.getElementById("startSessionBtn");
const sessionResult = document.getElementById("sessionResult");
const timerDisplay = document.getElementById("sessionTimer");
const historyListContainer = document.getElementById("historyListContainer");
const refreshHistoryBtn = document.getElementById("refreshHistory");
const shareWhatsappBtn = document.getElementById("shareWhatsappBtn");

// MODAL ELEMENTS
const modal = document.getElementById("studentListModal");
const closeModal = document.querySelector(".close-modal");
const modalList = document.getElementById("modalStudentList");
const modalTitle = document.getElementById("modalTitle");

let timerInterval;
let currentSessionData = {}; 

// INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    loadHistory(); 
});

if(refreshHistoryBtn) {
    refreshHistoryBtn.addEventListener("click", loadHistory);
}

// WHATSAPP SHARE LOGIC
if (shareWhatsappBtn) {
    shareWhatsappBtn.addEventListener("click", () => {
        if (!currentSessionData.otp || !currentSessionData.sessionId) {
            return alert("No active session to share.");
        }
        const message = `📢 *Attendance Session Started*\n\n` +
                        `📚 *Subject:* ${currentSessionData.subject}\n` +
                        `🔑 *OTP:* ${currentSessionData.otp}\n` +
                        `🆔 *Session ID:* ${currentSessionData.sessionId}\n\n` +
                        `Please mark your attendance immediately!`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });
}

// --- LOAD HISTORY FUNCTION ---
async function loadHistory() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login page/login.html";
        return;
    }

    try {
        const response = await fetch(API_HISTORY_URL, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        // 👇 SESSION EXPIRY CHECK
        if (response.status === 401) {
            alert("Session Expired. Please login again.");
            localStorage.removeItem("token");
            window.location.href = "../login page/login.html";
            return;
        }

        const data = await response.json();

        historyListContainer.innerHTML = "";

        if (!data || data.length === 0) {
            historyListContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#888;">No sessions found.</p>`;
            return;
        }

        data.forEach(session => {
            // Format Date & Time separately
            const dateObj = new Date(session.createdAt);
            const dateStr = dateObj.toLocaleDateString();
            const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            const subjectName = session.class_name || session.className || "No Subject";
            const attendees = session.student_list || [];

            const row = document.createElement("div");
            row.className = "history-row";
            
            // Display Date and Time stacked
            row.innerHTML = `
                <span>
                    <div style="font-weight:600; color:#333;">${dateStr}</div>
                    <div style="font-size:0.8rem; color:gray;">${timeStr}</div>
                </span>
                <span style="font-weight:500;">${subjectName}</span>
                <span>
                    <span class="badge" style="background:#e0f2fe; color:#0284c7; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:600;">
                        ${session.total_present || 0}
                    </span>
                </span>
                <span>
                    <button class="btn-view" style="padding:4px 8px; background:white; border:1px solid #5b6cff; color:#5b6cff; border-radius:4px; cursor:pointer; font-size:0.8rem;">
                        View
                    </button>
                </span>
            `;

            const viewBtn = row.querySelector(".btn-view");
            viewBtn.addEventListener("click", () => openStudentModal(subjectName, attendees));

            historyListContainer.appendChild(row);
        });

    } catch (error) {
        console.error("History Error:", error);
        historyListContainer.innerHTML = `<p style="text-align:center; color:red;">Failed to load history.</p>`;
    }
}

// --- MODAL LOGIC ---
function openStudentModal(className, students) {
    modalTitle.innerText = `${className} - Attendees`;
    modalList.innerHTML = "";

    if (!students || students.length === 0) {
        modalList.innerHTML = `<li style="text-align:center; color:gray; padding:10px;">No students marked attendance.</li>`;
    } else {
        students.forEach(student => {
            const li = document.createElement("li");
            const timeMarked = student.time 
                ? new Date(student.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                : "--:--";
            
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.padding = "10px";
            li.style.borderBottom = "1px solid #eee";

            li.innerHTML = `
                <div class="student-info">
                    <span style="display:block; font-weight:600; color:#333;">${student.name || "Unknown"}</span>
                    <span style="font-size:0.8rem; color:#777;">${student.email || ""}</span>
                </div>
                <span style="font-size:0.85rem; color:#16a34a; font-weight:500;">${timeMarked}</span>
            `;
            modalList.appendChild(li);
        });
    }
    modal.style.display = "flex";
}

if(closeModal) closeModal.addEventListener("click", () => { modal.style.display = "none"; });
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

// --- CREATE SESSION LOGIC ---
startBtn.addEventListener("click", async () => {
    const subjectInput = document.getElementById("subjectName");
    const subject = subjectInput.value.trim();
    
    if (!subject) return alert("Please enter a subject name.");
    if (!navigator.geolocation) return alert("Geolocation not supported.");

    startBtn.disabled = true;
    startBtn.innerText = "Verifying Location...";

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const token = localStorage.getItem("token");

        const payload = { 
            class_name: subject, 
            latitude, 
            longitude 
        };

        try {
            const response = await fetch(API_CREATE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            // 👇 SESSION EXPIRY CHECK FOR CREATE ACTION
            if (response.status === 401) {
                alert("Session Expired. Please login again.");
                localStorage.removeItem("token");
                window.location.href = "../login page/login.html";
                return;
            }

            const data = await response.json();

            if (response.ok) {
                document.getElementById("displayOTP").innerText = data.otp;
                document.getElementById("displaySessionID").innerText = `ID: ${data.sessionId}`;
                
                currentSessionData = {
                    subject: subject,
                    otp: data.otp,
                    sessionId: data.sessionId
                };

                sessionResult.style.display = "block";
                document.getElementById("setupSection").style.display = "none";
                
                startTimer(60);
                loadHistory(); 
            } else {
                alert(data.message || "Failed to create session.");
                resetUI();
            }
        } catch (err) {
            console.error(err);
            alert("Network Error");
            resetUI();
        }
    }, (err) => { 
        console.warn(err);
        alert("Location access required."); 
        resetUI(); 
    }, { enableHighAccuracy: true });
});

function startTimer(seconds) {
    let timeLeft = seconds;
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = `${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDisplay.innerText = "Expired";
            timerDisplay.parentElement.style.background = "#94a3b8";
            
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    }, 1000);
}

function resetUI() {
    startBtn.disabled = false;
    startBtn.innerHTML = `<i class="ri-map-pin-line"></i> Verify Location & Start`;
}
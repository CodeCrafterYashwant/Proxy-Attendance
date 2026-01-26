/**
 * Student Dashboard Common Logic
 * Handles Auth, Greetings, Logout, Dashboard History, and Live Calendar.
 */

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    setupLogout();
    updateGreeting();
    loadDashboardHistory(); 
    renderLiveCalendar(); // <--- Added Calendar Init
});

/* =========================================
   1. AUTHENTICATION & USER DATA
   ========================================= */
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        // 👇 THIS LINE MUST HAVE THE "../"
        window.location.href = "../index.html"; 
    }
}

function getUserData() {
    const user = JSON.parse(localStorage.getItem("user")) || { name: "Student" };
    let name = user.name || (user.email ? user.email.split('@')[0] : "Student");
    return {
        ...user,
        name: name.charAt(0).toUpperCase() + name.slice(1)
    };
}

/* =========================================
   2. DYNAMIC GREETING
   ========================================= */
function updateGreeting() {
    const nameDisplay = document.getElementById("userNameDisplay") || document.getElementById("studentName");
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
   3. LOGOUT LOGIC
   ========================================= */
function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out?")) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                
                // 🔴 FIX: Correct path here too
                window.location.href = "../index.html";
            }
        });
    }
}
/* =========================================
   4. DASHBOARD RECENT HISTORY
   ========================================= */
function loadDashboardHistory() {
    const historyList = document.getElementById("dashboardHistoryList");
    if (!historyList) return;

    const fullHistory = JSON.parse(localStorage.getItem("studentAttendance")) || [];

    if (fullHistory.length === 0) {
        historyList.innerHTML = `<p style="text-align:center; padding: 20px; color: #999;">No attendance marked yet.</p>`;
        return;
    }

    const recentRecords = fullHistory.slice(0, 5);
    historyList.innerHTML = ""; 

    recentRecords.forEach(record => {
        const row = document.createElement("div");
        row.className = "history-row";
        const statusClass = record.status === "Present" ? "status-present" : "status-absent";

        row.innerHTML = `
            <div style="font-weight: 500;">${record.sessionId}</div>
            <div>${record.date}</div>
            <div>${record.time || "--:--"}</div>
            <div><span class="status-badge ${statusClass}">${record.status}</span></div>
        `;
        historyList.appendChild(row);
    });
}

/* =========================================
   5. LIVE CALENDAR GENERATOR
   ========================================= */
// function renderLiveCalendar() {
//     const calendarGrid = document.getElementById("calendarGrid");
//     const monthYearEl = document.getElementById("currentMonthYear");

//     // Only run if elements exist (i.e., on the Dashboard page)
//     if (!calendarGrid || !monthYearEl) return;

//     const date = new Date();
//     const currentMonth = date.getMonth();
//     const currentYear = date.getFullYear();
//     const today = date.getDate();

//     const monthNames = [
//         "January", "February", "March", "April", "May", "June", 
//         "July", "August", "September", "October", "November", "December"
//     ];

//     // 1. Set Header (e.g., "January 2026")
//     monthYearEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
//     calendarGrid.innerHTML = "";

//     // 2. Render Day Names (Mon, Tue...)
//     const days = ["M", "T", "W", "T", "F", "S", "S"];
//     days.forEach(day => {
//         const dayEl = document.createElement("div");
//         dayEl.className = "day-name";
//         dayEl.textContent = day;
//         calendarGrid.appendChild(dayEl);
//     });

//     // 3. Calculate Padding (Empty slots before the 1st of the month)
//     // getDay() returns 0 for Sunday. We shift it so Monday is 0.
//     const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
//     const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; 

//     // 4. Calculate Total Days in Month
//     const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

//     // 5. Render Empty Slots
//     for (let i = 0; i < adjustedFirstDay; i++) {
//         const emptyEl = document.createElement("div");
//         emptyEl.className = "empty-slot";
//         calendarGrid.appendChild(emptyEl);
//     }

//     // 6. Render Dates
//     for (let i = 1; i <= lastDay; i++) {
//         const dateEl = document.createElement("div");
//         dateEl.className = "cal-date";
//         dateEl.textContent = i;

//         // Highlight Today
//         if (i === today) {
//             dateEl.classList.add("today");
//         }

//         calendarGrid.appendChild(dateEl);
//     }
// }



// --- CALENDAR LOGIC (Interactive) ---





const monthYearText = document.getElementById("currentMonthYear");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

let currentDate = new Date();

function renderLiveCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 1. Update Header Text
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if(monthYearText) monthYearText.innerText = `${monthNames[month]} ${year}`;

    // 2. Calculate Date Offsets
    const firstDay = new Date(year, month, 1).getDay(); // Day of week (0-6)
    const lastDate = new Date(year, month + 1, 0).getDate(); // Days in current month
    const lastDatePrevMonth = new Date(year, month, 0).getDate(); // Days in prev month

    if(!calendarGrid) return;
    calendarGrid.innerHTML = "";

    // 3. Render Previous Month Padding (Inactive Days)
    for (let i = firstDay; i > 0; i--) {
        const div = document.createElement("div");
        div.className = "calendar-date inactive";
        div.innerText = lastDatePrevMonth - i + 1;
        calendarGrid.appendChild(div);
    }

    // 4. Render Current Month Days
    const today = new Date();
    for (let i = 1; i <= lastDate; i++) {
        const div = document.createElement("div");
        div.className = "calendar-date";
        div.innerText = i;

        // Highlight Today
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            div.classList.add("today");
        }
        calendarGrid.appendChild(div);
    }
}

// 5. Add Event Listeners for Buttons
if(prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
}

if(nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
    // ... existing load history code ...
    renderLiveCalendar(); 
});
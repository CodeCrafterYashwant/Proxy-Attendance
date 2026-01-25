// ==========================================
// CONFIGURATION
// ==========================================
const API_HISTORY_URL = "https://temp-zw0w.onrender.com/attendance/faculty/history";
const listContainer = document.getElementById("facultySessionList");

// ==========================================
// MODAL ELEMENTS
// ==========================================
const modal = document.getElementById("studentListModal");
const closeModal = document.querySelector(".close-modal");
const modalList = document.getElementById("modalStudentList");
const modalTitle = document.getElementById("modalTitle");

// ==========================================
// CALENDAR ELEMENTS
// ==========================================
const monthYearText = document.getElementById("currentMonthYear");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

let currentDate = new Date();

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardSessions();
    renderCalendar();
});

/* =========================================
   1. LOAD HISTORY (Top 5)
   ========================================= */
async function loadDashboardSessions() {
    const token = localStorage.getItem("token");

    // 1. Check if token exists locally
    if (!token) {
        window.location.href = "../login page/login.html"; // Redirect if missing
        return;
    }

    try {
        // 2. Fetch Data
        const response = await fetch(API_HISTORY_URL, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        // 3. Handle Token Expiry (401 Unauthorized)
        if (response.status === 401) {
            alert("Session Expired. Please login again.");
            localStorage.removeItem("token");
            window.location.href = "../login page/login.html";
            return;
        }

        const data = await response.json();
        listContainer.innerHTML = "";

        // 4. Handle Empty Data
        if (!data || data.length === 0) {
            listContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#888;">No recent sessions found.</p>`;
            return;
        }

        // 5. Slice Top 5
        const recentSessions = data.slice(0, 5);

        // 6. Generate Rows
        recentSessions.forEach(session => {
            const dateObj = new Date(session.createdAt);
            const dateStr = dateObj.toLocaleDateString();
            const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const subjectName = session.class_name || session.className || "No Subject";
            const attendees = session.student_list || [];

            const row = document.createElement("div");
            row.className = "history-row";
            
            // Matches CSS Grid: 1.5fr 1.5fr 1fr 1fr
            row.style.display = "grid";
            row.style.gridTemplateColumns = "1.5fr 1.5fr 1fr 1fr";
            row.style.padding = "15px";
            row.style.borderBottom = "1px solid #eee";
            row.style.alignItems = "center";
            
            row.innerHTML = `
                <span>
                    <div style="font-weight:600; color:#333;">${dateStr}</div>
                    <div style="font-size:0.8rem; color:gray;">${timeStr}</div>
                </span>
                <span style="font-weight:500;">${subjectName}</span>
                <span>
                    <span class="badge" style="background:#e0f2fe; color:#0284c7; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:600;">
                        ${session.total_present || 0} Students
                    </span>
                </span>
                <span>
                    <button class="btn-view" style="padding:6px 12px; background:white; border:1px solid #5b6cff; color:#5b6cff; border-radius:6px; cursor:pointer;">
                        View List
                    </button>
                </span>
            `;

            const viewBtn = row.querySelector(".btn-view");
            viewBtn.addEventListener("click", () => openStudentModal(subjectName, attendees));

            listContainer.appendChild(row);
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        listContainer.innerHTML = `<p style="text-align:center; color:red; padding:20px;">Failed to load sessions.</p>`;
    }
}

/* =========================================
   2. CALENDAR LOGIC
   ========================================= */
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if(monthYearText) monthYearText.innerText = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay(); 
    const lastDate = new Date(year, month + 1, 0).getDate();
    const lastDatePrevMonth = new Date(year, month, 0).getDate();

    if(!calendarGrid) return;
    calendarGrid.innerHTML = "";

    // Prev Month Padding
    for (let i = firstDay; i > 0; i--) {
        const div = document.createElement("div");
        div.className = "calendar-date inactive";
        div.innerText = lastDatePrevMonth - i + 1;
        calendarGrid.appendChild(div);
    }

    // Current Month
    const today = new Date();
    for (let i = 1; i <= lastDate; i++) {
        const div = document.createElement("div");
        div.className = "calendar-date";
        div.innerText = i;

        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            div.classList.add("today");
        }
        calendarGrid.appendChild(div);
    }
}

if(prevMonthBtn) prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

if(nextMonthBtn) nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

/* =========================================
   3. MODAL LOGIC
   ========================================= */
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
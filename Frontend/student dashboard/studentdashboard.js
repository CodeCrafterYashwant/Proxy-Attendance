// ==========================================
// CONFIGURATION
// ==========================================
const API_HISTORY_URL = "https://temp-zw0w.onrender.com/attendance/history";
const historyContainer = document.getElementById("recentAttendanceList");

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    loadStudentDashboardHistory();
});

// ==========================================
// MAIN FUNCTION: LOAD HISTORY
// ==========================================
async function loadStudentDashboardHistory() {
    const token = localStorage.getItem("token");

    // 1. Check if token exists locally
    if (!token) {
        window.location.href = "../index.html"; // Redirect if missing
        return;
    }

    try {
        // 2. Fetch Data from Backend
        const response = await fetch(API_HISTORY_URL, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        // 3. Handle Token Expiry (401 Unauthorized)
        if (response.status === 401) {
            alert("Session Expired. Please login again.");
            localStorage.removeItem("token");
            window.location.href = "../index.html";
            return;
        }

        const data = await response.json();

        // Clear "Loading..." text
        historyContainer.innerHTML = "";

        // 4. Handle Empty Data
        if (!data || data.length === 0) {
            historyContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#888;">No attendance marked yet.</p>`;
            return;
        }

        // 5. Sort & Slice (Latest 5 records)
        // Note: If your API returns oldest first, use reverse(). If newest first, remove reverse().
        const recentRecords = data.reverse().slice(0, 5);

        // 6. Generate Rows
        recentRecords.forEach(record => {
            const session = record.session_id || {};
            
            // Safe Data Handling
            const subject = session.class_name || session.className || "Unknown Class";
            
            // Date Parsing
            const rawDate = record.createdAt || record.timestamp || session.createdAt;
            let dateStr = "N/A";
            let timeStr = "--:--";

            if (rawDate) {
                const dateObj = new Date(rawDate);
                if (!isNaN(dateObj.getTime())) {
                    dateStr = dateObj.toLocaleDateString();
                    timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }
            }

            // Create Row Element
            const row = document.createElement("div");
            row.className = "history-row";
            
            // Apply Grid Styles (matches HTML header: Subject | Date | Time | Status)
            row.style.display = "grid";
            row.style.gridTemplateColumns = "1.5fr 1fr 1fr 1fr";
            row.style.padding = "12px 15px";
            row.style.borderBottom = "1px solid #eee";
            row.style.alignItems = "center";
            row.style.fontSize = "0.9rem";

            row.innerHTML = `
                <span style="font-weight:600; color:#1f3c88;">${subject}</span>
                <span style="color:#555;">${dateStr}</span>
                <span style="color:#555;">${timeStr}</span>
                <span>
                    <span style="background:#dcfce7; color:#166534; padding:4px 10px; border-radius:12px; font-size:0.8rem; font-weight:600;">
                        Present
                    </span>
                </span>
            `;

            historyContainer.appendChild(row);
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        historyContainer.innerHTML = `<p style="text-align:center; color:red; padding:20px;">Failed to load history.</p>`;
    }
}
// ==========================================
// END
// ==========================================
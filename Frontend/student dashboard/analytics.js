// CONFIGURATION
const API_HISTORY_URL = "https://temp-zw0w.onrender.com/attendance/history";
const TOTAL_CLASSES = 100; // Fixed Base for calculation

// ELEMENTS
const totalClassesEl = document.getElementById("totalClasses");
const presentPercentageEl = document.getElementById("presentPercentage");
const presentBar = document.getElementById("presentBar");
const absentPercentageEl = document.getElementById("absentPercentage");
const absentBar = document.getElementById("absentBar");
const subjectListEl = document.getElementById("subjectPerformanceList"); // Target for Subject List
const chartCanvas = document.getElementById("trendChart");

document.addEventListener("DOMContentLoaded", () => {
    loadAnalytics();
});

async function loadAnalytics() {
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

        // --- 1. GLOBAL STATS CALCULATIONS ---
        const presentCount = data.length || 0;
        const safePresent = Math.min(presentCount, TOTAL_CLASSES);
        const absentCount = TOTAL_CLASSES - safePresent;

        const presentRate = ((safePresent / TOTAL_CLASSES) * 100).toFixed(0);
        const absentRate = ((absentCount / TOTAL_CLASSES) * 100).toFixed(0);

        totalClassesEl.innerText = TOTAL_CLASSES;
        
        presentPercentageEl.innerText = `${presentRate}%`;
        presentBar.style.width = `${presentRate}%`;

        absentPercentageEl.innerText = `${absentRate}%`;
        absentBar.style.width = `${absentRate}%`;

        // --- 2. SUBJECT WISE CALCULATION ---
        // Group data by class_name
        const subjectMap = {};
        
        data.forEach(record => {
            const session = record.session_id || {};
            const subject = session.class_name || session.className || "Unknown Subject";
            
            if (!subjectMap[subject]) {
                subjectMap[subject] = 0;
            }
            subjectMap[subject]++;
        });

        // Render Subject List
        renderSubjectList(subjectMap, presentCount);

        // --- 3. RENDER CHART ---
        renderTrendChart(subjectMap);

    } catch (error) {
        console.error("Analytics Error:", error);
        if(subjectListEl) subjectListEl.innerHTML = `<p style="color:red; font-size:0.9rem;">Failed to load data.</p>`;
    }
}

function renderSubjectList(subjectMap, totalAttended) {
    if(!subjectListEl) return;
    subjectListEl.innerHTML = "";
    
    const subjects = Object.keys(subjectMap);
    
    if (subjects.length === 0) {
        subjectListEl.innerHTML = `<p style="color:#94a3b8; font-size:0.9rem;">No attendance records found.</p>`;
        return;
    }

    subjects.forEach(sub => {
        const count = subjectMap[sub];
        // Calculate relative contribution to total attendance for the visual bar
        const relativePercent = totalAttended > 0 ? (count / totalAttended) * 100 : 0;

        const item = document.createElement("div");
        item.className = "subject-item";
        item.innerHTML = `
            <div class="subject-name">
                <span>${sub}</span>
                <span class="subject-count">${count} Attended</span>
            </div>
            <div class="progress-container" style="height: 6px; margin-top: 8px;">
                <div class="progress-bar bar-blue" style="width: ${relativePercent}%"></div>
            </div>
        `;
        subjectListEl.appendChild(item);
    });
}

let trendChart = null;

function renderTrendChart(subjectMap) {
    if(!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    
    // Prepare Chart Data from Subject Map
    const labels = Object.keys(subjectMap);
    const dataValues = Object.values(subjectMap);

    // If no data, show dummy empty chart or placeholder
    if(labels.length === 0) {
        labels.push("No Data");
        dataValues.push(0);
    }

    // Destroy old chart if it exists to prevent overlap
    if (trendChart) {
        trendChart.destroy();
    }

    trendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Classes Attended',
                data: dataValues,
                backgroundColor: '#818cf8',
                borderRadius: 5,
                barThickness: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });
}
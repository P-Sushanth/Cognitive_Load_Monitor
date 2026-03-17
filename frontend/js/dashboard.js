// Check auth
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
});

// Slider Color Logic
const slider = document.getElementById('loadLevel');
const output = document.getElementById('loadVal');

function updateSliderColor(val) {
    let color = '#4caf50'; // Green
    if (val >= 3) color = '#ffd54f'; // Yellow
    if (val >= 4) color = '#cf6679'; // Red

    output.textContent = val;
    output.style.color = color;
    output.style.fontWeight = 'bold';

    const min = 1;
    const max = 5;
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, ${color} ${percent}%, #333 ${percent}%)`;
}

if (slider && output) {
    updateSliderColor(slider.value);
    slider.oninput = function () { updateSliderColor(this.value); }
}

// Global State
let allTasks = []; // Store fetched tasks for filtering
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null; // Filter date

// Chart Instances
let dailyChartInstance = null;
let weeklyChartInstance = null;

async function loadDashboard() {
    await loadTasks();
    await loadAnalytics();
    renderCalendar();
}

// Load Tasks and Store
async function loadTasks() {
    try {
        allTasks = await api.request('/tasks');
        allTasks.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderTaskList();
        renderCalendar(); // Re-render to show dots
    } catch (err) {
        console.error(err);
    }
}

// Render List (Filtered or All)
function renderTaskList() {
    const list = document.getElementById('task-list');
    list.innerHTML = '';

    // Filter logic
    let tasksToShow = allTasks;
    if (selectedDate) {
        tasksToShow = allTasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate.getDate() === selectedDate.getDate() &&
                taskDate.getMonth() === selectedDate.getMonth() &&
                taskDate.getFullYear() === selectedDate.getFullYear();
        });
    }

    if (tasksToShow.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:10px; color:#555;">No logs for this date.</div>';
        return;
    }

    tasksToShow.forEach(task => {
        let color = '#4caf50';
        const level = parseFloat(task.loadLevel);
        if (level >= 3) color = '#ffd54f';
        if (level >= 4) color = '#cf6679';

        const div = document.createElement('div');
        div.className = 'task-item';
        div.innerHTML = `
            <div>
                <strong>${task.name}</strong> - ${task.duration} mins 
                (<span style="color:${color}">Load: ${level}</span>)
                <br>
                <small style="color: grey">${new Date(task.date).toLocaleDateString('en-GB')} ${new Date(task.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="edit-btn" onclick="openEditModal('${task._id}')">Edit</button>
                <button class="delete-btn" onclick="deleteTask('${task._id}')">X</button>
            </div>
        `;
        list.appendChild(div);
    });
}

// Calendar Logic
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('month-year');
    if (!calendar) return; // Guard

    calendar.innerHTML = '';

    // Set Header
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Calculate days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Map tasks to dates for highlighting
    const tasksByDate = new Set();
    allTasks.forEach(task => {
        const d = new Date(task.date);
        tasksByDate.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        const div = document.createElement('div');
        calendar.appendChild(div);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const div = document.createElement('div');
        div.className = 'calendar-day';
        div.textContent = day;

        // Highlight if logs exist
        const dateKey = `${currentYear}-${currentMonth}-${day}`;
        if (tasksByDate.has(dateKey)) {
            div.classList.add('has-logs'); // CSS dot
        }

        // Selected state
        if (selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth &&
            selectedDate.getFullYear() === currentYear) {
            div.classList.add('selected');
        }

        div.onclick = () => selectDate(day);
        calendar.appendChild(div);
    }
}

function changeMonth(dir) {
    currentMonth += dir;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function selectDate(day) {
    // If clicking same date, unselect? Or strict filtering?
    // Let's assume strict selection.
    selectedDate = new Date(currentYear, currentMonth, day);
    renderCalendar(); // Re-render to show selection highlight
    renderTaskList(); // Filter list
}

function resetFilter() {
    selectedDate = null;
    renderCalendar();
    renderTaskList();
}


async function addTask(e) {
    e.preventDefault();
    const name = document.getElementById('taskName').value;
    const duration = document.getElementById('duration').value;
    const loadLevel = document.getElementById('loadLevel').value;

    try {
        await api.request('/tasks', 'POST', { name, duration, loadLevel });
        e.target.reset();
        document.getElementById('loadLevel').value = 3;
        updateSliderColor(3);

        await loadDashboard();
    } catch (err) {
        alert(err.message);
    }
}

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
        await api.request(`/tasks/${id}`, 'DELETE');
        await loadDashboard();
    } catch (err) {
        alert(err.message);
    }
}

async function loadAnalytics() {
    try {
        const historyData = await api.request('/analytics/history');
        const weeklyData = await api.request('/analytics/weekly');
        const overloadData = await api.request('/analytics/overload');

        updateCharts(historyData, weeklyData);
        updateOverloadAlert(overloadData);
    } catch (err) {
        console.error(err);
    }
}

function updateOverloadAlert(data) {
    const alertBox = document.getElementById('overload-alert');
    if (data.isOverload) {
        alertBox.style.display = 'block';
        alertBox.innerHTML = `<strong>WARNING:</strong> Cognitive Overload Detected! You have exceeded the daily threshold for ${data.consecutiveDays} consecutive days. Take a break!`;
    } else {
        alertBox.style.display = 'none';
    }
}

function updateCharts(history, weeklyWeb) {
    const ctxDaily = document.getElementById('dailyChart').getContext('2d');
    const ctxWeekly = document.getElementById('weeklyChart').getContext('2d');

    const dailyLabels = history.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }));
    const dailyPoints = history.map(d => d.load);

    if (dailyChartInstance) dailyChartInstance.destroy();
    dailyChartInstance = new Chart(ctxDaily, {
        type: 'line',
        data: {
            labels: dailyLabels,
            datasets: [{
                label: 'Daily Load',
                data: dailyPoints,
                borderColor: '#bb86fc',
                backgroundColor: 'rgba(187, 134, 252, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: dailyPoints.map(v => v > 500 ? '#cf6679' : '#bb86fc')
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' } },
                x: { grid: { color: '#333' } }
            },
            plugins: { legend: { labels: { color: 'white' } } }
        }
    });

    const weeklyLabels = weeklyWeb.map(w => w.weekLabel);
    const weeklyPoints = weeklyWeb.map(w => w.averageLoad);

    const barColors = weeklyPoints.map(val => {
        if (val > 500) return '#cf6679';
        if (val > 300) return '#ffd54f';
        return '#03dac6';
    });

    if (weeklyChartInstance) weeklyChartInstance.destroy();
    weeklyChartInstance = new Chart(ctxWeekly, {
        type: 'bar', // or 'bar'
        data: {
            labels: weeklyLabels,
            datasets: [{
                label: 'Average Load',
                data: weeklyPoints,
                backgroundColor: barColors
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { labels: { color: 'white' } } }
        }
    });
}

// Edit Logic
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-task-form');

function openEditModal(id) {
    const task = allTasks.find(t => t._id === id);
    if (!task) return;

    document.getElementById('edit-taskId').value = task._id;
    document.getElementById('edit-taskName').value = task.name;
    document.getElementById('edit-duration').value = task.duration;
    document.getElementById('edit-loadLevel').value = task.loadLevel;

    const editLoadVal = document.getElementById('edit-loadVal');
    editLoadVal.textContent = task.loadLevel;
    updateEditSliderColor(task.loadLevel);

    editModal.style.display = 'flex';
}

function closeEditModal() {
    editModal.style.display = 'none';
}

function updateEditSliderColor(val) {
    const slider = document.getElementById('edit-loadLevel');
    const output = document.getElementById('edit-loadVal');
    let color = '#4caf50';
    if (val >= 3) color = '#ffd54f';
    if (val >= 4) color = '#cf6679';

    output.textContent = val;
    output.style.color = color;

    const min = 1;
    const max = 5;
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, ${color} ${percent}%, #333 ${percent}%)`;
}

document.getElementById('edit-loadLevel').oninput = function () {
    updateEditSliderColor(this.value);
};

if (editForm) {
    editForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-taskId').value;
        const name = document.getElementById('edit-taskName').value;
        const duration = document.getElementById('edit-duration').value;
        const loadLevel = document.getElementById('edit-loadLevel').value;

        try {
            await api.request(`/tasks/${id}`, 'PUT', { name, duration, loadLevel });
            closeEditModal();
            await loadDashboard();
        } catch (err) {
            alert(err.message);
        }
    };
}

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target == editModal) {
        closeEditModal();
    }
}

// Init
window.addEventListener('DOMContentLoaded', loadDashboard);

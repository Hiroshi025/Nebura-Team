/**
 * Interval in milliseconds for refreshing system status.
 * @example
 * refreshInterval = 10000; // 10 seconds
 */
let refreshInterval = 5000;

/**
 * Timer reference for periodic refresh.
 * @type {number}
 */
let refreshTimer;

/**
 * Array holding CPU usage history for charting.
 * @type {{time: string, value: number}[]}
 */
let cpuHistory = [];

/**
 * Array holding memory usage history for charting.
 * @type {{time: string, value: number}[]}
 */
let memoryHistory = [];

/**
 * Maximum number of points to display in history charts.
 * @type {number}
 * @default 20
 */
const maxHistoryPoints = 20;

/**
 * Indicates whether the compact view is active.
 * @type {boolean}
 */
let isCompactView = false;

/**
 * Indicates whether real-time updates are active.
 * @type {boolean}
 */
let isRealTimeActive = true;

/**
 * Stores the last fetched system status data.
 * @type {object|null}
 */
let lastData = null;

/**
 * Chart.js context for CPU chart.
 * @see https://www.chartjs.org/docs/latest/
 */
const cpuCtx = document.getElementById("cpuChart").getContext("2d");

/**
 * Chart.js context for Memory chart.
 * @see https://www.chartjs.org/docs/latest/
 */
const memoryCtx = document.getElementById("memoryChart").getContext("2d");

/**
 * Chart.js instance for CPU usage.
 * @type {Chart}
 */
const cpuChart = new Chart(cpuCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "CPU Usage %",
        data: [],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + "%";
          },
        },
      },
    },
  },
});

/**
 * Chart.js instance for Memory usage.
 * @type {Chart}
 */
const memoryChart = new Chart(memoryCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Memory Usage %",
        data: [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + "%";
          },
        },
      },
    },
  },
});

/**
 * Fetches and updates system status data, charts, and UI.
 * @returns {void}
 * @example
 * updateData();
 */
function updateData() {
  if (!isRealTimeActive) {
    document.getElementById("updateIndicator").classList.remove("updating");
    return;
  }

  document.getElementById("updateIndicator").classList.add("updating");

  fetch("/dashboard/utils/status-json")
    .then((response) => response.json())
    .then((data) => {
      lastData = data;

      // Actualizar tarjetas
      updateCards(data);

      // Actualizar gráficos
      updateCharts(data);

      // Actualizar última actualización
      document.getElementById("last-updated").textContent = new Date().toLocaleTimeString();

      // Verificar alertas
      checkAlerts(data);

      document.getElementById("updateIndicator").classList.remove("updating");
    })
    .catch((error) => {
      console.error("Error fetching health data:", error);
      Toastify({
        text: "Error fetching system data",
        duration: 3000,
        className: "toast-error",
        gravity: "top",
        position: "right",
      }).showToast();
      document.getElementById("updateIndicator").classList.remove("updating");
    });
}

/**
 * Updates UI cards with system status data.
 * @param {object} data - System status data.
 * @returns {void}
 * @example
 * updateCards({ memory: {...}, cpu: {...}, uptime: 12345 });
 */
function updateCards(data) {
  // Actualizar memoria
  const memoryPercent = (data.memory.heapUsed / data.memory.heapTotal) * 100;
  document.getElementById("memory-progress").style.width = memoryPercent + "%";
  document.getElementById("memory-progress").className =
    "progress-fill " + getMemoryStatusClass(data.memory.heapUsed, data.memory.heapTotal);

  // Actualizar porcentaje y valores en la tarjeta de memoria
  const memoryLabel = document.querySelector("#memory-card .progress-label span:nth-child(1)");
  const memoryPercentLabel = document.querySelector("#memory-card .progress-label span:nth-child(2)");
  if (memoryLabel) memoryLabel.textContent = formatBytes(data.memory.heapUsed) + " of " + formatBytes(data.memory.heapTotal);
  if (memoryPercentLabel) memoryPercentLabel.textContent = calculatePercentage(data.memory.heapUsed, data.memory.heapTotal) + "%";

  // Actualizar RSS y External en la tarjeta de memoria
  const memoryRSS = document.querySelector("#memory-card .card-content > div:nth-child(2) > div:nth-child(1) span:last-child");
  const memoryExternal = document.querySelector(
    "#memory-card .card-content > div:nth-child(2) > div:nth-child(2) span:last-child",
  );
  if (memoryRSS) memoryRSS.textContent = formatBytes(data.memory.rss);
  if (memoryExternal) memoryExternal.textContent = formatBytes(data.memory.external);

  // Actualizar CPU
  const cpuPercent = data.cpu.process.cpuPercent;
  document.getElementById("cpu-progress").style.width = cpuPercent + "%";
  document.getElementById("cpu-progress").className = "progress-fill " + getCPUStatusClass(cpuPercent);

  // Actualizar porcentaje en la tarjeta de CPU
  const cpuPercentLabel = document.querySelector("#cpu-card .progress-label .cpu-percent");
  if (cpuPercentLabel) cpuPercentLabel.textContent = toFixed2(cpuPercent) + "%";

  // Actualizar User Time y System Time en la tarjeta de CPU
  const cpuUserTime = document.querySelector("#cpu-card .card-content > div:nth-child(2) > div:nth-child(1) span:last-child");
  const cpuSystemTime = document.querySelector("#cpu-card .card-content > div:nth-child(2) > div:nth-child(2) span:last-child");
  if (cpuUserTime) cpuUserTime.textContent = formatMs(data.cpu.process.userMs);
  if (cpuSystemTime) cpuSystemTime.textContent = formatMs(data.cpu.process.systemMs);

  // Actualizar uptime
  document.getElementById("uptime-display").textContent = formatUptime(data.uptime);

  // Actualizar panel de detalles de memoria
  const memoryTable = document.querySelector(".panel-content table");
  if (memoryTable) {
    // Heap Total
    memoryTable.rows[1].cells[2].textContent = formatBytes(data.memory.heapTotal);
    memoryTable.rows[1].cells[3].textContent = "100%";
    // Heap Used
    memoryTable.rows[2].cells[2].textContent = formatBytes(data.memory.heapUsed);
    memoryTable.rows[2].cells[3].textContent = calculatePercentage(data.memory.heapUsed, data.memory.heapTotal) + "%";
    // RSS
    memoryTable.rows[3].cells[2].textContent = formatBytes(data.memory.rss);
    memoryTable.rows[3].cells[3].textContent = calculatePercentage(data.memory.rss, data.memory.heapTotal) + "%";
    // External
    memoryTable.rows[4].cells[2].textContent = formatBytes(data.memory.external);
    memoryTable.rows[4].cells[3].textContent = calculatePercentage(data.memory.external, data.memory.heapTotal) + "%";
  }

  // Actualizar panel de núcleos CPU
  const cpuCores = document.querySelectorAll(".cpu-core");
  if (cpuCores.length === data.cpu.system.length) {
    data.cpu.system.forEach((core, idx) => {
      const sum = core.times.user + core.times.sys + core.times.idle + (core.times.nice || 0) + (core.times.irq || 0);
      // User
      cpuCores[idx].querySelectorAll(".progress-bar")[0].children[0].style.width =
        calculatePercentage(core.times.user, sum) + "%";
      cpuCores[idx].querySelectorAll(".progress-bar")[0].children[0].textContent = "";
      // System
      cpuCores[idx].querySelectorAll(".progress-bar")[1].children[0].style.width = calculatePercentage(core.times.sys, sum) + "%";
      cpuCores[idx].querySelectorAll(".progress-bar")[1].children[0].textContent = "";
      // Idle
      cpuCores[idx].querySelectorAll(".progress-bar")[2].children[0].style.width =
        calculatePercentage(core.times.idle, sum) + "%";
      cpuCores[idx].querySelectorAll(".progress-bar")[2].children[0].textContent = "";
      // Actualizar los porcentajes de texto
      cpuCores[idx].querySelectorAll("span")[1].textContent = calculatePercentage(core.times.user, sum) + "%";
      cpuCores[idx].querySelectorAll("span")[3].textContent = calculatePercentage(core.times.sys, sum) + "%";
      cpuCores[idx].querySelectorAll("span")[5].textContent = calculatePercentage(core.times.idle, sum) + "%";
    });
  }

  // Actualizar íconos según estado
  updateIcons(memoryPercent, cpuPercent);
}

/**
 * Formats a number to two decimal places.
 * @param {number} val
 * @returns {string}
 * @example
 * toFixed2(12.3456); // "12.35"
 */
function toFixed2(val) {
  return Number(val).toFixed(2);
}

/**
 * Formats milliseconds to a human-readable string.
 * @param {number} ms
 * @returns {string}
 * @example
 * formatMs(1500); // "1.50 s"
 */
function formatMs(ms) {
  if (ms < 1000) return ms + " ms";
  if (ms < 60000) return (ms / 1000).toFixed(2) + " s";
  if (ms < 3600000) return (ms / 60000).toFixed(2) + " min";
  return (ms / 3600000).toFixed(2) + " h";
}

/**
 * Updates CPU and Memory charts with new data.
 * @param {object} data - System status data.
 * @returns {void}
 * @example
 * updateCharts({ memory: {...}, cpu: {...} });
 */
function updateCharts(data) {
  const now = new Date();
  const timeLabel = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

  // Asegura que los valores sean numéricos y válidos
  const memoryUsed = Number(data.memory?.heapUsed ?? 0);
  const memoryTotal = Number(data.memory?.heapTotal ?? 1); // evita división por cero
  const memoryPercent = memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0;

  const cpuPercent = Number(data.cpu?.process?.cpuPercent ?? 0);

  // Agregar nuevos datos
  cpuHistory.push({ time: timeLabel, value: cpuPercent });
  memoryHistory.push({ time: timeLabel, value: memoryPercent });

  // Limitar historial
  if (cpuHistory.length > maxHistoryPoints) {
    cpuHistory.shift();
    memoryHistory.shift();
  }

  // Actualizar gráfico de CPU
  cpuChart.data.labels = cpuHistory.map((item) => item.time);
  cpuChart.data.datasets[0].data = cpuHistory.map((item) => item.value);
  cpuChart.update();

  // Actualizar gráfico de memoria
  memoryChart.data.labels = memoryHistory.map((item) => item.time);
  memoryChart.data.datasets[0].data = memoryHistory.map((item) => item.value);
  memoryChart.update();
}

/**
 * Checks for system alerts based on thresholds.
 * @param {object} data - System status data.
 * @returns {void}
 * @example
 * checkAlerts({ memory: {...}, cpu: {...} });
 */
function checkAlerts(data) {
  const memoryPercent = (data.memory.heapUsed / data.memory.heapTotal) * 100;
  const cpuPercent = data.cpu.process.cpuPercent;

  // Alerta de memoria
  if (memoryPercent > 90) {
    showAlert("High memory usage: " + memoryPercent.toFixed(2) + "%", "error");
  } else if (memoryPercent > 75) {
    showAlert("Warning: Memory usage at " + memoryPercent.toFixed(2) + "%", "warning");
  }

  // Alerta de CPU
  if (cpuPercent > 90) {
    showAlert("High CPU usage: " + cpuPercent.toFixed(2) + "%", "error");
  } else if (cpuPercent > 70) {
    showAlert("Warning: CPU usage at " + cpuPercent.toFixed(2) + "%", "warning");
  }
}

/**
 * Displays a toast alert message.
 * @param {string} message - Message to display.
 * @param {"error"|"warning"} type - Type of alert.
 * @returns {void}
 * @see https://apvarun.github.io/toastify-js/
 * @example
 * showAlert("High CPU usage", "error");
 */
function showAlert(message, type) {
  Toastify({
    text: message,
    duration: 5000,
    className: "toast-" + type,
    gravity: "top",
    position: "right",
  }).showToast();
}

/**
 * Updates icons based on memory and CPU usage.
 * @param {number} memoryPercent
 * @param {number} cpuPercent
 * @returns {void}
 * @example
 * updateIcons(85, 60);
 */
function updateIcons(memoryPercent, cpuPercent) {
  const memoryIcon = document.getElementById("memory-icon");
  const cpuIcon = document.getElementById("cpu-icon");

  // Actualizar ícono de memoria
  memoryIcon.className = "fas fa-memory card-icon";
  if (memoryPercent > 90) {
    memoryIcon.classList.add("pulse-error");
  } else if (memoryPercent > 75) {
    memoryIcon.classList.add("pulse-warning");
  }

  // Actualizar ícono de CPU
  cpuIcon.className = "fas fa-microchip card-icon";
  if (cpuPercent > 90) {
    cpuIcon.classList.add("pulse-error");
  } else if (cpuPercent > 70) {
    cpuIcon.classList.add("pulse-warning");
  }
}

/**
 * Formats uptime in seconds to a human-readable string.
 * @param {number} seconds
 * @returns {string}
 * @example
 * formatUptime(3661); // "1h 1m 1s"
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  let result = [];
  if (days > 0) result.push(`${days}d`);
  if (hours > 0) result.push(`${hours}h`);
  if (mins > 0) result.push(`${mins}m`);
  if (secs > 0 || result.length === 0) result.push(`${secs}s`);

  return result.join(" ");
}

/**
 * Returns a status class for memory usage.
 * @param {number} used
 * @param {number} total
 * @returns {"error"|"warning"|"healthy"}
 * @example
 * getMemoryStatusClass(950, 1000); // "error"
 */
function getMemoryStatusClass(used, total) {
  const percentage = (used / total) * 100;
  if (percentage > 90) return "error";
  if (percentage > 75) return "warning";
  return "healthy";
}

/**
 * Returns a status class for CPU usage.
 * @param {number} percent
 * @returns {"error"|"warning"|"healthy"}
 * @example
 * getCPUStatusClass(95); // "error"
 */
function getCPUStatusClass(percent) {
  if (percent > 90) return "error";
  if (percent > 70) return "warning";
  return "healthy";
}

/**
 * Formats bytes to a human-readable string.
 * @param {number} bytes
 * @returns {string}
 * @example
 * formatBytes(1048576); // "1 MB"
 */
function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Calculates percentage with two decimals.
 * @param {number} part
 * @param {number} total
 * @returns {string}
 * @example
 * calculatePercentage(50, 200); // "25.00"
 */
function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return ((part / total) * 100).toFixed(2);
}

/**
 * Exports system status data in JSON or CSV format.
 * @param {"json"|"csv"} format - Export format.
 * @returns {void}
 * @example
 * exportData("csv");
 */
function exportData(format) {
  if (!lastData) {
    showAlert("No data available to export", "warning");
    return;
  }

  const dataToExport = {
    timestamp: new Date().toISOString(),
    cpuHistory: cpuHistory,
    memoryHistory: memoryHistory,
    currentStatus: lastData,
  };

  let content, mimeType, extension;

  if (format === "csv") {
    // Convertir a CSV
    let csvContent = "Timestamp,CPU Usage %,Memory Usage %\n";
    for (let i = 0; i < cpuHistory.length; i++) {
      csvContent += `${cpuHistory[i].time},${cpuHistory[i].value},${memoryHistory[i].value}\n`;
    }
    content = csvContent;
    mimeType = "text/csv";
    extension = "csv";
  } else {
    // JSON por defecto
    content = JSON.stringify(dataToExport, null, 2);
    mimeType = "application/json";
    extension = "json";
  }

  // Crear blob y descargar
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `system-status-${new Date().toISOString().slice(0, 10)}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Selector de intervalo de actualización
 */
document.querySelectorAll(".refresh-option").forEach((option) => {
  option.addEventListener("click", function () {
    document.querySelectorAll(".refresh-option").forEach((opt) => opt.classList.remove("active"));
    this.classList.add("active");
    refreshInterval = parseInt(this.dataset.interval);

    // Reiniciar el temporizador
    clearInterval(refreshTimer);
    if (refreshInterval > 0) {
      refreshTimer = setInterval(updateData, refreshInterval);
      updateData(); // Actualizar inmediatamente
    }
  });
});

/**
 * Alternar vista compacta/detallada
 */
const viewToggle = document.getElementById("viewToggle");
viewToggle.addEventListener("click", () => {
  isCompactView = !isCompactView;
  document.body.classList.toggle("compact-view", isCompactView);

  if (isCompactView) {
    viewToggle.innerHTML =
      '<i class="fas fa-compress"></i>' +
      '<span class="lang-en">Compact View</span>' +
      '<span class="lang-es" style="display: none;">Vista Compacta</span>';
  } else {
    viewToggle.innerHTML =
      '<i class="fas fa-expand"></i>' +
      '<span class="lang-en">Detailed View</span>' +
      '<span class="lang-es" style="display: none;">Vista Detallada</span>';
  }
});

/**
 * Alternar actualizaciones en tiempo real
 */
const realTimeToggle = document.getElementById("realTimeToggle");
realTimeToggle.addEventListener("change", function () {
  isRealTimeActive = this.checked;
  if (isRealTimeActive) {
    updateData(); // Actualizar inmediatamente si se reactiva
  }
});

/**
 * Menú de exportación
 */
const exportBtn = document.getElementById("exportBtn");
const exportMenu = document.getElementById("exportMenu");

exportBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  exportMenu.classList.toggle("show");
});

document.querySelectorAll(".export-option").forEach((option) => {
  option.addEventListener("click", function () {
    exportData(this.dataset.format);
    exportMenu.classList.remove("show");
  });
});

// Cerrar menú de exportación al hacer clic fuera
document.addEventListener("click", function () {
  exportMenu.classList.remove("show");
});

// Iniciar actualización automática
refreshTimer = setInterval(updateData, refreshInterval);
updateData(); // Primera carga

/**
 * Handles theme toggle between dark and light.
 * Saves preference in localStorage.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 */
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", newTheme);

  // Update icon and text
  const icon = themeToggle.querySelector("i");
  if (newTheme === "dark") {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
    document.querySelectorAll(".lang-en").forEach((el) => (el.style.display = ""));
    document.querySelectorAll(".lang-es").forEach((el) => (el.style.display = "none"));
  } else {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
    document.querySelectorAll(".lang-en").forEach((el) => (el.style.display = "none"));
    document.querySelectorAll(".lang-es").forEach((el) => (el.style.display = ""));
  }

  // Save preference
  localStorage.setItem("theme", newTheme);
});

/**
 * Handles language toggle between English and Spanish.
 * Saves preference in localStorage.
 */
const languageToggle = document.getElementById("languageToggle");
languageToggle.addEventListener("click", () => {
  const currentLang = document.querySelector(".lang-en").style.display === "none" ? "es" : "en";
  if (currentLang === "en") {
    // Switch to Spanish
    document.querySelectorAll(".lang-en").forEach((el) => (el.style.display = "none"));
    document.querySelectorAll(".lang-es").forEach((el) => (el.style.display = ""));
    languageToggle.querySelector(".lang-en").style.display = "none";
    languageToggle.querySelector(".lang-es").style.display = "";
  } else {
    // Switch to English
    document.querySelectorAll(".lang-en").forEach((el) => (el.style.display = ""));
    document.querySelectorAll(".lang-es").forEach((el) => (el.style.display = "none"));
    languageToggle.querySelector(".lang-en").style.display = "";
    languageToggle.querySelector(".lang-es").style.display = "none";
  }

  // Save preference
  localStorage.setItem("language", currentLang === "en" ? "es" : "en");
});

/**
 * Loads saved theme and language preferences on DOMContentLoaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.setAttribute("data-theme", savedTheme);

  const themeIcon = themeToggle.querySelector("i");
  if (savedTheme === "light") {
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
  }

  const savedLang = localStorage.getItem("language") || "en";
  if (savedLang === "es") {
    document.querySelectorAll(".lang-en").forEach((el) => (el.style.display = "none"));
    document.querySelectorAll(".lang-es").forEach((el) => (el.style.display = ""));
    languageToggle.querySelector(".lang-en").style.display = "none";
    languageToggle.querySelector(".lang-es").style.display = "";
  }
});

/**
 * Animates background based on mouse movement.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
 */
document.addEventListener("mousemove", (e) => {
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;

  document.body.style.setProperty("--mouse-x", x);
  document.body.style.setProperty("--mouse-y", y);
});

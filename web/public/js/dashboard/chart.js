// ...existing code...

// Colors from dashboard.css
const neburaColors = {
  purple: "#c147d9",
  magenta: "#e91e63",
  pink: "#ff6b9d",
  blue: "#6c5ce7",
  cyan: "#00cec9",
  dark: "#0a0a0f",
  accentBg: "#2d2d44",
};

// Render Activity Type Pie Chart
/* async function renderActivityPieChart() {
  const res = await fetch('/dashboard/utils/activity-distribution');
  const data = await res.json();

  const ctx = document.getElementById('activityPieChart').getContext('2d');
  const labels = data.map(d => d.endpoint);
  const counts = data.map(d => d.count);

  const colors = [
    neburaColors.purple,
    neburaColors.magenta,
    neburaColors.pink,
    neburaColors.blue,
    neburaColors.cyan,
    neburaColors.dark
  ];

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderColor: neburaColors.accentBg,
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: neburaColors.purple }
        },
        title: {
          display: false
        }
      }
    }
  });
} */

// Render Requests Over Time Area Chart
async function renderRequestsAreaChart() {
  const res = await fetch("/dashboard/utils/requests-per-day");
  const data = await res.json();

  const ctx = document.getElementById("requestsAreaChart").getContext("2d");
  const labels = data.map((d) => d.date);
  const counts = data.map((d) => d.totalRequests);

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "API Requests",
          data: counts,
          fill: true,
          backgroundColor: "rgba(193,71,217,0.12)",
          borderColor: neburaColors.purple,
          pointBackgroundColor: neburaColors.magenta,
          tension: 0.3,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: { color: neburaColors.purple },
        },
        y: {
          ticks: { color: neburaColors.purple },
          beginAtZero: true,
        },
      },
    },
  });
}

async function renderLicensePieChart() {
  const res = await fetch("/dashboard/utils/license-distribution");
  const data = await res.json();

  const labels = data.map((d) => d.type.charAt(0).toUpperCase() + d.type.slice(1));
  const counts = data.map((d) => d.count);

  const colors = [neburaColors.purple, neburaColors.magenta, neburaColors.blue];

  new Chart(document.getElementById("licensePieChart").getContext("2d"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: colors,
          borderColor: neburaColors.accentBg,
          borderWidth: 2,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { color: neburaColors.purple },
        },
      },
    },
  });
}

// 2. Bar: License Usage
async function renderLicenseBarChart() {
  const res = await fetch("/dashboard/utils/license-usage");
  const data = await res.json();

  const labels = data.map((d) => d.key);
  const used = data.map((d) => d.requestCount);
  const limit = data.map((d) => d.requestLimit);

  new Chart(document.getElementById("licenseBarChart").getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Requests Used",
          data: used,
          backgroundColor: neburaColors.magenta,
        },
        {
          label: "Request Limit",
          data: limit,
          backgroundColor: neburaColors.purple,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "bottom", labels: { color: neburaColors.purple } },
      },
      scales: {
        x: { ticks: { color: neburaColors.purple } },
        y: { ticks: { color: neburaColors.purple }, beginAtZero: true },
      },
    },
  });
}

// 3. Line/Area: Licenses Over Time
async function renderLicensesLineChart() {
  const res = await fetch("/dashboard/utils/licenses-over-time");
  const data = await res.json();

  const labels = data.map((d) => d.date);
  const active = data.map((d) => d.active);
  const expired = data.map((d) => d.expired);

  new Chart(document.getElementById("licensesLineChart").getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Active",
          data: active,
          fill: true,
          backgroundColor: "rgba(193,71,217,0.12)",
          borderColor: neburaColors.purple,
          pointBackgroundColor: neburaColors.magenta,
          tension: 0.3,
        },
        {
          label: "Expired",
          data: expired,
          fill: true,
          backgroundColor: "rgba(233,30,99,0.10)",
          borderColor: neburaColors.magenta,
          pointBackgroundColor: neburaColors.purple,
          tension: 0.3,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "bottom", labels: { color: neburaColors.purple } },
      },
      scales: {
        x: { ticks: { color: neburaColors.purple } },
        y: { ticks: { color: neburaColors.purple }, beginAtZero: true },
      },
    },
  });
}

async function renderLicenseSummaryChart() {
  const res = await fetch("/dashboard/utils/license-summary");
  const data = await res.json();

  const labels = ["Basic", "Premium", "Enterprise"];
  const counts = [data.basic, data.premium, data.enterprise];

  const colors = [
    neburaColors.purple,
    neburaColors.magenta,
    neburaColors.blue
  ];

  new Chart(document.getElementById("licenseSummaryChart").getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Licenses",
        data: counts,
        backgroundColor: colors,
        borderColor: neburaColors.accentBg,
        borderWidth: 2
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: { ticks: { color: neburaColors.purple } },
        y: { ticks: { color: neburaColors.purple }, beginAtZero: true }
      }
    }
  });
}
// Inicializar las gráficas al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  //renderActivityPieChart();
  renderLicenseSummaryChart();
  renderRequestsAreaChart();
  renderLicensePieChart();
  renderLicenseBarChart();
  renderLicensesLineChart();
});
// ...existing code...

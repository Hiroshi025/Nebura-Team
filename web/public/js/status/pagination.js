(function () {
  const cores = window.cpuCoresData;
  if (!cores || !Array.isArray(cores)) return;
  const pageSize = 10;
  let currentPage = 1;

  function sumTimes(times) {
    return times.user + times.sys + times.idle + (times.nice || 0) + (times.irq || 0);
  }
  function calculatePercentage(val, total) {
    return total ? Math.round((val / total) * 100) : 0;
  }

  function renderCpuCores(page) {
    const container = document.getElementById("cpuCoresContainer");
    if (!container) return;
    container.innerHTML = "";
    // Limita el grid a 5 columnas
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(5, 1fr)";
    container.style.gap = "1rem";
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageCores = cores.slice(start, end);

    pageCores.forEach((core, idx) => {
      const total = sumTimes(core.times);
      container.innerHTML += `
        <div class="cpu-core">
          <h4 class="cpu-core-title">Core ${start + idx + 1}</h4>
          <div style="font-size:0.85rem; margin-bottom:0.5rem;">
            <span>Model: ${core.model || "-"}</span><br>
            <span>Speed: ${core.speed || "-"} MHz</span>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <div style="font-size: 0.8rem; margin-bottom: 0.25rem; display: flex; justify-content: space-between;">
              <span>User:</span>
              <span>${calculatePercentage(core.times.user, total)}%</span>
            </div>
            <div class="progress-bar" style="height: 6px;">
              <div
                class="progress-fill"
                style="width: ${calculatePercentage(core.times.user, total)}%; background: #6366f1;"
              ></div>
            </div>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <div style="font-size: 0.8rem; margin-bottom: 0.25rem; display: flex; justify-content: space-between;">
              <span>System:</span>
              <span>${calculatePercentage(core.times.sys, total)}%</span>
            </div>
            <div class="progress-bar" style="height: 6px;">
              <div
                class="progress-fill"
                style="width: ${calculatePercentage(core.times.sys, total)}%; background: #f59e0b;"
              ></div>
            </div>
          </div>
          <div>
            <div style="font-size: 0.8rem; margin-bottom: 0.25rem; display: flex; justify-content: space-between;">
              <span>Idle:</span>
              <span>${calculatePercentage(core.times.idle, total)}%</span>
            </div>
            <div class="progress-bar" style="height: 6px;">
              <div
                class="progress-fill"
                style="width: ${calculatePercentage(core.times.idle, total)}%; background: #10b981;"
              ></div>
            </div>
          </div>
        </div>
      `;
    });
  }

  function renderCpuCoresPagination() {
    const totalPages = Math.ceil(cores.length / pageSize);
    const container = document.getElementById("cpuCoresPagination");
    if (!container) return;
    container.innerHTML = "";
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      container.innerHTML += `
        <button class="pagination-btn${i === currentPage ? " active" : ""}" data-page="${i}" style="padding:6px 14px; border-radius:6px; border:none; background:${i === currentPage ? "#6366f1" : "var(--accent-bg)"}; color:${i === currentPage ? "#fff" : "#6366f1"}; font-weight:600; cursor:pointer;">
          ${i}
        </button>
      `;
    }
    container.querySelectorAll(".pagination-btn").forEach((btn) => {
      btn.onclick = function () {
        currentPage = Number(this.dataset.page);
        renderCpuCores(currentPage);
        renderCpuCoresPagination();
      };
    });
  }

  // Inicializa
  renderCpuCores(currentPage);
  renderCpuCoresPagination();
})();

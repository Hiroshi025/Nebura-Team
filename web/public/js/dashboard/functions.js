function showAdminTab(tabId) {
  // Quitar clase 'active' de todos los tabs
  document.querySelectorAll("#administration .language-tabs .lang-tab").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Ocultar todas las secciones
  document.querySelectorAll("#administration .page-section").forEach((sec) => {
    sec.classList.remove("active");
    sec.style.display = "none";
  });

  // Mostrar la sección seleccionada
  const section = document.getElementById(tabId);
  if (section) {
    section.classList.add("active");
    section.style.display = "block";
  }

  // Activar el tab correspondiente
  const tabIds = ["admin-tickets", "admin-metrics", "admin-configuration", "admin-advanced"];
  const idx = tabIds.indexOf(tabId);
  const tabs = document.querySelectorAll("#administration .language-tabs .lang-tab");
  if (tabs[idx]) {
    tabs[idx].classList.add("active");
  }
}

// Mostrar el tab de tickets al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  showAdminTab("admin-tickets");

  // --- Change User Role Form ---
  const userSelect = document.getElementById("changeUserId");
  const roleSelect = document.getElementById("changeUserRole");
  const feedback = document.getElementById("changeUserRoleFeedback");
  let usersList = [];

  // Fetch all users for dropdown
  fetch("/dashboard/utils/all-users")
    .then((res) => res.json())
    .then((users) => {
      usersList = users;
      userSelect.innerHTML =
        '<option value="">Select user...</option>' +
        users.map((u) => `<option value="${u.uuid}" data-role="${u.role}">${u.name} (${u.email})</option>`).join("");
    });

  // When user changes, update role select to highlight current role
  userSelect.addEventListener("change", function () {
    const selectedUuid = userSelect.value;
    const user = usersList.find((u) => u.uuid === selectedUuid);
    if (!user) return;
    Array.from(roleSelect.options).forEach((opt) => {
      opt.style.fontWeight = opt.value === user.role ? "bold" : "normal";
      opt.style.background = opt.value === user.role ? "var(--accent-bg)" : "";
    });
    roleSelect.value = user.role;
  });

  // --- Notificación visual mejorada ---
  function showNotification(element, message, type = "info") {
    // type: "success", "error", "info"
    element.innerHTML = `
      <div class="custom-notification ${type}">
        <span class="notif-icon">
          ${
            type === "success"
              ? '<svg width="18" height="18" fill="#00ff88"><circle cx="9" cy="9" r="8"/><path d="M6 9l3 3 5-5" stroke="#fff" stroke-width="2" fill="none"/></svg>'
              : type === "error"
                ? '<svg width="18" height="18" fill="#e91e63"><circle cx="9" cy="9" r="8"/><line x1="6" y1="6" x2="12" y2="12" stroke="#fff" stroke-width="2"/><line x1="12" y1="6" x2="6" y2="12" stroke="#fff" stroke-width="2"/></svg>'
                : '<svg width="18" height="18" fill="#ffb300"><circle cx="9" cy="9" r="8"/><text x="9" y="13" text-anchor="middle" font-size="10" fill="#fff">!</text></svg>'
          }
        </span>
        <span class="notif-message">${message}</span>
        <button class="notif-close" onclick="this.parentElement.parentElement.innerHTML=''">&times;</button>
      </div>
    `;
    element.style.display = "block";
    setTimeout(() => {
      element.innerHTML = "";
      element.style.display = "none";
    }, 4000);
  }

  // On submit, send request to backend (you must implement the endpoint)
  document.getElementById("changeUserRoleForm").onsubmit = function (e) {
    e.preventDefault();
    feedback.innerHTML = "";
    const uuid = userSelect.value;
    const role = roleSelect.value;
    if (!uuid || !role) {
      showNotification(feedback, "Please select a user and a role.", "error");
      return false;
    }
    fetch("/dashboard/utils/change-user-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid, role }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showNotification(feedback, "Role changed successfully!", "success");
        } else {
          showNotification(feedback, data.message || "Failed to change role.", "error");
        }
      })
      .catch(() => {
        showNotification(feedback, "Error changing role.", "error");
      });
    return false;
  };

  // --- PAGINACIÓN DE USUARIOS ---
  if (window.usersData && Array.isArray(window.usersData)) {
    const users = window.usersData;
    const pageSize = 5;
    let currentPage = 1;

    function renderUsersTable(page) {
      const tbody = document.getElementById("userTableBody");
      if (!tbody) return;
      tbody.innerHTML = "";
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const pageUsers = users.slice(start, end);

      if (pageUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; padding:18px; color:var(--text-secondary);">No users found.</td></tr>`;
        return;
      }

      pageUsers.forEach((user, idx) => {
        tbody.innerHTML += `
          <tr style="background:var(--primary-bg);">
            <td style="text-align:center; font-weight:700;">${start + idx + 1}</td>
            <td>${user.id || ""}</td>
            <td style="font-family:'Courier New',monospace;">${user.uuid || ""}</td>
            <td>${user.name || ""}</td>
            <td>${user.email || ""}</td>
            <td><span style="color:var(--nebura-purple); font-weight:600;">${user.role || ""}</span></td>
            <td>
              ${user.isClient ? '<span style="color:#00ff88;">✔️</span>' : '<span style="color:#ff6b9d;">❌</span>'}
            </td>
            <td>
              ${user.licenses ? `<span title="Licenses count">${user.licenses.length}</span>` : "0"}
            </td>
            <td>
              ${
                user.discordInfo
                  ? `<span title="${user.discordInfo.username}#${user.discordInfo.discriminator}">
                    <img src="https://cdn.discordapp.com/avatars/${user.discordInfo.id}/${user.discordInfo.avatar}.png" alt="Avatar" style="width:24px; height:24px; border-radius:50%; vertical-align:middle;" />
                    ${user.discordInfo.username}
                  </span>`
                  : "-"
              }
            </td>
            <td>
              ${user.qrCodeBase64 ? `<img src="${user.qrCodeBase64}" alt="QR" style="width:32px; height:32px;" />` : "-"}
            </td>
            <td>
              ${
                user.deletedAt
                  ? `<span style="color:var(--nebura-magenta);">${formatDate(user.deletedAt)}</span>`
                  : '<span style="color:#00ff88;">Active</span>'
              }
            </td>
            <td>
              ${user.tickets ? `<span title="Tickets count">${user.tickets.length}</span>` : "0"}
            </td>
          </tr>
        `;
      });
    }

    function renderUserPagination() {
      const totalPages = Math.ceil(users.length / pageSize);
      const container = document.getElementById("userPagination");
      if (!container) return;
      container.innerHTML = "";
      if (totalPages <= 1) return;

      for (let i = 1; i <= totalPages; i++) {
        container.innerHTML += `
          <button class="pagination-btn${i === currentPage ? " active" : ""}" data-page="${i}" style="padding:6px 14px; border-radius:6px; border:none; background:${i === currentPage ? "var(--nebura-purple)" : "var(--accent-bg)"}; color:${i === currentPage ? "#fff" : "var(--nebura-purple)"}; font-weight:600; cursor:pointer;">
            ${i}
          </button>
        `;
      }
      container.querySelectorAll(".pagination-btn").forEach((btn) => {
        btn.onclick = function () {
          currentPage = Number(this.dataset.page);
          renderUsersTable(currentPage);
          renderUserPagination();
        };
      });
    }

    function formatDate(dateStr) {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      return d.toLocaleDateString();
    }

    // Inicializa
    renderUsersTable(currentPage);
    renderUserPagination();
  }

  // --- PAGINACIÓN DE LICENCIAS DE USUARIO ---
  if (window.userLicenses && Array.isArray(window.userLicenses)) {
    const licenses = window.userLicenses;
    const pageSize = 4;
    let currentPage = 1;

    function capitalize(str) {
      return str && typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : "";
    }

    function isExpired(validUntil) {
      return new Date(validUntil) < new Date();
    }

    function formatNumber(num) {
      return typeof num === "number" ? num.toLocaleString() : num;
    }

    function formatMonthYear(dateStr) {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      return d.toLocaleString("default", { month: "short", year: "numeric" });
    }

    function renderLicenses(page) {
      const grid = document.getElementById("licensesGrid");
      if (!grid) return;
      grid.innerHTML = "";
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const pageLicenses = licenses.slice(start, end);

      if (pageLicenses.length === 0) {
        grid.innerHTML = `<div style="text-align:center; padding:18px; color:var(--text-secondary);">No licenses found.</div>`;
        return;
      }

      pageLicenses.forEach((lic) => {
        const expired = isExpired(lic.validUntil);
        grid.innerHTML += `
        <div class="license-card ${lic.type}">
          <div class="license-header">
            <div class="license-type">${capitalize(lic.type)}</div>
            <div class="license-status ${expired ? "expired" : "active"}">
              ${expired ? "EXPIRED" : "ACTIVE"}
            </div>
          </div>
          <div class="license-details">
            <div class="license-detail">
              <div class="license-detail-value">
                ${lic.type === "enterprise" ? "∞" : formatNumber(lic.requestLimit)}
              </div>
              <div class="license-detail-label">Request Limit</div>
            </div>
            <div class="license-detail">
              <div class="license-detail-value">${formatNumber(lic.requestCount)}</div>
              <div class="license-detail-label">Requests Used</div>
            </div>
            <div class="license-detail">
              <div class="license-detail-value">${lic.maxIps}</div>
              <div class="license-detail-label">Max IPs</div>
            </div>
            <div class="license-detail">
              <div class="license-detail-value">${formatMonthYear(lic.validUntil)}</div>
              <div class="license-detail-label">${expired ? "Expired" : "Expires"}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px">
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px">License Key:</div>
            ${
              expired
                ? `<div class="license-key" style="opacity: 0.5; cursor: not-allowed">${lic.key}<div class="copy-feedback">License Expired</div></div>`
                : `<div class="license-key" onclick="copyLicenseKey(this)" data-key="${lic.key}">${lic.key}<div class="copy-feedback">Copied!</div></div>`
            }
          </div>
          <div style="font-size: 11px; font-family: 'Courier New', monospace; background: var(--accent-bg); padding: 8px; border-radius: 6px; line-height: 1.3;${expired ? "opacity: 0.7;" : ""}">
            <div><strong>ID:</strong> ${lic.id}</div>
            <div><strong>User ID:</strong> ${lic.userId}</div>
            <div><strong>Admin ID:</strong> ${lic.adminId}</div>
            <div><strong>Identifier:</strong> ${lic.identifier}</div>
            <div><strong>Created:</strong> ${lic.createdAt}</div>
            ${
              expired
                ? `<div><strong>Expired:</strong> ${lic.validUntil}</div>`
                : `<div><strong>Last IP:</strong> ${lic.lastUsedIp}</div>
                 <div><strong>HWIDs:</strong> ${lic.hwid ? lic.hwid.length : 0} registered</div>`
            }
          </div>
        </div>
        `;
      });
    }

    function renderLicensesPagination() {
      const totalPages = Math.ceil(licenses.length / pageSize);
      const container = document.getElementById("licensesPagination");
      if (!container) return;
      container.innerHTML = "";
      if (totalPages <= 1) return;

      for (let i = 1; i <= totalPages; i++) {
        container.innerHTML += `
          <button class="pagination-btn${i === currentPage ? " active" : ""}" data-page="${i}" style="padding:6px 14px; border-radius:6px; border:none; background:${i === currentPage ? "var(--nebura-purple)" : "var(--accent-bg)"}; color:${i === currentPage ? "#fff" : "var(--nebura-purple)"}; font-weight:600; cursor:pointer;">
            ${i}
          </button>
        `;
      }
      container.querySelectorAll(".pagination-btn").forEach((btn) => {
        btn.onclick = function () {
          currentPage = Number(this.dataset.page);
          renderLicenses(currentPage);
          renderLicensesPagination();
        };
      });
    }

    // Inicializa
    renderLicenses(currentPage);
    renderLicensesPagination();
  }
});

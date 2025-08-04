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

// Helper para poblar datalist de usuarios y admins
async function populateUserAdminLists() {
  // Obtén todos los usuarios y admins (puedes filtrar por rol si lo deseas)
  try {
    const res = await fetch("/dashboard/utils/all-users");
    if (!res.ok) return;
    const users = await res.json();
    const userList = document.getElementById("userIdList");
    const adminList = document.getElementById("adminIdList");
    if (userList) userList.innerHTML = "";
    if (adminList) adminList.innerHTML = "";
    users.forEach((u) => {
      // userIdList: todos los usuarios
      if (userList) {
        const opt = document.createElement("option");
        opt.value = u.uuid;
        opt.label = `${u.name || u.discordInfo?.username || u.email || u.uuid}`;
        userList.appendChild(opt);
      }
      // adminIdList: solo admins
      if (adminList && (u.role === "owner" || u.role === "moderator" || u.role === "developer")) {
        const opt = document.createElement("option");
        opt.value = u.uuid;
        opt.label = `${u.name || u.discordInfo?.username || u.email || u.uuid}`;
        adminList.appendChild(opt);
      }
    });
  } catch (err) {
    // Silencioso
  }
}

document.addEventListener("DOMContentLoaded", function () {
  showAdminTab("admin-tickets");
  populateUserAdminLists();
  const form = document.getElementById("advancedLicenseForm");
  if (form) {
    // License Key generator
    document.getElementById("generateLicenseKey").addEventListener("click", function () {
      form.key.value = generateRandomKey();
    });
    // Identifier generator
    document.getElementById("generateIdentifier").addEventListener("click", function () {
      form.identifier.value = "LIC-" + generateNeburaIdentifier().toUpperCase();
    });
    // HWID generator
    document.getElementById("generateHWID").addEventListener("click", function () {
      form.hwid.value = generateRandomHWIDs(1).join(",");
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const feedback = document.getElementById("advancedLicenseFeedback");
      feedback.innerHTML = "";
      feedback.style.color = "";

      // Collect form data
      const data = {
        type: form.type.value,
        key: form.key.value,
        userId: form.userId.value,
        adminId: form.adminId.value,
        hwid: form.hwid.value
          ? form.hwid.value
              .split(",")
              .map((h) => h.trim())
              .filter(Boolean)
          : [],
        requestLimit: Number(form.requestLimit.value),
        validUntil: form.validUntil.value,
        maxIps: Number(form.maxIps.value),
        identifier: form.identifier.value,
      };

      // Basic validation
      if (!data.type || !data.key || !data.userId || !data.adminId || !data.validUntil || !data.identifier) {
        showNotification(feedback, "Please fill all required fields.", "error");
        return;
      }

      try {
        const res = await fetch("/dashboard/utils/create-license", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (res.ok) {
          showNotification(feedback, "License created successfully!", "success");
          form.reset();
          populateUserAdminLists();
        } else {
          showNotification(feedback, result.message || "Error creating license.", "error");
        }
      } catch (err) {
        showNotification(feedback, "Network error. Please try again.", "error");
      }
    });
  }

  // --- PAGINACIÓN DE LICENCIAS ---
  if (window.licencesData && Array.isArray(window.licencesData)) {
    const licences = window.licencesData;
    const pageSize = 5;
    let currentPage = 1;

    function renderLicensesTable(page) {
      const tbody = document.getElementById("licenseTableBody");
      if (!tbody) return;
      tbody.innerHTML = "";
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const pageLicences = licences.slice(start, end);

      if (pageLicences.length === 0) {
        tbody.innerHTML = `<tr><td colspan="17" style="text-align:center; padding:18px; color:var(--text-secondary);">No licenses found.</td></tr>`;
        return;
      }

      pageLicences.forEach((lic, idx) => {
        const isExpired = new Date(lic.validUntil) < new Date();
        tbody.innerHTML += `
          <tr style="background:${isExpired ? "rgba(233,30,99,0.07)" : "var(--primary-bg)"};">
            <td style="text-align:center; font-weight:700;">${start + idx + 1}</td>
            <td>${(lic.type || "").charAt(0).toUpperCase() + (lic.type || "").slice(1)}</td>
            <td style="font-family:'Courier New',monospace;">${lic.key}</td>
            <td>${lic.identifier}</td>
            <td>${lic.userId}</td>
            <td>${lic.adminId}</td>
            <td>${lic.hwid ? lic.hwid.length : 0}</td>
            <td>${lic.requestLimit}</td>
            <td>${lic.requestCount}</td>
            <td>${lic.maxIps}</td>
            <td>${lic.ips ? lic.ips.length : 0}</td>
            <td>${lic.lastUsedIp || ""}</td>
            <td>${lic.lastUsedHwid || ""}</td>
            <td>${formatDate(lic.validUntil)}</td>
            <td>${formatDate(lic.createdAt)}</td>
            <td>${formatDate(lic.updatedAt)}</td>
            <td>
              ${isExpired ? '<span style="color:#ff6b9d;">Expired</span>' : '<span style="color:#00ff88;">Active</span>'}
            </td>
          </tr>
        `;
      });
    }

    function renderPagination() {
      const totalPages = Math.ceil(licences.length / pageSize);
      const container = document.getElementById("licensePagination");
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
      // Eventos
      container.querySelectorAll(".pagination-btn").forEach((btn) => {
        btn.onclick = function () {
          currentPage = Number(this.dataset.page);
          renderLicensesTable(currentPage);
          renderPagination();
        };
      });
    }

    // Formato de fecha (puedes mejorar según tu preferencia)
    function formatDate(dateStr) {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      return d.toLocaleDateString();
    }

    // Inicializa
    renderLicensesTable(currentPage);
    renderPagination();
  }
});

// Random key generator (alphanumeric, length)
function generateRandomKey() {
  function part() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let l = "";
    let n = "";
    for (let i = 0; i < 2; i++) {
      l += letters.charAt(Math.floor(Math.random() * letters.length));
      n += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return l + n;
  }
  return `${part()}-${part()}-${part()}`;
}

function generateNeburaIdentifier() {
  function part() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let l = "";
    let n = "";
    for (let i = 0; i < 2; i++) {
      l += letters.charAt(Math.floor(Math.random() * letters.length));
      n += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return l + n;
  }
  // NEBURA en el centro
  return `${part()}-${part()}-NEBURA-${part()}-${part()}`;
}

// HWID generator (returns array of random HWIDs)
function generateRandomHWIDs(count) {
  const hwids = [];
  for (let i = 0; i < count; i++) {
    hwids.push("HWID-" + generateRandomKey().toUpperCase());
  }
  return hwids;
}

// --- Notificación visual mejorada ---
function showNotification(element, message, type = "info") {
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

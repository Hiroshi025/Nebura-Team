// Utilidades para administración de tickets

const adminTicketsTable = document.getElementById("adminTicketsTable").querySelector("tbody");
const adminTicketSearchForm = document.getElementById("adminTicketSearchForm");
const adminTicketSearchFeedback = document.getElementById("adminTicketSearchFeedback");
const adminTicketDetailsModal = document.getElementById("adminTicketDetailsModal");
const adminTicketHistoryModal = document.getElementById("adminTicketHistoryModal");
const adminExportCsv = document.getElementById("adminExportCsv");
const adminExportPdf = document.getElementById("adminExportPdf");
const adminTicketChatModal = document.getElementById("adminTicketChatModal");
const adminTicketChatTitle = document.getElementById("adminTicketChatTitle");
const adminTicketChatId = document.getElementById("adminTicketChatId");
const adminTicketChatMessages = document.getElementById("adminTicketChatMessages");
const adminTicketChatForm = document.getElementById("adminTicketChatForm");
const adminTicketChatFeedback = document.getElementById("adminTicketChatFeedback");

let lastSearchFilters = {};
let chatReloadInterval = null;

function renderTicketsTable(tickets) {
  adminTicketsTable.innerHTML = "";
  if (!tickets || tickets.length === 0) {
    adminTicketsTable.innerHTML = `<tr><td colspan="10" style="text-align:center; color:var(--text-secondary); padding:12px;">No tickets found.</td></tr>`;
    return;
  }
  tickets.forEach((ticket) => {
    adminTicketsTable.innerHTML += `
      <tr>
        <td>${ticket.uuid}</td>
        <td><span style="font-weight:600;"><svg width="14" height="14" style="vertical-align:middle;margin-right:3px;" fill="currentColor"><circle cx="7" cy="7" r="6"/></svg>${ticket.id}</span></td>
        <td><span style="color:var(--nebura-purple); font-weight:600;"><svg width="14" height="14" style="vertical-align:middle;margin-right:3px;" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>${ticket.title}</span></td>
        <td>${ticket.userId}</td>
        <td><span class="ticket-status ticket-status-${ticket.status}" style="font-weight:600;">${ticket.status}</span></td>
        <td><span style="color:${ticket.priority === "critical" ? "#ff6b9d" : "var(--nebura-purple)"}; font-weight:600;">${ticket.priority}</span></td>
        <td>${ticket.category ?? ""}</td>
        <td>${Array.isArray(ticket.tags) ? ticket.tags.map((t) => `<span class="filter-tag">${t}</span>`).join(" ") : ""}</td>
        <td>${ticket.assignedTo ?? ""}</td>
        <td>${ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : ""}</td>
        <td>
          <div style="display:flex; flex-direction:row; gap:4px; flex-wrap:nowrap;">
            <button class="run-btn" style="min-width:36px; background:var(--gradient-accent); padding:6px 0;" title="View" onclick="viewTicketDetails('${ticket.uuid}')">
              <svg width="14" height="14" style="vertical-align:middle;" fill="currentColor"><circle cx="7" cy="7" r="6"/><polyline points="5,7 7,9 9,7" stroke="white" stroke-width="1.5" fill="none"/></svg>
            </button>
            <button class="run-btn" style="min-width:36px; background:var(--nebura-magenta); padding:6px 0;" title="Edit" onclick="editTicketModal('${ticket.uuid}')">
              <svg width="14" height="14" style="vertical-align:middle;" fill="currentColor"><rect x="2" y="10" width="10" height="2" rx="1"/><polygon points="12,2 14,4 6,12 4,10"/></svg>
            </button>
            <button class="run-btn" style="min-width:36px; background:var(--nebura-blue); padding:6px 0;" title="History" onclick="viewTicketHistory('${ticket.uuid}')">
              <svg width="14" height="14" style="vertical-align:middle;" fill="currentColor"><path d="M7 2v10l5-5-5-5z"/></svg>
            </button>
            <button class="run-btn" style="min-width:36px; background:var(--nebura-purple); padding:6px 0;" title="Chat" onclick="openAdminTicketChat('${ticket.uuid}')">
              <svg width="14" height="14" style="vertical-align:middle;" fill="currentColor"><rect x="2" y="4" width="10" height="6" rx="2"/><polygon points="12,10 14,12 12,14"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

async function fetchTickets(filters = {}) {
  adminTicketSearchFeedback.textContent = "Loading...";
  lastSearchFilters = filters;
  try {
    // Si hay ticketUuid, úsalo para búsqueda específica
    const searchBody = { ...filters };
    if (searchBody.ticketId) {
      searchBody.ticketUuid = searchBody.ticketId;
      delete searchBody.ticketId;
    }
    const res = await fetch("/dashboard/utils/tickets/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchBody),
    });
    const data = await res.json();
    renderTicketsTable(data.tickets);
    adminTicketSearchFeedback.textContent = `Found ${data.tickets.length} tickets.`;
  } catch (err) {
    adminTicketSearchFeedback.textContent = "Error loading tickets.";
  }
}

// Form submit para búsqueda avanzada
adminTicketSearchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(adminTicketSearchForm);
  const filters = {};
  for (const [key, value] of formData.entries()) {
    if (value) {
      if (key === "tags" || key === "attachmentTypes") {
        filters[key] = value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      } else {
        filters[key] = value;
      }
    }
  }
  fetchTickets(filters);
});

// Export CSV
adminExportCsv.addEventListener("click", async function () {
  try {
    const res = await fetch("/dashboard/utils/tickets/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "csv", filters: lastSearchFilters }),
    });
    const data = await res.json();
    const blob = new Blob([data.data], { type: data.contentType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = data.filename;
    link.click();
  } catch (err) {
    adminTicketSearchFeedback.textContent = "Error exporting CSV.";
  }
});

// Export PDF
adminExportPdf.addEventListener("click", async function () {
  try {
    const res = await fetch("/dashboard/utils/tickets/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "pdf", filters: lastSearchFilters }),
    });
    const data = await res.json();
    const blob = new Blob([data.data], { type: data.contentType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = data.filename;
    link.click();
  } catch (err) {
    adminTicketSearchFeedback.textContent = "Error exporting PDF.";
  }
});

// Ver detalles de ticket
async function viewTicketDetails(ticketUuid) {
  adminTicketDetailsModal.style.display = "block";
  adminTicketDetailsModal.innerHTML = '<div class="loading"></div> Loading ticket details...';
  try {
    const res = await fetch("/dashboard/utils/tickets/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketUuid }),
    });
    const data = await res.json();
    const ticket = data.tickets && data.tickets[0];
    if (!ticket) {
      adminTicketDetailsModal.innerHTML = '<div style="color:var(--text-secondary);">Ticket not found.</div>';
      return;
    }
    adminTicketDetailsModal.innerHTML = `
      <div class="ticket-details-card-inner">
        <div class="ticket-details-header">
          <span class="ticket-details-title">${ticket.title}</span>
          <span class="ticket-status ticket-status-${ticket.status}">${ticket.status}</span>
        </div>
        <div class="ticket-details-grid">
          <div class="ticket-detail"><div class="ticket-detail-label">ID</div><div class="ticket-detail-value">${ticket.id}</div></div>
          <div class="ticket-detail"><div class="ticket-detail-label">User</div><div class="ticket-detail-value">${ticket.userId}</div></div>
          <div class="ticket-detail"><div class="ticket-detail-label">Priority</div><div class="ticket-detail-value">${ticket.priority}</div></div>
          <div class="ticket-detail"><div class="ticket-detail-label">Category</div><div class="ticket-detail-value">${ticket.category ?? ""}</div></div>
          <div class="ticket-detail"><div class="ticket-detail-label">Tags</div><div class="ticket-detail-value">${Array.isArray(ticket.tags) ? ticket.tags.join(", ") : ""}</div></div>
          <div class="ticket-detail"><div class="ticket-detail-label">Assigned</div><div class="ticket-detail-value">${ticket.assignedTo ?? ""}</div></div>
          <div class="ticket-detail"><div class="ticket-detail-label">Custom Status</div><div class="ticket-detail-value">${ticket.customStatus ?? ""}</div></div>
          <div class="ticket-detail"><div class="ticket-detail-label">Created</div><div class="ticket-detail-value">${ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : ""}</div></div>
          <div class="ticket-detail"><div class="ticket-detail-label">Updated</div><div class="ticket-detail-value">${ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : ""}</div></div>
        </div>
        <div class="ticket-details-actions" style="display:flex; gap:10px; margin-top:18px;">
          <button class="run-btn" style="background:var(--nebura-blue); min-width:90px;" onclick="editTicketModal('${ticket.id}')">
            <svg width="14" height="14" style="vertical-align:middle;margin-right:5px;" fill="currentColor"><path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm14.71-12.04c.39-.39.39-1.02 0-1.41l-2.54-2.54a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            Edit
          </button>
          <button class="run-btn" style="background:var(--nebura-magenta); min-width:90px;" onclick="viewTicketHistory('${ticket.id}')">
            <svg width="14" height="14" style="vertical-align:middle;margin-right:5px;" fill="currentColor"><path d="M12 8V4l8 8-8 8v-4H4V8z"/></svg>
            History
          </button>
          <button class="run-btn" style="background:var(--nebura-purple); min-width:90px;" onclick="closeTicketDetailsModal()">
            <svg width="14" height="14" style="vertical-align:middle;margin-right:5px;" fill="currentColor"><circle cx="7" cy="7" r="6"/></svg>
            Close
          </button>
        </div>
      </div>
    `;
  } catch (err) {
    adminTicketDetailsModal.innerHTML = '<div style="color:var(--text-secondary);">Error loading ticket details.</div>';
  }
}

function closeTicketDetailsModal() {
  adminTicketDetailsModal.style.display = "none";
}

// Editar ticket (modal simple)
function editTicketModal(ticketUuid) {
  adminTicketDetailsModal.style.display = "block";
  adminTicketDetailsModal.innerHTML = '<div class="loading"></div> Loading ticket for edit...';
  fetch("/dashboard/utils/tickets/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticketUuid }),
  })
    .then((res) => res.json())
    .then((data) => {
      const ticket = data.tickets && data.tickets[0];
      if (!ticket) {
        adminTicketDetailsModal.innerHTML = '<div style="color:var(--text-secondary);">Ticket not found.</div>';
        return;
      }
      adminTicketDetailsModal.innerHTML = `
        <div class="dashboard-card ticket-create-card" style="background:var(--secondary-bg); box-shadow:0 2px 8px var(--shadow-light); border-radius:12px; border:1.5px solid var(--border-color); padding:24px 28px;">
          <h3 style="font-size:18px; font-weight:700; margin-bottom:15px; color:var(--nebura-purple);">✏️ Edit Ticket</h3>
          <form id="adminEditTicketForm" style="display:grid; gap:14px;">
            <input type="hidden" name="ticketId" value="${ticket.id}">
            <div class="form-group">
              <label style="font-weight:500;">Title</label>
              <input type="text" name="title" class="control-input ticket-input" value="${ticket.title}" required maxlength="80">
            </div>
            <div class="form-group">
              <label style="font-weight:500;">Description</label>
              <textarea name="description" class="control-input ticket-input" rows="3" required>${ticket.description}</textarea>
            </div>
            <div class="form-group">
              <label style="font-weight:500;">Status</label>
              <select name="status" class="control-select ticket-select">
                <option value="open" ${ticket.status === "open" ? "selected" : ""}>Open</option>
                <option value="in_progress" ${ticket.status === "in_progress" ? "selected" : ""}>In Progress</option>
                <option value="waiting_user" ${ticket.status === "waiting_user" ? "selected" : ""}>Waiting User</option>
                <option value="closed" ${ticket.status === "closed" ? "selected" : ""}>Closed</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-weight:500;">Priority</label>
              <select name="priority" class="control-select ticket-select">
                <option value="low" ${ticket.priority === "low" ? "selected" : ""}>Low</option>
                <option value="medium" ${ticket.priority === "medium" ? "selected" : ""}>Medium</option>
                <option value="high" ${ticket.priority === "high" ? "selected" : ""}>High</option>
                <option value="critical" ${ticket.priority === "critical" ? "selected" : ""}>Critical</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-weight:500;">Category</label>
              <input type="text" name="category" class="control-input ticket-input" value="${ticket.category ?? ""}">
            </div>
            <div class="form-group">
              <label style="font-weight:500;">Tags</label>
              <input type="text" name="tags" class="control-input ticket-input" value="${Array.isArray(ticket.tags) ? ticket.tags.join(", ") : ""}">
            </div>
            <div class="form-group">
              <label style="font-weight:500;">Assigned To</label>
              <input type="text" name="assignedTo" class="control-input ticket-input" value="${ticket.assignedTo ?? ""}">
            </div>
            <div class="form-group">
              <label style="font-weight:500;">Custom Status</label>
              <input type="text" name="customStatus" class="control-input ticket-input" value="${ticket.customStatus ?? ""}">
            </div>
            <div style="display:flex; gap:12px; margin-top:10px;">
              <button type="submit" class="run-btn" style="flex:1;">Save Changes</button>
              <button type="button" class="run-btn" style="background:var(--nebura-magenta); flex:1;" onclick="closeTicketDetailsModal()">Cancel</button>
            </div>
            <div id="adminEditTicketFeedback" style="margin-top:8px; font-size:13px;"></div>
          </form>
        </div>
      `;
      document.getElementById("adminEditTicketForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const body = { ticketUuid: ticket.uuid, userId: ticket.userId };
        for (const [key, value] of formData.entries()) {
          if (key === "tags") {
            body.tags = value
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean);
          } else {
            body[key] = value;
          }
        }
        try {
          const res = await fetch("/dashboard/utils/tickets/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          document.getElementById("adminEditTicketFeedback").textContent = data.success
            ? "Ticket updated successfully."
            : data.message;
          if (data.success) {
            fetchTickets(lastSearchFilters);
            setTimeout(closeTicketDetailsModal, 1200);
          }
        } catch (err) {
          document.getElementById("adminEditTicketFeedback").textContent = "Error updating ticket.";
        }
      });
    });
}

// Ver historial de ticket
async function viewTicketHistory(ticketUuid) {
  adminTicketHistoryModal.style.display = "block";
  adminTicketHistoryModal.innerHTML = '<div class="loading"></div> Loading ticket history...';
  try {
    const res = await fetch(`/dashboard/utils/tickets/history/${ticketUuid}`);
    const data = await res.json();
    const history = data.history;
    if (!Array.isArray(history) || history.length === 0) {
      adminTicketHistoryModal.innerHTML = `<div style="color:var(--text-secondary); font-size:16px; text-align:center; margin-bottom:18px;">
          <svg width="32" height="32" fill="currentColor" style="vertical-align:middle; margin-bottom:8px;">
            <circle cx="16" cy="16" r="15" fill="#f3f3f3" stroke="#e0e0e0" stroke-width="2"/>
            <text x="16" y="21" text-anchor="middle" font-size="18" fill="#bbb">!</text>
          </svg>
          <br>No history found for this ticket.
        </div>
        <div style="display:flex; justify-content:flex-end;">
          <button class="run-btn" style="background:var(--nebura-purple); min-width:110px; font-weight:600;" onclick="closeTicketHistoryModal()">
            <svg width="16" height="16" style="vertical-align:middle;margin-right:6px;" fill="currentColor"><circle cx="8" cy="8" r="7"/></svg>
            Close
          </button>
        </div>`;
      return;
    }
    adminTicketHistoryModal.innerHTML = `
      <div class="dashboard-card" style="background:var(--secondary-bg); box-shadow:0 2px 12px var(--shadow-light); border-radius:14px; border:2px solid var(--nebura-purple); padding:28px 32px;">
        <h3 style="font-size:21px; font-weight:800; color:var(--nebura-purple); margin-bottom:18px; display:flex; align-items:center; gap:10px;">
          <svg width="22" height="22" style="vertical-align:middle;" fill="currentColor"><path d="M12 8V4l8 8-8 8v-4H4V8z"/></svg>
          Ticket History
        </h3>
        <div style="display:flex; flex-direction:column; gap:18px;">
          ${history
            .map(
              (h) => `
              <div style="background:var(--accent-bg); border-radius:10px; box-shadow:0 1px 6px var(--shadow-light); padding:18px 20px; margin-bottom:0;">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                  <div style="width:32px; height:32px; border-radius:50%; background:var(--nebura-purple); display:flex; align-items:center; justify-content:center;">
                    <svg width="18" height="18" fill="white"><circle cx="9" cy="9" r="8"/></svg>
                  </div>
                  <div>
                    <span style="font-weight:700; color:var(--nebura-purple); font-size:15px;">${h.action}</span>
                    <span style="font-size:13px; color:var(--nebura-magenta); margin-left:10px;">${h.timestamp}</span>
                  </div>
                </div>
                <div style="font-size:14px; color:var(--text-secondary); margin-bottom:6px;">
                  <strong>User:</strong> <span style="color:var(--nebura-blue); font-weight:600;">${h.userId}</span>
                </div>
                <div style="font-size:13px; background:var(--primary-bg); border-radius:7px; padding:10px; margin-top:6px;">
                  <strong>Details:</strong>
                  <pre style="font-size:12px; background:none; border:none; margin:0; padding:0;">${JSON.stringify(h.details, null, 2)}</pre>
                </div>
              </div>
            `,
            )
            .join("")}
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:24px;">
          <button class="run-btn" style="background:var(--nebura-purple); min-width:110px; font-weight:600;" onclick="closeTicketHistoryModal()">
            <svg width="16" height="16" style="vertical-align:middle;margin-right:6px;" fill="currentColor"><circle cx="8" cy="8" r="7"/></svg>
            Close
          </button>
        </div>
      </div>
    `;
  } catch (err) {
    adminTicketHistoryModal.innerHTML = `<div style="color:var(--text-secondary); font-size:16px; text-align:center; margin-bottom:18px;">
        Error loading ticket history.
      </div>
      <div style="display:flex; justify-content:flex-end;">
        <button class="run-btn" style="background:var(--nebura-purple); min-width:110px; font-weight:600;" onclick="closeTicketHistoryModal()">
          <svg width="16" height="16" style="vertical-align:middle;margin-right:6px;" fill="currentColor"><circle cx="8" cy="8" r="7"/></svg>
          Close
        </button>
      </div>`;
  }
}

// Ticket Chat (Admin puede responder)
async function openAdminTicketChat(ticketUuid) {
  adminTicketChatModal.style.display = "block";
  adminTicketChatTitle.textContent = "Ticket Chat";
  adminTicketChatId.textContent = "#" + ticketUuid;
  adminTicketChatFeedback.textContent = "";
  adminTicketChatForm.dataset.ticketUuid = ticketUuid;

  // Función para cargar mensajes
  async function loadMessages() {
    adminTicketChatMessages.innerHTML = "<div class='loading'></div> Loading messages...";
    try {
      const res = await fetch(`/dashboard/utils/tickets/messages-admin/${ticketUuid}`);
      const result = await res.json();
      if (Array.isArray(result.messages)) {
        adminTicketChatMessages.innerHTML = "";
        result.messages.forEach((msg) => {
          const isAdmin =
            msg.user.role === "admin" ||
            msg.user.role === "developer" ||
            msg.user.role === "moderator" ||
            msg.user.role === "owner";
          adminTicketChatMessages.innerHTML += `
            <div class="chat-message" style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px; ${isAdmin ? "flex-direction:row-reverse;" : ""}">
              <div style="width:38px; height:38px; border-radius:50%; background:${isAdmin ? "var(--nebura-purple)" : "#43b581"}; display:flex; align-items:center; justify-content:center;">
                <img src="https://cdn.discordapp.com/avatars/${msg.user.discordId}/${msg.user.avatar}.png" alt="avatar" style="width:32px; height:32px; border-radius:50%; object-fit:cover;" />
              </div>
              <div style="flex:1;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-weight:600; color:${isAdmin ? "var(--nebura-purple)" : msg.user.roleColor};">${msg.user.name}</span>
                  <span style="font-size:11px; background:${isAdmin ? "var(--nebura-purple)" : msg.user.roleColor}; color:white; border-radius:4px; padding:2px 6px;">${msg.user.role}${isAdmin ? " (Admin)" : ""}</span>
                  <span style="font-size:11px; color:var(--text-secondary);">${msg.createdAt}</span>
                  <span style="font-size:11px; color:var(--nebura-magenta);">ID: ${msg.id}</span>
                </div>
                <div style="margin-top:2px; font-size:13px; background:${isAdmin ? "rgba(193,71,217,0.10)" : "rgba(67,181,129,0.10)"}; border-radius:6px; padding:6px 10px;">
                  ${msg.message}
                </div>
                ${msg.attachments?.length ? `<div style="margin-top:4px;">${msg.attachments.map((a) => `<a href="${a.url}" target="_blank" style="font-size:11px; color:var(--nebura-magenta); margin-right:8px;">File</a>`).join("")}</div>` : ""}
              </div>
            </div>
          `;
        });
      } else {
        adminTicketChatMessages.innerHTML =
          "<div style='text-align:center; color:var(--text-secondary); padding:12px;'>No messages in this ticket.</div>";
      }
    } catch {
      adminTicketChatMessages.innerHTML =
        "<div style='text-align:center; color:var(--text-secondary); padding:12px;'>Error loading messages.</div>";
    }
  }

  // Cargar mensajes al abrir
  await loadMessages();

  // Exponer función global para el botón de recarga
  window.adminReloadChat = loadMessages;
}

// Cerrar chat de ticket
function closeAdminTicketChat() {
  adminTicketChatModal.style.display = "none";
  if (chatReloadInterval) {
    clearInterval(chatReloadInterval);
    chatReloadInterval = null;
  }
}

function closeTicketHistoryModal() {
  adminTicketHistoryModal.style.display = "none";
}

// Enviar mensaje como admin
adminTicketChatForm?.addEventListener("submit", async function (e) {
  e.preventDefault();
  const ticketUuid = adminTicketChatForm.dataset.ticketUuid;
  const message = adminTicketChatForm.message.value;
  try {
    const userId = window.user?.uuid || ""; // Ajusta según tu sistema
    const res = await fetch(`/dashboard/utils/tickets/messages/send-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketUuid, message, userId }),
    });
    const result = await res.json();
    if (result.success) {
      adminTicketChatFeedback.textContent = "Message sent.";
      openAdminTicketChat(ticketUuid); // Recargar mensajes
      adminTicketChatForm.reset();
      setTimeout(() => (adminTicketChatFeedback.textContent = ""), 2000);
    } else {
      adminTicketChatFeedback.textContent = result.message || "Error sending message.";
    }
  } catch {
    adminTicketChatFeedback.textContent = "Network error.";
  }
});

// Inicialización
fetchTickets();

window.viewTicketDetails = viewTicketDetails;
window.editTicketModal = editTicketModal;
window.viewTicketHistory = viewTicketHistory;
window.closeTicketDetailsModal = closeTicketDetailsModal;
window.closeTicketHistoryModal = closeTicketHistoryModal;
window.openAdminTicketChat = openAdminTicketChat;
window.closeAdminTicketChat = closeAdminTicketChat;
fetchTickets();

window.viewTicketDetails = viewTicketDetails;
window.editTicketModal = editTicketModal;
window.viewTicketHistory = viewTicketHistory;
window.closeTicketDetailsModal = closeTicketDetailsModal;
window.closeTicketHistoryModal = closeTicketHistoryModal;
window.openAdminTicketChat = openAdminTicketChat;
window.closeAdminTicketChat = closeAdminTicketChat;

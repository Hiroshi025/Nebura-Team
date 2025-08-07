// Utilidades
function showFeedback(id, msg, type = "info") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.color = type === "error" ? "#ff6b9d" : "#43b581";
  setTimeout(() => {
    el.textContent = "";
  }, 4000);
}

// Crear Ticket
document.getElementById("ticketForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!window.user || !window.user.api || !window.user.api.uuid) {
    showFeedback("ticketChatFeedback", "No user session detected.", "error");
    return;
  }

  const form = e.target;
  const data = {
    title: form.title.value,
    description: form.description.value,
    category: form.category.value,
    priority: form.priority.value,
    links: form.links.value ? form.links.value.split(",").map((l) => l.trim()) : [],
    attachments: [], // Se puede implementar subida real de archivos si el backend lo soporta
    fields: {
      urgent: form.urgent.checked,
      evidence: form.evidence.checked,
    },
  };
  try {
    const res = await fetch("/dashboard/utils/tickets/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      showFeedback("ticketFormFeedback", "Ticket created successfully.", "success");
      setTimeout(() => window.location.reload(), 1200);
    } else {
      showFeedback("ticketFormFeedback", result.message || "Error creating ticket.", "error");
    }
  } catch (err) {
    showFeedback("ticketFormFeedback", "Network error.", "error");
  }
});

// Filtrar Tickets
document.getElementById("ticketFilterStatus")?.addEventListener("change", filterTickets);
document.getElementById("ticketFilterPriority")?.addEventListener("change", filterTickets);
document.getElementById("ticketFilterDate")?.addEventListener("change", filterTickets);

function filterTickets() {
  const status = document.getElementById("ticketFilterStatus").value;
  const priority = document.getElementById("ticketFilterPriority").value;
  const date = document.getElementById("ticketFilterDate").value;
  const tickets = Array.from(document.querySelectorAll("#userTicketsPanel .ticket-card"));
  tickets.forEach((card) => {
    let show = true;
    if (status && !card.innerHTML.includes(`ticket-status-${status}`)) show = false;
    if (priority && !card.innerHTML.includes(priority)) show = false;
    if (date && !card.innerHTML.includes(date)) show = false;
    card.style.display = show ? "" : "none";
  });
}

// Inicializa socket.io
window.socket = window.socket || io();
const socket = window.socket;

// ...existing code...

function closeTicketHistoryModal() {
  adminTicketHistoryModal.style.display = "none";
}

// Exponer la función globalmente
window.closeTicketHistoryModal = closeTicketHistoryModal;

// ...existing code...

// Abrir Chat de Ticket
window.openTicketChat = async function (ticketId) {
  if (!window.user || !window.user.api || !window.user.api.uuid) {
    showFeedback("ticketChatFeedback", "No user session detected.", "error");
    return;
  }

  document.getElementById("ticketChatModal").style.display = "block";
  document.getElementById("ticketChatTitle").textContent = "Ticket Chat";
  document.getElementById("ticketChatId").textContent = "#" + ticketId;
  document.getElementById("ticketChatFeedback").textContent = "";
  document.getElementById("ticketChatForm").dataset.ticketId = ticketId;

  // Función para cargar mensajes usando socket.io
  function loadMessages() {
    const userId = window.user?.api?.uuid || "";
    socket.emit("getMessages", { ticketId, userId });
  }

  // Escucha respuesta de mensajes
  socket.off("messages");
  socket.on("messages", function (result) {
    const messagesEl = document.getElementById("ticketChatMessages");
    if (Array.isArray(result.messages)) {
      messagesEl.innerHTML = "";
      result.messages.forEach((msg) => {
        messagesEl.innerHTML += `
          <div class="chat-message" style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px;">
            <img src="https://cdn.discordapp.com/avatars/${msg.user.discordId}/${msg.user.avatar}.png" alt="avatar" style="width:32px; height:32px; border-radius:50%; object-fit:cover;" />
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-weight:600; color:${msg.user.roleColor};">${msg.user.name}</span>
                <span style="font-size:11px; background:${msg.user.roleColor}; color:white; border-radius:4px; padding:2px 6px;">${msg.user.role}</span>
                <span style="font-size:11px; color:var(--text-secondary);">${msg.createdAt}</span>
                <span style="font-size:11px; color:var(--nebura-purple);">ID: ${msg.id}</span>
              </div>
              <div style="margin-top:2px; font-size:13px;">${msg.message}</div>
              ${msg.attachments?.length ? `<div style="margin-top:4px;">${msg.attachments.map((a) => `<a href="${a.url}" target="_blank" style="font-size:11px; color:var(--nebura-magenta); margin-right:8px;">File</a>`).join("")}</div>` : ""}
            </div>
          </div>
        `;
      });
    } else {
      messagesEl.innerHTML =
        "<div style='text-align:center; color:var(--text-secondary); padding:12px;'>No messages in this ticket.</div>";
    }
  });

  // Cargar mensajes al abrir
  loadMessages();

  // Actualización en tiempo real usando socket.io
  socket.off("messageSentRealtime");
  socket.on("messageSentRealtime", function (data) {
    // Depuración: muestra el id recibido
    // console.log("Realtime event:", data.ticketUuid, "local:", ticketId, window.currentTicketChatId);
    // Actualiza si coincide el id del ticket abierto (puede ser id o uuid)
    console.log(ticketId)
    if (data.ticketUuid === ticketId || data.ticketUuid === window.currentTicketChatId) {
      loadMessages();
    }
  });

  // Actualizar el chat también cuando el usuario envía un mensaje exitosamente
  socket.off("messageSent");
  socket.on("messageSent", function (result) {
    if (result.success) {
      showFeedback("ticketChatFeedback", "Message sent.", "success");
      // Actualiza el chat tras respuesta exitosa
      loadMessages();
    } else {
      showFeedback("ticketChatFeedback", result.message || "Error sending message.", "error");
    }
  });

  window.currentTicketChatId = ticketId;
  window.ticketReloadChat = loadMessages;
};

window.closeTicketChat = function () {
  document.getElementById("ticketChatModal").style.display = "none";
  // Elimina el setInterval
  if (window.ticketChatInterval) {
    clearInterval(window.ticketChatInterval);
    window.ticketChatInterval = null;
  }
  // Limpia el ticketId actual
  window.currentTicketChatId = null;
  // Elimina listeners de chat para evitar fugas de memoria
  socket.off("messageSentRealtime");
  socket.off("messageSent");
  socket.off("messages");
};

// Enviar mensaje al chat del ticket usando socket.io
document.getElementById("ticketChatForm").addEventListener("submit", function (e) {
  e.preventDefault();
  if (!window.user || !window.user.api || !window.user.api.uuid) {
    showFeedback("ticketChatFeedback", "No user session detected.", "error");
    return;
  }

  const form = e.target;
  const ticketId = form.dataset.ticketId;
  const message = form.message.value;
  socket.emit("sendMessage", {
    ticketId,
    message,
    userId: window.user.api.uuid || "",
  });

  // Limpiar el campo de mensaje inmediatamente
  this.message.value = "";
  // Ya no es necesario llamar a window.ticketReloadChat aquí, se actualiza por el evento
});

// Cerrar Ticket
window.closeTicket = async function (ticketId) {
  if (!confirm("Are you sure you want to close this ticket?")) return;
  try {
    const res = await fetch("/dashboard/utils/tickets/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticketId, status: "closed" }),
    });
    const result = await res.json();
    if (result.success) {
      showFeedback("ticketFormFeedback", "Ticket closed.", "success");
      setTimeout(() => window.location.reload(), 1200);
    } else {
      showFeedback("ticketFormFeedback", result.message || "Error closing ticket.", "error");
    }
  } catch {
    showFeedback("ticketFormFeedback", "Network error.", "error");
  }
};

// Mostrar detalles del ticket seleccionado
window.selectTicket = function (ticketId) {
  // Buscar el ticket en la lista renderizada (puedes mejorar esto si tienes los datos en JS)
  const rows = document.querySelectorAll(".ticket-row");
  let ticketData = null;
  rows.forEach((row) => {
    if (row.getAttribute("onclick")?.includes(ticketId)) {
      // Extraer datos de las celdas
      const cells = row.querySelectorAll("td");
      ticketData = {
        id: cells[0].textContent,
        title: cells[1].textContent,
        category: cells[2].textContent,
        priority: cells[3].textContent,
        status: cells[4].textContent.trim(),
        createdAt: cells[5].textContent,
        updatedAt: cells[6].textContent,
      };
      // Marcar fila seleccionada
      rows.forEach((r) => r.classList.remove("selected-ticket-row"));
      row.classList.add("selected-ticket-row");
    }
  });
  if (!ticketData) return;
  // Renderizar detalles
  const panel = document.getElementById("ticketDetailsPanel");
  panel.style.display = "block";
  panel.innerHTML = `
    <div class="ticket-details-card-inner">
      <div class="ticket-details-header">
        <div class="ticket-details-title">
          <span style="color:var(--nebura-purple); font-weight:700;">Ticket #${ticketData.id}</span>
          <span style="font-size:13px; color:var(--text-secondary); margin-left:12px;">${ticketData.title}</span>
        </div>
        <span class="ticket-status ticket-status-${ticketData.status}" style="font-size:13px; font-weight:600; padding:4px 10px; border-radius:12px; background:var(--accent-bg); margin-left:auto;">
          ${ticketData.status}
        </span>
      </div>
      <div class="ticket-details-grid">
        <div class="ticket-detail">
          <div class="ticket-detail-label">Category</div>
          <div class="ticket-detail-value">${ticketData.category}</div>
        </div>
        <div class="ticket-detail">
          <div class="ticket-detail-label">Priority</div>
          <div class="ticket-detail-value" style="color:${ticketData.priority === "critical" ? "#ff6b9d" : "var(--nebura-purple)"}; font-weight:600;">
            ${ticketData.priority}
          </div>
        </div>
        <div class="ticket-detail">
          <div class="ticket-detail-label">Created</div>
          <div class="ticket-detail-value">${ticketData.createdAt}</div>
        </div>
        <div class="ticket-detail">
          <div class="ticket-detail-label">Last Update</div>
          <div class="ticket-detail-value">${ticketData.updatedAt}</div>
        </div>
      </div>
      <div class="ticket-details-actions" style="display:flex; gap:12px; margin-top:18px;">
        ${ticketData.status !== "closed" ? `<button class="run-btn" onclick="openTicketChat('${ticketData.id}')">Open Chat</button>` : ""}
        ${ticketData.status !== "closed" ? `<button class="run-btn" style="background:var(--nebura-magenta);" onclick="closeTicket('${ticketData.id}')">Close Ticket</button>` : ""}
      </div>
    </div>
  `;
};

// ...existing code...

async function fetchNotifications() {
  try {
    const res = await fetch('/dashboard/utils/get-notifications');
    if (!res.ok) return [];
    const data = await res.json();
    // Filtrar expiradas y tomar las 3 más recientes
    const now = Date.now();
    return data
      .filter(n => !n.expiresAt || new Date(n.expiresAt).getTime() > now)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  } catch {
    return [];
  }
}

function getNotificationIcon(type) {
  switch (type) {
    case 'success':
      return '<svg width="20" height="20" fill="#00ff88"><circle cx="10" cy="10" r="10"/><text x="10" y="15" text-anchor="middle" font-size="14" fill="#fff">&#10003;</text></svg>';
    case 'warning':
      return '<svg width="20" height="20" fill="#faa61a"><circle cx="10" cy="10" r="10"/><text x="10" y="15" text-anchor="middle" font-size="14" fill="#fff">!</text></svg>';
    case 'error':
      return '<svg width="20" height="20" fill="#ff4d4f"><circle cx="10" cy="10" r="10"/><text x="10" y="15" text-anchor="middle" font-size="14" fill="#fff">×</text></svg>';
    default:
      return '<svg width="20" height="20" fill="#6c5ce7"><circle cx="10" cy="10" r="10"/><text x="10" y="15" text-anchor="middle" font-size="14" fill="#fff">i</text></svg>';
  }
}

function renderNotifications(notifications) {
  const container = document.getElementById('dashboardNotifications');
  if (!container) return;
  container.innerHTML = '';
  notifications.forEach(n => {
    const card = document.createElement('div');
    card.className = `notification-card ${n.type}`;
    card.innerHTML = `
      <span class="notification-icon">${getNotificationIcon(n.type)}</span>
      <span>${n.message}</span>
      <button class="close-btn" title="Cerrar">&times;</button>
    `;
    // Cerrar manualmente
    card.querySelector('.close-btn').onclick = () => {
      card.remove();
    };
    container.appendChild(card);
  });
}

// Inicializar y actualizar cada hora
async function updateNotifications() {
  const notifications = await fetchNotifications();
  renderNotifications(notifications);
}
document.addEventListener('DOMContentLoaded', updateNotifications);
setInterval(updateNotifications, 3600 * 1000); // Cada 1 hora

// ...existing code...
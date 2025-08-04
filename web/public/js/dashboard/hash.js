function showPage(pageId) {
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });
  const section = document.getElementById(pageId);
  if (section) section.classList.add('active');
}

// Navegación por sidebar
document.querySelectorAll('.nav-link[data-page]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const pageId = this.getAttribute('data-page');
    window.location.hash = pageId;
    showPage(pageId);
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// Mostrar la sección según el hash al cargar
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    showPage(hash);
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-page') === hash);
    });
  } else {
    showPage('dashboard');
  }
});

// Cambiar de sección si el hash cambia manualmente
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  showPage(hash);
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-page') === hash);
  });
});
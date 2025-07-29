(function () {
  const canvas = document.getElementById("animated-bg");
  const ctx = canvas.getContext("2d");
  let particles = [];
  const PARTICLE_COUNT = 60;
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();
  function randomColor() {
    return `rgba(${120 + Math.random() * 100},${120 + Math.random() * 100},${200 + Math.random() * 55},0.15)`;
  }
  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1 + Math.random() * 2.5,
        dx: -0.5 + Math.random(),
        dy: -0.5 + Math.random(),
        color: randomColor(),
      });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    // líneas entre partículas cercanas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i],
          b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.strokeStyle = "rgba(99,102,241,0.08)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }
  function update() {
    for (let p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    }
  }
  function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
  }
  createParticles();
  animate();
  window.addEventListener("resize", createParticles);
})();

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const themeToggle = document.getElementById("themeToggle");
  const languageSelector = document.getElementById("languageSelector");
  const apiUrlElement = document.getElementById("apiUrl");
  const licenseKeyInput = document.getElementById("licenseKey");
  const identifierInput = document.getElementById("identifier");
  const headersContainer = document.getElementById("headersContainer");
  const addHeaderBtn = document.getElementById("addHeaderBtn");
  const sendRequestBtn = document.getElementById("sendRequestBtn");
  const clearResponseBtn = document.getElementById("clearResponseBtn");
  const copyUrlBtn = document.getElementById("copyUrlBtn");
  const responsePretty = document.getElementById("responsePretty");
  const responsePrettyCode = responsePretty.querySelector("code.json");
  const responseRaw = document.getElementById("responseRaw");
  const responseHeaders = document.getElementById("responseHeaders");
  const responseStatus = document.getElementById("responseStatus");
  const responseContainer = document.getElementById("responseContainer");
  const copyResponseBtn = document.getElementById("copyResponseBtn");
  const expandResponseBtn = document.getElementById("expandResponseBtn");
  const licenseKeyError = document.getElementById("licenseKeyError");
  const identifierError = document.getElementById("identifierError");

  const responseTabs = document.querySelectorAll(".response-tab");

  // State
  let baseUrl = "";
  let currentTheme = localStorage.getItem("theme") || "dark";
  let currentLanguage = localStorage.getItem("language") || "es";

  // Traducciones multilenguaje
  const translations = {
    en: {
      title: "License Validation",
      history: "History",
      apiEndpoint: "API Endpoint",
      copyToClipboard: "Copy to clipboard",
      copied: "Copied!",
      method: "GET",
      requestParams: "Request Parameters",
      licenseKey: "License Key",
      licenseKeyPlaceholder: "Enter license key",
      identifier: "Identifier",
      identifierPlaceholder: "Enter unique identifier",
      headers: "Headers",
      addHeader: "Add Header",
      response: "Response",
      clear: "Clear",
      send: "Send Request",
      pretty: "Pretty",
      raw: "Raw",
      headersTab: "Headers",
      noHistory: "No history yet",
      requiredLicenseKey: 'The "License Key" field is required.',
      requiredIdentifier: 'The "Identifier" field is required.',
      requiredFields: "Please complete the required fields.",
      noHeaders: "No headers available",
      serverDown: "No response from server",
      networkError: "Network error or server not responding.",
      documentation: "API Documentation",
      endpoint: "Endpoint",
      parameters: "Parameters",
      required: "required",
      paramKeyDesc: "License key",
      paramIdentifierDesc: "Unique identifier",
      exampleRequest: "Example Request",
      exampleResponse: "Example Response",
      tip: "Tip: You can use tools like Postman, Hoppscotch or Swagger to test this endpoint.",
    },
    es: {
      title: "Playground de Validación",
      history: "Historial",
      apiEndpoint: "Punto de acceso API",
      copyToClipboard: "Copiar al portapapeles",
      copied: "¡Copiado!",
      method: "GET",
      requestParams: "Parámetros de la petición",
      licenseKey: "Clave de licencia",
      licenseKeyPlaceholder: "Introduce la clave de licencia",
      identifier: "Identificador",
      identifierPlaceholder: "Introduce un identificador único",
      headers: "Encabezados",
      addHeader: "Agregar encabezado",
      response: "Respuesta",
      clear: "Limpiar",
      send: "Enviar petición",
      pretty: "Bonito",
      raw: "Crudo",
      headersTab: "Encabezados",
      noHistory: "Sin historial",
      requiredLicenseKey: 'El campo "Clave de licencia" es obligatorio.',
      requiredIdentifier: 'El campo "Identificador" es obligatorio.',
      requiredFields: "Por favor completa los campos requeridos.",
      noHeaders: "No hay encabezados disponibles",
      serverDown: "Sin respuesta del servidor",
      networkError: "Error de red o el servidor no responde.",
      documentation: "Documentación de la API",
      endpoint: "Endpoint",
      parameters: "Parámetros",
      required: "requerido",
      paramKeyDesc: "Clave de licencia",
      paramIdentifierDesc: "Identificador único",
      exampleRequest: "Ejemplo de petición",
      exampleResponse: "Ejemplo de respuesta",
      tip: "Tip: Puedes usar herramientas como Postman, Hoppscotch o Swagger para probar este endpoint.",
    },
    fr: {
      title: "Bac à sable de validation",
      history: "Historique",
      apiEndpoint: "Point d'accès API",
      copyToClipboard: "Copier dans le presse-papiers",
      copied: "Copié !",
      method: "GET",
      requestParams: "Paramètres de la requête",
      licenseKey: "Clé de licence",
      licenseKeyPlaceholder: "Entrez la clé de licence",
      identifier: "Identifiant",
      identifierPlaceholder: "Entrez un identifiant unique",
      headers: "En-têtes",
      addHeader: "Ajouter un en-tête",
      response: "Réponse",
      clear: "Effacer",
      send: "Envoyer la requête",
      pretty: "Joli",
      raw: "Brut",
      headersTab: "En-têtes",
      noHistory: "Aucun historique",
      requiredLicenseKey: 'Le champ "Clé de licence" est requis.',
      requiredIdentifier: 'Le champ "Identifiant" est requis.',
      requiredFields: "Veuillez compléter les champs obligatoires.",
      noHeaders: "Aucun en-tête disponible",
      serverDown: "Pas de réponse du serveur",
      networkError: "Erreur réseau ou serveur injoignable.",
      documentation: "Documentation de l'API",
      endpoint: "Endpoint",
      parameters: "Paramètres",
      required: "requis",
      paramKeyDesc: "Clé de licence",
      paramIdentifierDesc: "Identifiant unique",
      exampleRequest: "Exemple de requête",
      exampleResponse: "Exemple de réponse",
      tip: "Astuce : Vous pouvez utiliser des outils comme Postman, Hoppscotch ou Swagger pour tester ce endpoint.",
    },
  };

  // Initialize
  initTheme();
  initLanguage();
  detectBaseUrl();

  // Event Listeners
  themeToggle.addEventListener("click", toggleTheme);
  languageSelector.addEventListener("change", changeLanguage);
  licenseKeyInput.addEventListener("input", updateApiUrl);
  identifierInput.addEventListener("input", updateApiUrl);
  addHeaderBtn.addEventListener("click", addHeaderRow);
  headersContainer.addEventListener("click", handleHeaderContainerClick);
  sendRequestBtn.addEventListener("click", sendRequest);
  clearResponseBtn.addEventListener("click", clearResponse);
  copyUrlBtn.addEventListener("click", copyApiUrl);
  responseTabs.forEach((tab) => tab.addEventListener("click", switchTab));

  // Functions
  function initTheme() {
    document.documentElement.setAttribute("data-theme", currentTheme);
    if (currentTheme === "dark") {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  function toggleTheme() {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);

    if (currentTheme === "dark") {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  function updateLanguageUI() {
    const t = translations[currentLanguage];
    document.getElementById("titleText").textContent = t.title;
    document.getElementById("historyText").textContent = t.history;
    document.getElementById("apiEndpointText").textContent = t.apiEndpoint;
    document.getElementById("copyTooltipText").textContent = t.copyToClipboard;
    document.getElementById("methodText").textContent = t.method;
    document.getElementById("requestParamsText").textContent = t.requestParams;
    document.getElementById("licenseKeyLabel").textContent = t.licenseKey;
    licenseKeyInput.placeholder = t.licenseKeyPlaceholder;
    document.getElementById("identifierLabel").textContent = t.identifier;
    identifierInput.placeholder = t.identifierPlaceholder;
    document.getElementById("headersText").textContent = t.headers;
    document.getElementById("addHeaderBtnText").textContent = t.addHeader;
    document.getElementById("responseText").textContent = t.response;
    document.getElementById("clearBtnText").textContent = t.clear;
    document.getElementById("sendBtnText").textContent = t.send;
    document.getElementById("prettyTabText").textContent = t.pretty;
    document.getElementById("rawTabText").textContent = t.raw;
    document.getElementById("headersTabText").textContent = t.headersTab;
    // Documentación multilenguaje
    document.getElementById("documentationTitle").textContent = t.documentation;
    document.getElementById("endpointTitle").textContent = t.endpoint;
    document.getElementById("parametersTitle").textContent = t.parameters;
    document.getElementById("paramKeyDesc").textContent = t.paramKeyDesc;
    document.getElementById("paramIdentifierDesc").textContent = t.paramIdentifierDesc;
    document.getElementById("requiredText").textContent = t.required;
    document.getElementById("requiredText2").textContent = t.required;
    document.getElementById("exampleRequestTitle").textContent = t.exampleRequest;
    document.getElementById("exampleRequestText").innerHTML =
      `GET <span style="color:var(--primary-light)">/api/v1/validate-licence?key=YOUR_KEY&identifier=YOUR_ID</span>`;
    // Eliminar o comentar la siguiente línea porque no existe el elemento:
    // document.getElementById("exampleResponseTitle").textContent = t.exampleResponse;
    document.getElementById("tipText").textContent = t.tip;
  }

  function initLanguage() {
    languageSelector.value = currentLanguage;
    updateLanguageUI();
  }

  function changeLanguage() {
    currentLanguage = languageSelector.value;
    localStorage.setItem("language", currentLanguage);
    updateLanguageUI();
  }

  function detectBaseUrl() {
    // Get current host and protocol
    const host = window.location.host;
    const protocol = window.location.protocol;
    baseUrl = `${protocol}//${host}/api/v1`;
    apiUrlElement.textContent = `${baseUrl}/validate-licence`;
  }

  function updateApiUrl() {
    const key = licenseKeyInput.value.trim();
    const identifier = identifierInput.value.trim();

    let queryParams = [];
    if (key) queryParams.push(`key=${encodeURIComponent(key)}`);
    if (identifier) queryParams.push(`identifier=${encodeURIComponent(identifier)}`);

    const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    apiUrlElement.textContent = `${baseUrl}/validate-licence${queryString}`;
  }

  function addHeaderRow() {
    const headerRow = document.createElement("div");
    headerRow.className = "header-row";
    headerRow.innerHTML = `
                    <input type="text" class="form-control header-input" placeholder="Header name">
                    <input type="text" class="form-control header-input" placeholder="Header value">
                    <button class="btn btn-outline btn-sm remove-header-btn">
                        <i class="fas fa-times"></i>
                    </button>
                `;
    headersContainer.appendChild(headerRow);
  }

  function handleHeaderContainerClick(e) {
    if (e.target.closest(".remove-header-btn")) {
      const headerRow = e.target.closest(".header-row");
      if (headersContainer.children.length > 1) {
        headerRow.remove();
      } else {
        // Clear inputs if it's the last row
        const inputs = headerRow.querySelectorAll("input");
        inputs.forEach((input) => (input.value = ""));
      }
    }
  }

  async function sendRequest() {
    // Limpiar errores previos
    licenseKeyError.style.display = "none";
    identifierError.style.display = "none";
    licenseKeyInput.classList.remove("input-error");
    identifierInput.classList.remove("input-error");

    const t = translations[currentLanguage];
    const key = licenseKeyInput.value.trim();
    const identifier = identifierInput.value.trim();

    let hasError = false;
    if (!key) {
      licenseKeyError.textContent = t.requiredLicenseKey;
      licenseKeyError.style.display = "block";
      licenseKeyInput.classList.add("input-error");
      hasError = true;
    }
    if (!identifier) {
      identifierError.textContent = t.requiredIdentifier;
      identifierError.style.display = "block";
      identifierInput.classList.add("input-error");
      hasError = true;
    }
    if (hasError) {
      showResponse({ error: t.requiredFields }, null, 400);
      return;
    }

    // Prepare URL
    const url = `${baseUrl}/validate-licence?key=${encodeURIComponent(key)}&identifier=${encodeURIComponent(identifier)}`;

    // Prepare headers
    const headers = {};
    const headerRows = headersContainer.querySelectorAll(".header-row");
    headerRows.forEach((row) => {
      const nameInput = row.querySelector("input:nth-child(1)");
      const valueInput = row.querySelector("input:nth-child(2)");
      if (nameInput.value.trim() && valueInput.value.trim()) {
        headers[nameInput.value.trim()] = valueInput.value.trim();
      }
    });

    // Show loading state
    sendRequestBtn.innerHTML = `<div class="loading"></div> ${t.send}`;
    sendRequestBtn.disabled = true;

    try {
      const startTime = performance.now();
      let response,
        responseData,
        responseHeaders = {};
      try {
        response = await fetch(url, { headers });
      } catch (networkErr) {
        // Error de red real (no HTTP)
        showResponse({ error: t.networkError }, null, 0);
        return;
      }
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // Intenta parsear JSON, si no es posible muestra texto plano
      let isJson = false;
      try {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          responseData = await response.json();
          isJson = true;
        } else {
          responseData = await response.text();
        }
      } catch {
        responseData = await response.text();
      }
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      showResponse(responseData, responseHeaders, response.status, responseTime);
    } catch (error) {
      let msg = t.networkError;
      if (error && error.message) {
        msg += ` ${error.message}`;
      }
      showResponse({ error: msg }, null, 0);
    } finally {
      sendRequestBtn.innerHTML = `<i class="fas fa-paper-plane"></i> ${t.send}`;
      sendRequestBtn.disabled = false;
    }
  }

  function getStatusClass(status) {
    if (status >= 200 && status < 300) return "status-200";
    if (status === 404) return "status-404";
    return "status-400";
  }

  function showResponse(data, headers, status, responseTime = null) {
    const t = translations[currentLanguage];
    clearResponse(false);

    responseStatus.classList.remove("hidden");
    if (status === 0) {
      responseStatus.textContent = t.serverDown;
      responseStatus.className = `status-indicator status-400`;
    } else {
      responseStatus.textContent = `Status: ${status}${responseTime ? ` • ${responseTime}ms` : ""}`;
      responseStatus.className = `status-indicator ${getStatusClass(status)}`;
    }

    // Pretty print JSON si es posible, si no muestra texto plano
    let pretty = "";
    if (typeof data === "object") {
      try {
        pretty = JSON.stringify(data, null, 2);
      } catch {
        pretty = String(data);
      }
    } else {
      pretty = String(data);
    }
    responsePrettyCode.textContent = pretty;
    if (window.hljs) hljs.highlightElement(responsePrettyCode);

    // Raw response
    if (typeof data === "object") {
      responseRaw.textContent = JSON.stringify(data);
    } else {
      responseRaw.textContent = String(data);
    }

    // Response headers
    if (headers) {
      responseHeaders.textContent = JSON.stringify(headers, null, 2);
    } else {
      responseHeaders.textContent = t.noHeaders;
    }
  }

  function clearResponse(hideStatus = true) {
    responsePrettyCode.textContent = "";
    responseRaw.textContent = "";
    responseHeaders.textContent = "";
    if (hideStatus) {
      responseStatus.classList.add("hidden");
      responseStatus.textContent = "";
    }
  }

  function copyApiUrl() {
    const url = apiUrlElement.textContent;
    navigator.clipboard.writeText(url);
    copyUrlBtn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
      copyUrlBtn.innerHTML = '<i class="far fa-copy"></i>';
    }, 1500);
  }

  function copyResponse() {
    let content = "";
    if (!responsePretty.parentElement.classList.contains("hidden")) {
      content = responsePrettyCode.textContent;
    } else if (!responseRaw.classList.contains("hidden")) {
      content = responseRaw.textContent;
    } else if (!responseHeaders.classList.contains("hidden")) {
      content = responseHeaders.textContent;
    }
    navigator.clipboard.writeText(content);
    copyResponseBtn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
      copyResponseBtn.innerHTML = '<i class="far fa-copy"></i>';
    }, 1500);
  }

  function toggleExpandResponse() {
    responseContainer.classList.toggle("expanded");
    expandResponseBtn.innerHTML = responseContainer.classList.contains("expanded")
      ? '<i class="fas fa-compress"></i>'
      : '<i class="fas fa-expand"></i>';
  }

  function testConnection() {
    const url = apiUrlElement.textContent;
    testConnectionBtn.innerHTML = '<div class="loading"></div>';
    fetch(url, { method: "OPTIONS" })
      .then((res) => {
        testConnectionBtn.innerHTML = '<i class="fas fa-plug"></i>';
        if (res.ok) {
          responseStatus.textContent = "Conexión exitosa";
          responseStatus.className = "status-indicator status-200";
        } else {
          responseStatus.textContent = "Conexión fallida";
          responseStatus.className = "status-indicator status-400";
        }
      })
      .catch(() => {
        testConnectionBtn.innerHTML = '<i class="fas fa-plug"></i>';
        responseStatus.textContent = "Conexión fallida";
        responseStatus.className = "status-indicator status-400";
      });
  }

  // --- ELIMINADO: Funciones y eventos de historial y colecciones ---
  // document.addEventListener("click", closeHistoryDropdown);
  // document.addEventListener("keydown", function (e) {
  //   if (e.key === "Escape") {
  //     historyDropdown.classList.remove("show");
  //   }
  // });

  // Initialize API URL
  detectBaseUrl();
  // Update API URL on initial load
  updateApiUrl();
  apiUrlElement.href = `${baseUrl}/validate-licence`;
  apiUrlElement.textContent = `${baseUrl}/validate-licence`;

  // Estilos para expandir área de respuesta
  // (puedes mover esto a tu CSS si prefieres)
  const style = document.createElement("style");
  style.innerHTML = `
    .response-container.expanded {
      position: fixed !important;
      top: 5vh; left: 5vw; right: 5vw; bottom: 5vh;
      background: var(--bg-secondary);
      z-index: 1000;
      max-width: unset;
      max-height: unset;
      width: 90vw;
      height: 90vh;
      box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
      padding: 2rem;
    }
    .modal {
      position: fixed; top:0; left:0; width:100vw; height:100vh;
      background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;
    }
    .modal.hidden { display: none; }
    .modal-content {
      background: var(--bg-primary); color: var(--text-primary);
      padding: 2rem; border-radius: 8px; min-width: 300px; max-width: 90vw;
      position: relative;
    }
    .modal-content .close {
      position: absolute; top: 1rem; right: 1rem; cursor: pointer; font-size: 1.5rem;
    }
    .collection-item {
      border-bottom: 1px solid var(--border-color); padding: 1rem 0;
    }
  `;
  document.head.appendChild(style);

  function switchTab(e) {
    const tab = e.target;
    if (!tab.classList.contains("response-tab")) return;
    responseTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    // Oculta todos los contenidos
    responsePretty.classList.add("hidden");
    responseRaw.classList.add("hidden");
    responseHeaders.classList.add("hidden");
    // Muestra el contenido correspondiente
    if (tab.dataset.tab === "pretty") {
      responsePretty.classList.remove("hidden");
    } else if (tab.dataset.tab === "raw") {
      responseRaw.classList.remove("hidden");
    } else if (tab.dataset.tab === "headers") {
      responseHeaders.classList.remove("hidden");
    }
  }
});

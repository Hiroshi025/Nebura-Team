// ...particles animation...
function createParticles() {
  const particlesContainer = document.getElementById("particles");
  if (!particlesContainer) return;
  particlesContainer.innerHTML = "";
  const particleCount = 28;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    const posX = Math.random() * 100;
    const delay = Math.random() * 18;
    particle.style.left = posX + "%";
    particle.style.bottom = "-10px";
    particle.style.animationDelay = delay + "s";
    const size = 2 + Math.random() * 6;
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    const opacity = 0.12 + Math.random() * 0.25;
    particle.style.opacity = opacity;
    particlesContainer.appendChild(particle);
  }
}
createParticles();
window.addEventListener("resize", createParticles);

// Esperar a que el DOM esté listo
window.onload = function () {
  // Alternar entre Social Auth y API Login/Register
  let isApiMode = false;
  const toggleModeBtn = document.getElementById("toggleModeBtn");
  const socialLoginBox = document.getElementById("socialLoginBox");
  const authForm = document.getElementById("authForm");
  const apiTokenBox = document.getElementById("apiTokenBox");
  const authTitle = document.getElementById("authTitle");
  const toggleText = document.getElementById("toggleText");
  const toggleAuthBtn = document.getElementById("toggleAuthBtn");
  const nameGroup = document.getElementById("nameGroup");
  const submitBtn = document.getElementById("submitBtn");
  const passwordInput = document.getElementById("passwordInput");
  const showPassBtn = document.getElementById("showPassBtn");
  const showPassIcon = document.getElementById("showPassIcon");
  const strengthBar = document.getElementById("strengthBar");
  const strengthLabelSpan = document.getElementById("strengthLabel");
  const genPassBtn = document.getElementById("genPassBtn");
  const discordBtn = document.getElementById("discordBtn");
  const githubBtn = document.getElementById("githubBtn");
  const googleBtn = document.getElementById("googleBtn");
  const tokenValue = document.getElementById("tokenValue");
  const copyTokenBtn = document.getElementById("copyTokenBtn");
  const copyFeedback = document.getElementById("copyFeedback");

  // Estado para login/register
  const isRegister = { value: false };

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  if (mode === "api") {
    isApiMode = true;
    socialLoginBox.style.display = "none";
    toggleModeBtn.textContent = "Switch to Social Auth";
    apiTokenBox.style.display = "none";
  } else if (mode === "social") {
    isApiMode = false;
    socialLoginBox.style.display = "";
    toggleModeBtn.textContent = "Switch to API Auth";
    apiTokenBox.style.display = "none";
  }

  // Alternar modo API/Social
  toggleModeBtn.onclick = function () {
    isApiMode = !isApiMode;
    socialLoginBox.style.display = isApiMode ? "none" : "";
    toggleModeBtn.textContent = isApiMode ? "Switch to Social Auth" : "Switch to API Auth";
    hideAlert();
    authForm.reset();
    strengthBar.style.width = "0";
    strengthLabelSpan.textContent = "";
    nameGroup.style.display = isRegister.value ? "" : "none";
    apiTokenBox.style.display = "none";
  };

  // Auth toggle (login/register)
  toggleAuthBtn.onclick = function () {
    isRegister.value = !isRegister.value;
    if (isRegister.value) {
      authTitle.textContent = "Create Account";
      toggleText.textContent = "Already have an account?";
      toggleAuthBtn.textContent = "Sign In";
      nameGroup.style.display = "";
      submitBtn.textContent = "Register";
    } else {
      authTitle.textContent = "Sign In";
      toggleText.textContent = "Don't have an account?";
      toggleAuthBtn.textContent = "Register";
      nameGroup.style.display = "none";
      submitBtn.textContent = "Sign In";
    }
    authForm.reset();
    strengthBar.style.width = "0";
    strengthLabelSpan.textContent = "";
    hideAlert();
  };

  // Mostrar/ocultar contraseña
  let passVisible = false;
  showPassBtn.onclick = function () {
    passVisible = !passVisible;
    passwordInput.type = passVisible ? "text" : "password";
    showPassIcon.textContent = passVisible ? "visibility" : "visibility_off";
  };

  // Email validation
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Generador de contraseñas configurable
  function generatePassword() {
    const upper = document.getElementById("optUpper").checked;
    const lower = document.getElementById("optLower").checked;
    const number = document.getElementById("optNumber").checked;
    const symbol = document.getElementById("optSymbol").checked;
    let length = parseInt(document.getElementById("optLength").value, 10);
    if (isNaN(length) || length < 6) length = 6;
    if (length > 32) length = 32;
    let chars = "";
    if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (number) chars += "0123456789";
    if (symbol) chars += "!@#$%^&*()-_=+[]{};:,.<>/?";
    if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";
    let pw = "";
    let pools = [];
    if (upper) pools.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    if (lower) pools.push("abcdefghijklmnopqrstuvwxyz");
    if (number) pools.push("0123456789");
    if (symbol) pools.push("!@#$%^&*()-_=+[]{};:,.<>/?");
    for (let i = 0; i < pools.length && i < length; i++) {
      pw += pools[i][Math.floor(Math.random() * pools[i].length)];
    }
    for (let i = pw.length; i < length; i++) {
      pw += chars[Math.floor(Math.random() * chars.length)];
    }
    return pw
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  // Indicador de nivel de contraseña
  function getPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    return score;
  }
  function strengthLabel(score, pw) {
    if (!pw) return { label: "", color: "#888", width: "0%", desc: "" };
    if (score <= 2) return { label: "Weak", color: "#ff6b6b", width: "20%", desc: "Very easy to guess" };
    if (score <= 4) return { label: "Fair", color: "#ffc107", width: "50%", desc: "Could be stronger, use more variety" };
    if (score <= 6) return { label: "Strong", color: "#4caf50", width: "80%", desc: "Good password" };
    return { label: "Very strong", color: "#00ff88", width: "100%", desc: "Excellent security" };
  }

  // Password input events
  passwordInput.addEventListener("input", function () {
    const val = passwordInput.value;
    const score = getPasswordStrength(val);
    const s = strengthLabel(score, val);
    strengthBar.style.width = s.width;
    strengthBar.style.background = s.color;
    strengthLabelSpan.innerHTML = val ? `<b>${s.label}</b> <span style="font-size:11px;">${s.desc}</span>` : "";
    strengthLabelSpan.style.color = s.color;
  });

  // Password generator
  genPassBtn.onclick = function () {
    const pw = generatePassword();
    passwordInput.value = pw;
    passwordInput.dispatchEvent(new Event("input"));
  };

  // Mostrar alertas mejoradas
  function showAlert(msg, type = "info") {
    const alertBox = document.getElementById("alertBox");
    let color = "#2196f3",
      icon = "info";
    if (type === "success") {
      color = "#4caf50";
      icon = "check_circle";
    }
    if (type === "error") {
      color = "#e91e63";
      icon = "error";
    }
    alertBox.innerHTML = `<span class="material-symbols-outlined" style="vertical-align:middle; color:${color}; font-size:18px; margin-right:6px;">${icon}</span> <span style="color:${color}; font-weight:600;">${msg}</span>`;
    alertBox.style.display = "block";
    alertBox.style.borderColor = color;
    alertBox.style.background = type === "error" ? "rgba(233,30,99,0.08)" : "rgba(76,175,80,0.08)";
  }
  function hideAlert() {
    document.getElementById("alertBox").style.display = "none";
    apiTokenBox.style.display = "none";
  }

  // Copiar token al portapapeles
  if (copyTokenBtn) {
    copyTokenBtn.onclick = function () {
      navigator.clipboard.writeText(tokenValue.textContent || "").then(() => {
        copyFeedback.style.display = "inline";
        setTimeout(() => {
          copyFeedback.style.display = "none";
        }, 1200);
      });
    };
  }

  // API Auth: Validación y submit usando endpoints
  async function apiRegister(name, email, password) {
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert("Registration successful!", "success");
      } else {
        showAlert(data.message || "Registration failed.", "error");
      }
    } catch (err) {
      showAlert("Registration error.", "error");
    }
  }
  async function apiLogin(email, password) {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.data && data.data.token) {
        showAlert("Login successful!", "success");
        apiTokenBox.style.display = "block";
        tokenValue.textContent = data.data.token;
      } else {
        showAlert(data.message || "Login failed.", "error");
        apiTokenBox.style.display = "none";
      }
    } catch (err) {
      showAlert("Login error.", "error");
      apiTokenBox.style.display = "none";
    }
  }
  authForm.onsubmit = function (e) {
    e.preventDefault();
    hideAlert();
    const email = document.getElementById("emailInput").value.trim();
    const password = passwordInput.value;
    if (!isValidEmail(email)) {
      showAlert("Please enter a valid email.");
      return false;
    }
    if (isRegister.value) {
      const name = document.getElementById("nameInput").value.trim();
      if (!name) {
        showAlert("Name is required.");
        return false;
      }
      if (getPasswordStrength(password) < 3) {
        showAlert("Password is too weak.");
        return false;
      }
      apiRegister(name, email, password);
    } else {
      if (!password) {
        showAlert("Password is required.");
        return false;
      }
      apiLogin(email, password);
    }
    return false;
  };

  // Social buttons (demo)
  discordBtn.onclick = function () {
    window.location.href = "/auth/discord/login";
  };
  githubBtn.onclick = function () {
    showAlert("Demo: GitHub login not implemented.");
  };
  googleBtn.onclick = function () {
    showAlert("Demo: Google login not implemented.");
  };
};

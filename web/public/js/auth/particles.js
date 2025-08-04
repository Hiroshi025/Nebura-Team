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

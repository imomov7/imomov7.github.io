const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");
const icon = themeButton.querySelector(".theme-icon");

function setTheme(theme) {
  const light = theme === "light";
  root.dataset.theme = light ? "light" : "dark";
  const label = light ? "Switch to dark theme" : "Switch to light theme";
  themeButton.setAttribute("aria-label", label);
  themeButton.title = label;
  icon.textContent = light ? "☾" : "☼";
  document.querySelector('meta[name="theme-color"]').content = light ? "#f4f5ed" : "#101210";
}

try {
  setTheme(localStorage.getItem("abdullo-portfolio-theme"));
} catch {
  setTheme("dark");
}

themeButton.addEventListener("click", () => {
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(theme);
  try {
    localStorage.setItem("abdullo-portfolio-theme", theme);
  } catch {
    // The toggle still works if browser storage is disabled.
  }
});

const tablist = document.querySelector(".preview-tabs");
const tabs = [...tablist.querySelectorAll('[role="tab"]')];
const narrow = matchMedia("(max-width: 600px)");

function updateTabOrientation() {
  tablist.setAttribute("aria-orientation", narrow.matches ? "horizontal" : "vertical");
}

updateTabOrientation();
narrow.addEventListener("change", updateTabOrientation);

function activateTab(selected) {
  tabs.forEach((tab) => {
    const active = tab === selected;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", (event) => {
    const backward = narrow.matches ? "ArrowLeft" : "ArrowUp";
    const forward = narrow.matches ? "ArrowRight" : "ArrowDown";
    let nextIndex;
    switch (event.key) {
      case backward: nextIndex = (index + tabs.length - 1) % tabs.length; break;
      case forward: nextIndex = (index + 1) % tabs.length; break;
      case "Home": nextIndex = 0; break;
      case "End": nextIndex = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    activateTab(tabs[nextIndex]);
    tabs[nextIndex].focus();
  });
});

const canvas = document.querySelector(".orbit");
const ctx = canvas.getContext("2d");

if (ctx) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const dots = Array.from({ length: 1250 }, (_, index) => {
    const y = 1 - (2 * (index + 0.5)) / 1250;
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    const ring = Math.sqrt(1 - y * y);
    return [Math.cos(angle) * ring, y, Math.sin(angle) * ring];
  });
  let width = 0;
  let height = 0;
  let frame;
  let inView = false;

  function paint(time) {
    ctx.clearRect(0, 0, width, height);
    const x0 = width / 2;
    const y0 = height / 2;
    const size = Math.min(width, height) * 0.32;
    const light = root.dataset.theme === "light";
    const color = light ? "68, 103, 35" : "215, 249, 126";
    const spin = motion.matches ? 0.65 : time * 0.00018;
    const cos = Math.cos(spin);
    const sin = Math.sin(spin);

    const glow = ctx.createRadialGradient(x0, y0, size * 0.12, x0, y0, size * 1.45);
    glow.addColorStop(0, `rgba(${color}, .16)`);
    glow.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    for (const [x, y, z] of dots) {
      const rotatedX = x * cos - z * sin;
      const rotatedZ = x * sin + z * cos;
      const depth = y * 0.34 + rotatedZ * 0.94;
      const rotatedY = y * 0.94 - rotatedZ * 0.34;
      const perspective = 1 / (1 - depth * 0.16);
      const alpha = 0.13 + (depth + 1) * 0.34;
      const dotSize = 0.65 + (depth + 1) * size * 0.003;
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.fillRect(x0 + rotatedX * size * perspective, y0 + rotatedY * size * perspective, dotSize, dotSize);
    }

    const rings = [
      { tilt: -0.42, minor: 0.53, radius: 1.36, opacity: 0.48 },
      { tilt: 0.92, minor: 0.67, radius: 1.29, opacity: 0.35 },
      { tilt: -0.42, minor: 0.67, radius: 1.51, opacity: 0.2 }
    ];
    for (const { tilt, minor, radius, opacity } of rings) {
      ctx.strokeStyle = `rgba(${color}, ${opacity})`;
      ctx.beginPath();
      ctx.ellipse(x0, y0, size * radius, size * minor, tilt, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function tick(time) {
    paint(time);
    frame = requestAnimationFrame(tick);
  }

  function updateAnimation() {
    cancelAnimationFrame(frame);
    if (!width || !height) return;
    paint(performance.now());
    if (inView && !motion.matches) frame = requestAnimationFrame(tick);
  }

  new ResizeObserver(([entry]) => {
    ({ width, height } = entry.contentRect);
    const density = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    ctx.setTransform(density, 0, 0, density, 0, 0);
    updateAnimation();
  }).observe(canvas);

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    updateAnimation();
  }).observe(canvas);

  motion.addEventListener("change", updateAnimation);
  themeButton.addEventListener("click", updateAnimation);
}

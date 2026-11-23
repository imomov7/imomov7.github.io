const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');

function setTheme(theme) {
  const light = theme === "light";
  root.dataset.theme = light ? "light" : "dark";
  const label = light ? "Switch to dark theme" : "Switch to light theme";
  themeButton.setAttribute("aria-label", label);
  themeButton.title = label;
  themeColor.content = light ? "#f5f5f5" : "#111111";
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
const narrow = matchMedia("(max-width: 38rem)");

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

const navigation = document.querySelector("#site-nav");
const menuButton = document.querySelector(".menu-toggle");
const compactNavigation = matchMedia("(max-width: 48rem)");
const header = document.querySelector(".site-header");

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  header.dataset.menuOpen = String(open);
}

function updateNavigation() {
  menuButton.hidden = !compactNavigation.matches;
  setMenu(false);
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") === "false");
});
navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || !compactNavigation.matches) return;
  setMenu(false);
  const heading = document.querySelector(`${link.hash} h2`);
  if (heading) {
    heading.tabIndex = -1;
    requestAnimationFrame(() => heading.focus({ preventScroll: true }));
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || header.dataset.menuOpen !== "true") return;
  setMenu(false);
  menuButton.focus();
});
updateNavigation();
header.dataset.menuReady = "";
compactNavigation.addEventListener("change", updateNavigation);

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const entrances = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("section-entered");
      entrances.unobserve(entry.target);
    }
  }, { threshold: 0.08 });

  document.querySelectorAll("main > .section").forEach((section) => {
    entrances.observe(section);
  });
}

let pullStart;
themeButton.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || !event.isPrimary) return;
  pullStart = event.clientY;
  themeButton.setPointerCapture(event.pointerId);
});
themeButton.addEventListener("pointermove", (event) => {
  if (pullStart === undefined || !themeButton.hasPointerCapture(event.pointerId)) return;
  const distance = Math.min(24, Math.max(0, event.clientY - pullStart));
  themeButton.style.setProperty("--cord-pull", `${distance}px`);
});
themeButton.addEventListener("lostpointercapture", () => {
  pullStart = undefined;
  themeButton.style.removeProperty("--cord-pull");
});

const clock = document.querySelector(".dubai-time");
const dubaiTime = new Intl.DateTimeFormat("en-AE", {
  timeZone: "Asia/Dubai",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
function renderDubaiTime() {
  const now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = `Dubai · ${dubaiTime.format(now)}`;
}
renderDubaiTime();
clock.hidden = false;
setInterval(renderDubaiTime, 15000);

const profileButton = document.querySelector(".profile-open");
const profile = document.querySelector(".profile-dialog");
profileButton.hidden = false;
profileButton.addEventListener("click", () => profile.showModal());
profile.addEventListener("click", (event) => {
  if (event.target !== profile) return;
  const bounds = profile.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) {
    profile.close();
  }
});

let passage;
document.querySelectorAll("[data-door]").forEach((door) => {
  door.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || reducedMotion.matches) return;
    event.preventDefault();
    if (passage) {
      clearTimeout(passage.timer);
      passage.door.classList.remove("door-open");
    }
    door.classList.add("door-open");
    const target = document.getElementById(door.hash.slice(1));
    const timer = setTimeout(() => {
      if (location.hash !== door.hash) history.pushState(null, "", door.hash);
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "start" });
      target.animate(
        [{ opacity: 0.65, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
        { duration: 420, easing: "cubic-bezier(.22, 1, .36, 1)" },
      );
      door.classList.remove("door-open");
      passage = undefined;
    }, 250);
    passage = { door, timer };
  });
});

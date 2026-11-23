const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');

function setTheme(theme) {
  const light = theme === "light";
  root.dataset.theme = light ? "light" : "dark";
  const label = light ? "Switch to dark theme" : "Switch to light theme";
  themeButton.setAttribute("aria-label", label);
  themeButton.title = label;
  themeColor.content = light ? "#f4e8d3" : "#261a15";
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

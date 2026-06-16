"use strict";

const STORAGE_KEY = "dailyRoutine_tasks";
const THEME_KEY = "dailyRoutine_theme";
const SIDEBAR_KEY = "dailyRoutine_sidebar";
const PAGE_KEY = "dailyRoutine_page";

const CATEGORY_LABELS = {
  general: "General",
  health: "Health",
  work: "Work",
  study: "Study",
  personal: "Personal",
  errands: "Errands",
};

const PRIORITY_CLASS = {
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low",
};

const PRIORITY_LABELS = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const QUOTES = [
  {
    text: "The secret of your future is hidden in your daily routine.",
    author: "Mike Murdock",
  },
  {
    text: "Small daily improvements are the key to staggering long-term results.",
    author: "Robin Sharma",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  {
    text: "Discipline is the bridge between goals and accomplishment.",
    author: "Jim Rohn",
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
  },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "It's not about having time. It's about making time.",
    author: "Anonymous",
  },
];

const state = {
  tasks: [],
  filter: "all",
  searchQuery: "",
  currentPage: "dashboard",
};

const DOM = {
  appShell: document.getElementById("appShell"),
  sidebar: document.getElementById("sidebar"),
  sidebarOverlay: document.getElementById("sidebarOverlay"),
  sidebarCollapseBtn: document.getElementById("sidebarCollapseBtn"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),

  navDashboard: document.getElementById("navDashboard"),
  navTasks: document.getElementById("navTasks"),
  navCategories: document.getElementById("navCategories"),
  navStatistics: document.getElementById("navStatistics"),
  navSettings: document.getElementById("navSettings"),

  navBadgeTotal: document.getElementById("navBadgeTotal"),
  navBadgePending: document.getElementById("navBadgePending"),

  pageDashboard: document.getElementById("pageDashboard"),
  pageTasks: document.getElementById("pageTasks"),
  pageCategories: document.getElementById("pageCategories"),
  pageStatistics: document.getElementById("pageStatistics"),
  pageSettings: document.getElementById("pageSettings"),

  quoteText: document.getElementById("quoteText"),
  quoteAuthor: document.getElementById("quoteAuthor"),

  themeBtnLight: document.getElementById("themeBtnLight"),
  themeBtnDark: document.getElementById("themeBtnDark"),
  themeToggleBtnTop: document.getElementById("themeToggleBtnTop"),
  themeToggleIconTop: document.getElementById("themeToggleIconTop"),

  greetingTitle: document.getElementById("greetingTitle"),
  dateText: document.getElementById("dateText"),
  notifBtn: document.getElementById("notifBtn"),
  notifDot: document.getElementById("notifDot"),

  totalCount: document.getElementById("totalCount"),
  completedCount: document.getElementById("completedCount"),
  pendingCount: document.getElementById("pendingCount"),
  progressFill: document.getElementById("progressBarFill"),
  progressBar: document.getElementById("progressBarTrack"),
  progressPct: document.getElementById("progressPercent"),

  totalCountStats: document.getElementById("totalCountStats"),
  completedCountStats: document.getElementById("completedCountStats"),
  pendingCountStats: document.getElementById("pendingCountStats"),
  progressFillStats: document.getElementById("progressBarFillStats"),
  progressBarStats: document.getElementById("progressBarTrackStats"),
  progressPctStats: document.getElementById("progressPercentStats"),

  // Form
  taskForm: document.getElementById("taskForm"),
  taskInput: document.getElementById("taskInput"),
  taskCategory: document.getElementById("taskCategory"),
  taskPriority: document.getElementById("taskPriority"),
  addTaskBtn: document.getElementById("addTaskBtn"),
  charCount: document.getElementById("charCount"),
  errorMsg: document.getElementById("errorMsgId"),

  taskList: document.getElementById("taskList"),
  emptyState: document.getElementById("emptyState"),
  searchInput: document.getElementById("searchInput"),

  taskList2: document.getElementById("taskList2"),
  emptyState2: document.getElementById("emptyState2"),
  searchInput2: document.getElementById("searchInput2"),

  filterAll: document.getElementById("filterAll"),
  filterPending: document.getElementById("filterPending"),
  filterCompleted: document.getElementById("filterCompleted"),
  clearCompleted: document.getElementById("clearCompleted"),

  filterAll2: document.getElementById("filterAll2"),
  filterPending2: document.getElementById("filterPending2"),
  filterCompleted2: document.getElementById("filterCompleted2"),
  clearCompleted2: document.getElementById("clearCompleted2"),

  categoryBreakdown: document.getElementById("categoryBreakdown"),

  clearAllDataBtn: document.getElementById("clearAllDataBtn"),
Footer
  footerYear: document.getElementById("footerYear"),

  toastContainer: document.getElementById("toastContainer"),
};

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  } catch (e) {
    showToast("Storage full — could not save tasks.", "error");
  }
}
function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}
function saveTheme(t) {
  localStorage.setItem(THEME_KEY, t);
}
function loadSidebarState() {
  return localStorage.getItem(SIDEBAR_KEY) === "collapsed";
}
function saveSidebarState(v) {
  localStorage.setItem(SIDEBAR_KEY, v ? "collapsed" : "expanded");
}
function loadPage() {
  return localStorage.getItem(PAGE_KEY) || "dashboard";
}
function savePage(p) {
  localStorage.setItem(PAGE_KEY, p);
}

function uid() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function addTask(name, category, priority) {
  const task = {
    id: uid(),
    name: name.trim(),
    category,
    priority,
    completed: false,
    createdAt: Date.now(),
  };
  state.tasks.unshift(task);
  saveTasks();
  renderAllTaskLists();
  updateStats();
  showToast(`"${truncate(task.name, 28)}" added!`, "success");
}

function toggleTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  patchTaskCard(id, task.completed);
  updateStats();
  showToast(
    task.completed
      ? `✅ "${truncate(task.name, 28)}" completed!`
      : `↩️ "${truncate(task.name, 28)}" marked pending.`,
    task.completed ? "success" : "info",
  );
}

function deleteTask(id) {
  const task = state.tasks.find((t) => t.id === id);

  document
    .querySelectorAll(`.task-card[data-id="${id}"]`)
    .forEach((card) => card.classList.add("removing"));
  setTimeout(() => {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    saveTasks();
    renderAllTaskLists();
    updateStats();
  }, 320);
  if (task) showToast(`"${truncate(task.name, 28)}" deleted.`, "info");
}

function clearCompletedTasks() {
  const done = state.tasks.filter((t) => t.completed);
  if (!done.length) {
    showToast("No completed tasks to clear.", "info");
    return;
  }
  document
    .querySelectorAll(".task-card.completed")
    .forEach((card) => card.classList.add("removing"));
  setTimeout(() => {
    state.tasks = state.tasks.filter((t) => !t.completed);
    saveTasks();
    renderAllTaskLists();
    updateStats();
    showToast(
      `${done.length} completed task${done.length > 1 ? "s" : ""} cleared. 🗑️`,
      "success",
    );
  }, 340);
}

function clearAllData() {
  if (
    !confirm(
      "Are you sure you want to delete ALL tasks? This cannot be undone.",
    )
  )
    return;
  state.tasks = [];
  saveTasks();
  renderAllTaskLists();
  updateStats();
  showToast("All data cleared.", "info");
}

function getFilteredTasks() {
  return state.tasks.filter((task) => {
    const passFilter =
      state.filter === "all" ||
      (state.filter === "completed" && task.completed) ||
      (state.filter === "pending" && !task.completed);
    const q = state.searchQuery.toLowerCase();
    const passSearch =
      !q ||
      task.name.toLowerCase().includes(q) ||
      (CATEGORY_LABELS[task.category] || "").toLowerCase().includes(q);
    return passFilter && passSearch;
  });
}

function buildCard(task) {
  const art = document.createElement("article");
  art.className = `task-card${task.completed ? " completed" : ""}`;
  art.setAttribute("data-id", task.id);
  art.setAttribute("data-priority", task.priority);
  art.setAttribute("role", "listitem");

  art.innerHTML = `
    <div class="task-checkbox-wrap">
      <input type="checkbox" class="task-checkbox" id="chk_${task.id}_${Math.random().toString(36).slice(2, 5)}"
        ${task.completed ? "checked" : ""}
        aria-label="${task.completed ? "Mark as pending" : "Mark as complete"}: ${escapeHtml(task.name)}" />
    </div>
    <div class="task-body">
      <span class="task-name">${escapeHtml(task.name)}</span>
      <div class="task-meta">
        <span class="task-time">
          <i class="fa-regular fa-clock" aria-hidden="true"></i>
          ${formatTime(task.createdAt)}
        </span>
        <span class="task-badge badge-cat">
          <i class="fa-regular fa-comment" aria-hidden="true"></i>
          ${escapeHtml(CATEGORY_LABELS[task.category] || task.category)}
        </span>
        <span class="task-badge ${PRIORITY_CLASS[task.priority] || ""}">
          <span class="priority-dot"></span>
          ${PRIORITY_LABELS[task.priority] || task.priority}
        </span>
      </div>
    </div>
    <div class="task-actions">
      <button class="delete-btn" aria-label="Delete task" title="Delete task">
        <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
      </button>
    </div>
  `;

  art
    .querySelector(".task-checkbox")
    .addEventListener("change", () => toggleTask(task.id));
  art
    .querySelector(".delete-btn")
    .addEventListener("click", () => deleteTask(task.id));
  return art;
}

function renderList(listEl, emptyEl, tasks) {
  listEl.innerHTML = "";
  if (!tasks.length) {
    emptyEl.classList.add("visible");
    return;
  }
  emptyEl.classList.remove("visible");
  const frag = document.createDocumentFragment();
  tasks.forEach((t) => frag.appendChild(buildCard(t)));
  listEl.appendChild(frag);
}

function renderAllTaskLists() {
  const filtered = getFilteredTasks();
  if (state.currentPage === "dashboard") {
    renderList(DOM.taskList, DOM.emptyState, filtered);
  } else if (state.currentPage === "tasks") {
    renderList(DOM.taskList2, DOM.emptyState2, filtered);
  } else if (state.currentPage === "categories") {
    renderCategoryBreakdown();
  }
}

function patchTaskCard(id, completed) {
  document.querySelectorAll(`.task-card[data-id="${id}"]`).forEach((card) => {
    card.classList.toggle("completed", completed);
    const cb = card.querySelector(".task-checkbox");
    if (cb) cb.checked = completed;
  });
}

function animateStat(el, val) {
  if (!el) return;
  if (parseInt(el.textContent, 10) === val) return;
  el.classList.remove("count-animate");
  void el.offsetWidth;
  el.textContent = val;
  el.classList.add("count-animate");
}

function updateStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  animateStat(DOM.totalCount, total);
  animateStat(DOM.completedCount, completed);
  animateStat(DOM.pendingCount, pending);
  if (DOM.progressFill) DOM.progressFill.style.width = `${pct}%`;
  if (DOM.progressBar) DOM.progressBar.setAttribute("aria-valuenow", pct);
  if (DOM.progressPct) DOM.progressPct.textContent = `${pct}%`;

  animateStat(DOM.totalCountStats, total);
  animateStat(DOM.completedCountStats, completed);
  animateStat(DOM.pendingCountStats, pending);
  if (DOM.progressFillStats) DOM.progressFillStats.style.width = `${pct}%`;
  if (DOM.progressBarStats)
    DOM.progressBarStats.setAttribute("aria-valuenow", pct);
  if (DOM.progressPctStats) DOM.progressPctStats.textContent = `${pct}%`;

  if (DOM.notifDot) DOM.notifDot.style.display = pending > 0 ? "block" : "none";
}

function renderCategoryBreakdown() {
  if (!DOM.categoryBreakdown) return;
  const counts = {};
  state.tasks.forEach((t) => {
    counts[t.category] = (counts[t.category] || 0) + 1;
  });

  if (!Object.keys(counts).length) {
    DOM.categoryBreakdown.innerHTML =
      '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:20px 0">No tasks yet. Add tasks from the Dashboard.</p>';
    return;
  }

  DOM.categoryBreakdown.innerHTML = Object.entries(counts)
    .map(
      ([cat, count]) => `
    <div style="display:flex;align-items:center;justify-content:space-between;
                padding:12px 16px;background:var(--surface-1);border-radius:var(--r-lg);
                border:1px solid var(--border-subtle);">
      <span style="font-size:0.88rem;font-weight:600;color:var(--text-primary)">
        ${CATEGORY_LABELS[cat] || cat}
      </span>
      <span style="font-size:0.78rem;font-weight:700;color:var(--primary-light);
                   background:rgba(139,92,246,0.12);padding:3px 10px;border-radius:999px;
                   border:1px solid rgba(139,92,246,0.20)">
        ${count} task${count > 1 ? "s" : ""}
      </span>
    </div>
  `,
    )
    .join("");
}

function showError(msg) {
  DOM.errorMsg.textContent = msg ? `⚠️  ${msg}` : "";
  DOM.errorMsg.classList.toggle("visible", Boolean(msg));
}

function handleSubmit(e) {
  e.preventDefault();
  const name = DOM.taskInput.value.trim();
  const category = DOM.taskCategory.value;
  const priority = DOM.taskPriority.value;

  if (!name) {
    showError("Please enter a task name before adding.");
    shakeEl(DOM.taskInput);
    DOM.taskInput.focus();
    return;
  }
  if (name.length > 150) {
    showError("Task name must be 150 characters or less.");
    return;
  }
  if (state.tasks.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
    showError("A task with this name already exists.");
    shakeEl(DOM.taskInput);
    return;
  }

  showError("");
  addTask(name, category, priority);
  DOM.taskInput.value = "";
  DOM.taskCategory.value = "general";
  DOM.taskPriority.value = "medium";
  updateCharCount("");
  DOM.taskInput.focus();
}

function shakeEl(el) {
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97)";
  if (!document.getElementById("_shake")) {
    const s = document.createElement("style");
    s.id = "_shake";
    s.textContent = `@keyframes shake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-6px)}40%,60%{transform:translateX(6px)}}`;
    document.head.appendChild(s);
  }
  el.addEventListener(
    "animationend",
    () => {
      el.style.animation = "";
    },
    { once: true },
  );
}

function updateCharCount(val) {
  const len = val.length;
  DOM.charCount.textContent = `${len}/150`;
  DOM.charCount.classList.toggle("warning", len > 100 && len <= 135);
  DOM.charCount.classList.toggle("danger", len > 135);
}

function setFilter(filter) {
  state.filter = filter;

  [
    [DOM.filterAll, DOM.filterPending, DOM.filterCompleted],
    [DOM.filterAll2, DOM.filterPending2, DOM.filterCompleted2],
  ].forEach((tabs) => {
    tabs.forEach((tab) => {
      if (!tab) return;
      const active = tab.dataset.filter === filter;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active);
    });
  });

  renderAllTaskLists();
}

let searchTimer = null;
function handleSearch(e) {
  clearTimeout(searchTimer);
  if (DOM.searchInput && DOM.searchInput !== e.target)
    DOM.searchInput.value = e.target.value;
  if (DOM.searchInput2 && DOM.searchInput2 !== e.target)
    DOM.searchInput2.value = e.target.value;
  searchTimer = setTimeout(() => {
    state.searchQuery = e.target.value.trim();
    renderAllTaskLists();
  }, 200);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (DOM.themeBtnLight) {
    DOM.themeBtnLight.classList.toggle("active", theme === "light");
    DOM.themeBtnLight.setAttribute("aria-pressed", theme === "light");
  }
  if (DOM.themeBtnDark) {
    DOM.themeBtnDark.classList.toggle("active", theme === "dark");
    DOM.themeBtnDark.setAttribute("aria-pressed", theme === "dark");
  }
  if (DOM.themeToggleIconTop) {
    DOM.themeToggleIconTop.className =
      theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
  }
}

function switchTheme(theme) {
  applyTheme(theme);
  saveTheme(theme);
  showToast(
    `${theme === "dark" ? "🌙 Dark" : "☀️ Light"} mode enabled.`,
    "info",
  );
}

const PAGE_MAP = {
  dashboard: DOM.pageDashboard,
  tasks: DOM.pageTasks,
  categories: DOM.pageCategories,
  statistics: DOM.pageStatistics,
  settings: DOM.pageSettings,
};

const NAV_MAP = {
  dashboard: DOM.navDashboard,
  tasks: DOM.navTasks,
  categories: DOM.navCategories,
  statistics: DOM.navStatistics,
  settings: DOM.navSettings,
};

function navigateTo(page) {
  if (!PAGE_MAP[page]) return;

  Object.values(PAGE_MAP).forEach((p) => {
    if (p) p.classList.remove("active");
  });

  PAGE_MAP[page].classList.add("active");

  Object.entries(NAV_MAP).forEach(([key, btn]) => {
    if (!btn) return;
    btn.classList.toggle("active", key === page);
    if (key === page) {
      btn.setAttribute("aria-current", "page");
    } else {
      btn.removeAttribute("aria-current");
    }
  });

  state.currentPage = page;
  savePage(page);

  renderAllTaskLists();
  updateStats();

  if (window.innerWidth <= 768) closeMobileSidebar();
}

function toggleSidebarCollapse() {
  const isCollapsed = DOM.appShell.classList.toggle("sidebar-collapsed");
  saveSidebarState(isCollapsed);
  if (DOM.sidebarCollapseBtn) {
    DOM.sidebarCollapseBtn.setAttribute(
      "aria-label",
      isCollapsed ? "Expand sidebar" : "Collapse sidebar",
    );
  }
}

function openMobileSidebar() {
  DOM.sidebar.classList.add("mobile-open");
  DOM.sidebarOverlay.classList.add("active");
  DOM.mobileMenuBtn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeMobileSidebar() {
  DOM.sidebar.classList.remove("mobile-open");
  DOM.sidebarOverlay.classList.remove("active");
  DOM.mobileMenuBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

const TOAST_ICONS = {
  success: '<i class="fa-solid fa-circle-check toast-icon"></i>',
  error: '<i class="fa-solid fa-circle-xmark toast-icon"></i>',
  info: '<i class="fa-solid fa-circle-info toast-icon"></i>',
};

function showToast(message, type = "info", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.innerHTML = `${TOAST_ICONS[type] || ""}<span>${message}</span>`;
  DOM.toastContainer.appendChild(toast);
  const timer = setTimeout(() => dismissToast(toast), duration);
  toast.addEventListener("click", () => {
    clearTimeout(timer);
    dismissToast(toast);
  });
}

function dismissToast(toast) {
  if (!toast.parentNode) return;
  toast.classList.add("hiding");
  toast.addEventListener("animationend", () => toast.remove(), { once: true });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString())
    return `Yesterday, ${time}`;
  return (
    d.toLocaleDateString([], { month: "short", day: "numeric" }) + `, ${time}`
  );
}

function getGreeting() {
  return "Hello, User! 👋";
}

function updateGreeting() {
  DOM.greetingTitle.textContent = getGreeting();
}

function updateDate() {
  DOM.dateText.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function displayRandomQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  DOM.quoteText.textContent = q.text;
  DOM.quoteAuthor.textContent = `— ${q.author}`;
}

function setFooterYear() {
  if (DOM.footerYear) DOM.footerYear.textContent = new Date().getFullYear();
}

function attachEvents() {
  // Form
  DOM.taskForm.addEventListener("submit", handleSubmit);
  DOM.taskInput.addEventListener("input", (e) => {
    updateCharCount(e.target.value);
    if (DOM.errorMsg.classList.contains("visible")) showError("");
  });
  DOM.taskInput.addEventListener("focus", () => showError(""));
  DOM.taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      DOM.taskInput.value = "";
      updateCharCount("");
      showError("");
    }
  });

  if (DOM.themeBtnLight) DOM.themeBtnLight.addEventListener("click", () => switchTheme("light"));
  if (DOM.themeBtnDark) DOM.themeBtnDark.addEventListener("click", () => switchTheme("dark"));

  if (DOM.themeToggleBtnTop) {
    DOM.themeToggleBtnTop.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      switchTheme(cur === "dark" ? "light" : "dark");
    });
  }

  if (DOM.sidebarCollapseBtn) DOM.sidebarCollapseBtn.addEventListener("click", toggleSidebarCollapse);

  DOM.mobileMenuBtn.addEventListener("click", openMobileSidebar);
  DOM.sidebarOverlay.addEventListener("click", closeMobileSidebar);

  Object.entries(NAV_MAP).forEach(([page, btn]) => {
    if (btn) btn.addEventListener("click", () => navigateTo(page));
  });

  if (DOM.notifBtn) {
    DOM.notifBtn.addEventListener("click", () => {
      const pending = state.tasks.filter((t) => !t.completed).length;
      showToast(
        pending > 0
          ? `You have ${pending} pending task${pending > 1 ? "s" : ""}! 📋`
          : "All tasks are complete! 🎉",
        pending > 0 ? "info" : "success",
      );
    });
  }

  DOM.filterAll.addEventListener("click", () => setFilter("all"));
  DOM.filterPending.addEventListener("click", () => setFilter("pending"));
  DOM.filterCompleted.addEventListener("click", () => setFilter("completed"));
  DOM.clearCompleted.addEventListener("click", clearCompletedTasks);

  if (DOM.filterAll2)
    DOM.filterAll2.addEventListener("click", () => setFilter("all"));
  if (DOM.filterPending2)
    DOM.filterPending2.addEventListener("click", () => setFilter("pending"));
  if (DOM.filterCompleted2)
    DOM.filterCompleted2.addEventListener("click", () =>
      setFilter("completed"),
    );
  if (DOM.clearCompleted2)
    DOM.clearCompleted2.addEventListener("click", clearCompletedTasks);

  DOM.searchInput.addEventListener("input", handleSearch);
  if (DOM.searchInput2)
    DOM.searchInput2.addEventListener("input", handleSearch);

  if (DOM.clearAllDataBtn)
    DOM.clearAllDataBtn.addEventListener("click", clearAllData);

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeMobileSidebar();
  });
}

function init() {

  applyTheme(loadTheme());

  if (loadSidebarState()) DOM.appShell.classList.add("sidebar-collapsed");

  state.tasks = loadTasks();

  renderAllTaskLists();
  updateStats();
  updateGreeting();
  updateDate();
  displayRandomQuote();
  setFooterYear();

  navigateTo(loadPage() || "dashboard");

  attachEvents();

  setInterval(() => {
    updateGreeting();
    updateDate();
  }, 60_000);

  setInterval(displayRandomQuote, 30_000);

  console.info(
    "%c🚀 Daily Routine Tracker v3 ",
    "background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;font-size:13px;padding:5px 10px;border-radius:6px;font-weight:bold;",
    `\nPremium dashboard loaded. ${state.tasks.length} task(s) in storage.`,
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

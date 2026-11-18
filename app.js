/* ============================================================
   PrimeCare Dashboard — interactions & lightweight SVG charts
   Works across index.html, systems.html and architecture.html
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- Sample data ---------- */
  const queueRows = [
    { id: "PC-2041", name: "Juan Dela Cruz", dept: "Registration", time: "08:12", status: "Checked-in" },
    { id: "PC-2042", name: "Maria Santos", dept: "Consultation", time: "07:52", status: "In consultation" },
    { id: "PC-2038", name: "Kevin Tan", dept: "Laboratory", time: "07:41", status: "Laboratory" },
    { id: "PC-2035", name: "Nina Castro", dept: "Pharmacy", time: "07:36", status: "Pharmacy" },
    { id: "PC-2031", name: "Omar Villa", dept: "Billing", time: "07:28", status: "Billing" },
    { id: "PC-2043", name: "Pedro Reyes", dept: "Registration", time: "08:17", status: "Checked-in" },
    { id: "PC-2039", name: "Liza Flores", dept: "Laboratory", time: "07:47", status: "Laboratory" },
    { id: "PC-2032", name: "Lea Torres", dept: "Billing", time: "07:33", status: "Billing" }
  ];

  const statusClass = {
    "Checked-in": "checked-in",
    "In consultation": "in-consultation",
    "Laboratory": "laboratory",
    "Pharmacy": "pharmacy",
    "Billing": "billing"
  };

  const diagramInfo = {
    architecture: {
      src: "assets/primecare-architecture.svg",
      alt: "PrimeCare layered Hospital Information System architecture diagram",
      title: "Four-layer integrated HIS architecture",
      text: "User access, HIS applications, centralized data, and security & protection — all connected through a secure hospital network.",
      source: "Source: Proposal §6.1"
    },
    flow: {
      src: "assets/primecare-data-flow.svg",
      alt: "PrimeCare department information exchange diagram",
      title: "Information exchanged between six departments",
      text: "Patient Services, Medical, Laboratory, Pharmacy, Finance & Billing and Administration share data through one integrated HIS and centralized database.",
      source: "Source: Proposal §6.2"
    },
    org: {
      src: "assets/primecare-org-chart.svg",
      alt: "PrimeCare organizational structure chart",
      title: "Hospital Administrator with eight departments",
      text: "The Hospital Administrator oversees Medical, Nursing, Laboratory & Imaging, Pharmacy, Finance & Billing, Human Resources, IT and Patient Services.",
      source: "Source: Proposal §1.2"
    }
  };

  /* ---------- Clock & greeting ---------- */
  function updateClock() {
    const now = new Date();
    $("#todayDate").textContent = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    $("#sidebarTime").textContent = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const hour = now.getHours();
    const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    if ($("#greeting")) $("#greeting").textContent = greet + ", Maria";
  }

  /* ---------- Navigation ---------- */
  function goTo(view, updateHash) {
    const target = $("#view-" + view);
    if (!target) return;
    $$(".view").forEach(v => v.classList.toggle("active", v === target));
    $$(".nav-item[data-view]").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    const label = $(".nav-item[data-view='" + view + "'] span")?.textContent || "Overview";
    if ($("#crumbCurrent")) $("#crumbCurrent").textContent = label;
    if (updateHash !== false && history.replaceState) history.replaceState(null, "", "#" + view);
    closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeSidebar() {
    $("#sidebar").classList.remove("open");
    $("#scrim").classList.remove("show");
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(message) {
    if (!$("#toast")) return;
    $("#toastText").textContent = message;
    $("#toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2600);
  }

  /* ---------- Patient lists ---------- */
  function renderQueue(filter) {
    if (!$("#queueBody")) return;
    const q = (filter || "").trim().toLowerCase();
    const rows = queueRows.filter(r =>
      !q || [r.id, r.name, r.dept, r.status].join(" ").toLowerCase().includes(q)
    );
    $("#queueBody").innerHTML = rows.map(r => `
      <tr>
        <td><strong>${r.id}</strong></td>
        <td><strong>${r.name}</strong></td>
        <td>${r.dept}</td>
        <td>${r.time}</td>
        <td><span class="status-tag ${statusClass[r.status] || ""}">${r.status}</span></td>
      </tr>`).join("") || `<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:26px">No matching patients found.</td></tr>`;
  }

  function filterBoard(value) {
    const q = (value || "").trim().toLowerCase();
    $$(".board-col").forEach(col => {
      let shown = 0;
      $$(".patient-chip", col).forEach(chip => {
        const match = !q || chip.textContent.toLowerCase().includes(q);
        chip.style.display = match ? "" : "none";
        if (match) shown++;
      });
      const count = $(".col-head span", col);
      if (count) count.textContent = shown;
    });
  }

  /* ---------- Notifications dropdown ---------- */
  function initNotifications() {
    const btn = $("#notifBtn");
    const panel = $("#notifDropdown");
    if (!btn || !panel) return;
    const setOpen = open => {
      panel.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    };
    btn.addEventListener("click", e => {
      e.stopPropagation();
      setOpen(!panel.classList.contains("open"));
    });
    document.addEventListener("click", e => {
      if (!panel.contains(e.target) && e.target !== btn) setOpen(false);
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") setOpen(false);
    });
    const foot = $(".notif-foot", panel);
    if (foot) foot.addEventListener("click", () => setOpen(false));
  }

  /* ---------- SVG chart helpers ---------- */
  function smoothPath(points) {
    if (!points.length) return "";
    let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const mx = (x0 + x1) / 2;
      d += ` C ${mx.toFixed(1)} ${y0.toFixed(1)}, ${mx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return d;
  }

  function scalePoints(values, x0, x1, top, bottom, max) {
    const step = values.length > 1 ? (x1 - x0) / (values.length - 1) : 0;
    return values.map((v, i) => [x0 + i * step, bottom - (v / max) * (bottom - top)]);
  }

  function renderLineChart(container, config) {
    const { labels, series, max, ticks, suffix } = config;
    const W = 760, H = 250, L = 46, R = 18, T = 18, B = 34;
    const bottom = H - B, top = T;
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${config.aria || 'Trend chart'}">
      <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0d9488" stop-opacity=".22"/>
        <stop offset="1" stop-color="#0d9488" stop-opacity="0"/>
      </linearGradient></defs>`;

    ticks.forEach(t => {
      const y = bottom - (t / max) * (bottom - top);
      svg += `<line class="grid-line" x1="${L}" y1="${y.toFixed(1)}" x2="${W - R}" y2="${y.toFixed(1)}"/>`;
      svg += `<text class="axis-label" x="${L - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end">${t}${suffix || ""}</text>`;
    });

    labels.forEach((label, i) => {
      const x = L + (i * (W - L - R)) / (labels.length - 1);
      svg += `<text class="axis-label" x="${x.toFixed(1)}" y="${H - 8}" text-anchor="middle">${label}</text>`;
    });

    series.forEach((s, idx) => {
      const pts = scalePoints(s.data, L, W - R, top, bottom, max);
      if (idx === 0) {
        const area = `M ${pts[0][0].toFixed(1)} ${bottom} L ` +
          pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ") +
          ` L ${pts[pts.length - 1][0].toFixed(1)} ${bottom} Z`;
        svg += `<path d="${area}" fill="url(#areaGrad)"/>`;
      }
      svg += `<path class="${idx === 0 ? "line-main" : "line-alt"}" d="${smoothPath(pts)}"/>`;
      if (idx === 0) {
        pts.forEach(p => {
          svg += `<circle class="dot-main" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.8"/>`;
        });
      }
    });

    svg += "</svg>";
    container.innerHTML = svg;
  }

  function renderColumns(container, config) {
    const { labels, data, max, ticks, aria } = config;
    const W = 760, H = 250, L = 46, R = 18, T = 18, B = 34;
    const bottom = H - B, top = T;
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${aria || 'Bar chart'}">`;
    ticks.forEach(t => {
      const y = bottom - (t / max) * (bottom - top);
      svg += `<line class="grid-line" x1="${L}" y1="${y.toFixed(1)}" x2="${W - R}" y2="${y.toFixed(1)}"/>`;
      svg += `<text class="axis-label" x="${L - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end">${t}</text>`;
    });
    const slot = (W - L - R) / data.length;
    const bw = Math.min(46, slot * 0.55);
    data.forEach((v, i) => {
      const x = L + i * slot + (slot - bw) / 2;
      const h = (v / max) * (bottom - top);
      const y = bottom - h;
      const fill = i === data.length - 1 ? "#0d9488" : "#7fd4cd";
      svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="6" fill="${fill}"/>`;
      svg += `<text class="axis-label" x="${(x + bw / 2).toFixed(1)}" y="${(y - 7).toFixed(1)}" text-anchor="middle" style="font-weight:700;fill:#334155">${v}</text>`;
      svg += `<text class="axis-label" x="${(x + bw / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${labels[i]}</text>`;
    });
    svg += "</svg>";
    container.innerHTML = svg;
  }

  function renderBars(container, items) {
    container.innerHTML = items.map(item => `
      <div class="bar-row">
        <span class="bar-label">${item.label}</span>
        <div class="bar-track"><div class="bar-fill" style="background:${item.color || "#0d9488"}" data-width="${Math.min(100, (item.value / item.max) * 100)}"></div></div>
        <span class="bar-value">${item.display != null ? item.display : item.value}</span>
      </div>`).join("");
    requestAnimationFrame(() => {
      $$(".bar-fill", container).forEach(el => { el.style.width = el.dataset.width + "%"; });
    });
  }

  function renderSparks() {
    $$(".spark").forEach(el => {
      const values = (el.dataset.spark || "").split(",").map(Number).filter(n => !isNaN(n));
      if (values.length < 2) return;
      const pts = scalePoints(values, 2, 198, 3, 27, Math.max(...values) * 1.05);
      const line = smoothPath(pts);
      const area = `M ${pts[0][0]} 30 L ` + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ") + ` L ${pts[pts.length - 1][0]} 30 Z`;
      const last = pts[pts.length - 1];
      el.innerHTML = `<svg viewBox="0 0 200 30" preserveAspectRatio="none" aria-hidden="true">
        <path d="${area}" fill="currentColor" opacity=".10"/>
        <path d="${line}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.8" fill="currentColor"/>
      </svg>`;
    });
  }

  function countUp() {
    $$("[data-count]").forEach(el => {
      const target = Number(el.dataset.count) || 0;
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const duration = 900;
      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased).toLocaleString("en-US") + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- CSV export ---------- */
  function downloadCSV(filename, rows) {
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportQueue() {
    downloadCSV("primecare-patient-queue.csv", [
      ["Patient ID", "Patient", "Department", "Checked in", "Status"],
      ...queueRows.map(r => [r.id, r.name, r.dept, r.time, r.status])
    ]);
    toast("Patient queue exported as CSV");
  }

  function exportPlan() {
    downloadCSV("primecare-implementation-plan.csv", [
      ["Section", "Item", "Detail"],
      ["7.1 Phase", "Planning", "Identify requirements, budget and system specifications"],
      ["7.1 Phase", "Development / Acquisition", "Select and configure the integrated HIS"],
      ["7.1 Phase", "Data Migration", "Transfer patient, billing, laboratory and inventory records"],
      ["7.1 Phase", "Employee Training", "Train doctors, nurses and administrative personnel"],
      ["7.1 Phase", "Testing", "Test functionality, security, integration and accuracy"],
      ["7.1 Phase", "Deployment", "Introduce the system department by department"],
      ["7.1 Phase", "Monitoring", "Evaluate performance and address technical problems"],
      ["7.2 Risk", "Employee Resistance", "Conduct training and provide technical assistance"],
      ["7.2 Risk", "Data Breaches", "Apply encryption, authentication and access restrictions"],
      ["7.2 Risk", "Data Migration Errors", "Validate and back up records before migration"],
      ["7.2 Risk", "System Downtime", "Establish backup systems and recovery procedures"],
      ["7.2 Risk", "High Implementation Costs", "Implement in phases and prioritize essential functions"],
      ["7.2 Risk", "Technical Difficulties", "Hire qualified IT personnel and provide ongoing maintenance"]
    ]);
    toast("Implementation plan exported as CSV");
  }

  /* ---------- Diagram tabs ---------- */
  function setDiagram(key) {
    const info = diagramInfo[key];
    if (!info) return;
    $$(".diagram-tab").forEach(tab => {
      const active = tab.dataset.diagram === key;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    const img = $("#diagramImage");
    if (!img) return;
    img.src = info.src;
    img.alt = info.alt;
    $("#diagramTitle").textContent = info.title;
    $("#diagramText").textContent = info.text;
    $(".source-badge").innerHTML = `<svg><use href="#i-file"/></svg> ${info.source}`;
  }

  /* ---------- Init ---------- */
  function init() {
    updateClock();
    setInterval(updateClock, 30000);
    initNotifications();

    // Common navigation
    $$(".nav-item[data-view]").forEach(btn => btn.addEventListener("click", () => goTo(btn.dataset.view)));
    $$("[data-goto]").forEach(btn => btn.addEventListener("click", () => goTo(btn.dataset.goto)));
    if (location.hash && $("#view-" + location.hash.slice(1))) goTo(location.hash.slice(1), false);

    $("#menuBtn")?.addEventListener("click", () => {
      $("#sidebar").classList.toggle("open");
      $("#scrim").classList.toggle("show");
    });
    $("#scrim")?.addEventListener("click", closeSidebar);

    // Patient searches (replaced the old header search)
    $("#patientSearch")?.addEventListener("input", e => renderQueue(e.target.value));
    $("#flowSearch")?.addEventListener("input", e => filterBoard(e.target.value));

    // Overview charts & data
    renderQueue("");
    renderSparks();
    countUp();

    if ($("#visitsChart")) {
      renderLineChart($("#visitsChart"), {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        series: [
          { data: [42, 58, 51, 66, 61, 74, 69] },
          { data: [18, 22, 20, 26, 24, 29, 25] }
        ],
        max: 80,
        ticks: [0, 20, 40, 60, 80],
        aria: "Patient visits this week: outpatient and emergency"
      });
    }
    if ($("#deptChart")) {
      renderBars($("#deptChart"), [
        { label: "Registration", value: 42, max: 60, color: "#0d9488" },
        { label: "Consultation", value: 58, max: 60, color: "#2563eb" },
        { label: "Laboratory", value: 37, max: 60, color: "#7c3aed" },
        { label: "Pharmacy", value: 29, max: 60, color: "#d97706" },
        { label: "Billing", value: 21, max: 60, color: "#e11d48" }
      ]);
    }
    if ($("#waitChart")) {
      renderBars($("#waitChart"), [
        { label: "Registration", value: 6, max: 20, display: "6 min", color: "#10b981" },
        { label: "Consultation", value: 14, max: 20, display: "14 min", color: "#10b981" },
        { label: "Laboratory", value: 12, max: 20, display: "12 min", color: "#10b981" },
        { label: "Pharmacy", value: 8, max: 20, display: "8 min", color: "#10b981" },
        { label: "Billing", value: 5, max: 20, display: "5 min", color: "#10b981" }
      ]);
    }
    if ($("#revenueChart")) {
      renderColumns($("#revenueChart"), {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
        data: [182, 196, 170, 214, 228, 205, 231, 248],
        max: 300,
        ticks: [0, 100, 200, 300],
        aria: "Monthly revenue in thousands of pesos"
      });
    }

    // Buttons
    $("#refreshBtn")?.addEventListener("click", () => { countUp(); renderSparks(); toast("Dashboard data refreshed"); });
    $("#flowRefresh")?.addEventListener("click", () => toast("Queue board refreshed"));
    $("#exportBtn")?.addEventListener("click", exportQueue);
    $("#exportPlan")?.addEventListener("click", exportPlan);
    $("#savePrefs")?.addEventListener("click", () => toast("Preferences saved"));
    $("#saveProfile")?.addEventListener("click", () => toast("Profile changes saved"));
    $("#profileForm")?.addEventListener("reset", () => setTimeout(() => toast("Changes discarded"), 0));
    $("#tokenBtn")?.addEventListener("click", () => {
      const col = $(".board .board-col");
      if (!col) return;
      const chip = document.createElement("div");
      chip.className = "patient-chip";
      chip.innerHTML = `<b>#A-1027</b><span>New queue token</span><small>Just now · 0 min</small>`;
      col.appendChild(chip);
      const count = $(".col-head span", col);
      if (count) count.textContent = String(Number(count.textContent) + 1);
      toast("Queue token #A-1027 created");
    });

    // Diagram tabs (architecture.html)
    $$(".diagram-tab").forEach(tab => tab.addEventListener("click", () => setDiagram(tab.dataset.diagram)));
    $("#openDiagram")?.addEventListener("click", () => {
      window.open($("#diagramImage").getAttribute("src"), "_blank", "noopener");
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();

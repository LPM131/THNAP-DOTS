// chat-cylinder.js
// Mounts a fullscreen cylinder UI into #chat-root
// Exports initCylinder(), destroyCylinder(), spinToFirstUnread()

import { ThreadStore } from "./chat-threads.js";

let root = null;
let cyl = null;
let rotationX = 0;
let angleStep = 18;
let radius = 420;
let dragging = false;
let prevY = 0;
let velocity = 0;
let momentumTimer = null;
let animLoop = 0;

export function initCylinder() {
  root = document.getElementById("chat-root");
  if (!root) {
    console.error("[Cylinder] chat-root not found");
    return;
  }

  // safe placeholder until chat-screen registers DOTS_CHAT_OPEN_THREAD
  if (typeof window.DOTS_CHAT_OPEN_THREAD !== "function") {
    window.DOTS_CHAT_OPEN_THREAD = function (/*threadId*/) {
      console.warn("DOTS_CHAT_OPEN_THREAD not yet registered");
    };
  }

  // inject stylesheet relative to this module so path works on GH Pages and locally
  if (!document.querySelector('link[data-chat-ui]')) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = new URL("./chat-ui.css", import.meta.url).href;
    l.dataset.chatUi = "1";
    l.onload = () => { /* chat-ui.css loaded */ };
    l.onerror = (e) => console.warn("[Cylinder] chat-ui.css failed to load", e);
    document.head.appendChild(l);
  }

  root.classList.add("chat-cylinder-page", "show");

  // Ensure cylinder DOM exists (chat.html should provide it, fallback to create)
  cyl = root.querySelector("#cylinder");
  if (!cyl) {
    root.innerHTML = `
      <div class="chat-header">
        <button class="chat-back" id="cyl-back">Back</button>
        <div class="chat-title">Messages</div>
      </div>
      <div class="cylinder-container">
        <div id="cylinder" class="cylinder"></div>
      </div>
      <div class="cylinder-footer">
        <button id="spin-unread" class="spin-unread">Spin to unread</button>
      </div>
    `;
    cyl = root.querySelector("#cylinder");
  }

  // Build threads (reads from ThreadStore)
  buildThreads();

  // Hook controls
  bindPointerHandlers();

  // Back button
  const backBtn = root.querySelector("#cyl-back");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (typeof window.backToMain === "function") {
        destroyCylinder(false);
        window.backToMain();
      } else {
        destroyCylinder(true);
      }
    });
  }

  // Spin unread button
  const spinBtn = root.querySelector("#spin-unread");
  if (spinBtn) spinBtn.addEventListener("click", spinToFirstUnread);

  // Start animation loop
  cancelAnimationFrame(animLoop);
  function loop() {
    updateThreads();
    animLoop = requestAnimationFrame(loop);
  }
  loop();

  console.log("[Cylinder] Barrel Cylinder initialized");
}

export function destroyCylinder(keepRoot = false) {
  if (momentumTimer) { clearInterval(momentumTimer); momentumTimer = null; }
  cancelAnimationFrame(animLoop);
  if (!keepRoot && root) {
    root.innerHTML = "";
    root.classList.remove("chat-cylinder-page", "show");
  }
  cyl = null;
}

// ---------- build threads ----------
function buildThreads() {
  const threads = ThreadStore.getAll();
  if (!cyl) return;
  cyl.innerHTML = "";
  threads.forEach((t, i) => {
    const el = document.createElement("div");
    el.className = "thread";
    el.dataset.index = i;
    el.dataset.id = t.id;

    el.innerHTML = `
      <div class="dot" style="background:${t.color}; color: ${contrastingTextColor(t.color)};">
        ${(t.name||"")[0]||"?"}
      </div>
      <div class="meta">
        <div class="name">${escapeHtml(t.name)}</div>
        <div class="preview">${escapeHtml(t.preview||"")}</div>
      </div>
    `;

    // click to center + open thread
    el.addEventListener("click", () => {
      const idx = Number(el.dataset.index);
      const target = -idx * angleStep;
      animateTo(target, 260, () => {
        if (typeof window.DOTS_CHAT_OPEN_THREAD === "function") {
          window.DOTS_CHAT_OPEN_THREAD(t.id);
        }
      });
    });
    cyl.appendChild(el);
  });
  // initial layout
  updateThreads();
}

// ---------- rotation math ----------
function updateThreads() {
  if (!cyl) return;
  const threads = cyl.querySelectorAll(".thread");
  threads.forEach(thread => {
    const idx = Number(thread.dataset.index);
    const angle = idx * angleStep + rotationX;
    const rad = (angle * Math.PI) / 180;
    const z = radius * Math.cos(rad);
    const y = radius * Math.sin(rad) * 0.62;
    const depthFactor = (z + radius) / (2 * radius);
    const scale = 0.46 + 0.6 * depthFactor;
    const opacity = 0.18 + 0.82 * depthFactor;
    const tilt = -y * 0.04;
    thread.style.transform = `translateY(${y}px) translateZ(${z}px) rotateX(${tilt}deg) scale(${scale})`;
    thread.style.opacity = opacity;

    const threadId = thread.dataset.id;
    const t = ThreadStore.getById(threadId);
    if (t && (t.unread || 0) > 0) {
      if (!thread.querySelector(".sonar") && t.justArrived) {
        const dot = thread.querySelector(".dot");
        const s = document.createElement("div");
        s.className = "sonar";
        s.style.color = t.color;
        dot.appendChild(s);
        t.justArrived = false;
        setTimeout(() => thread.classList.add("bounce"), 1200);
      }
    } else {
      const s = thread.querySelector(".sonar");
      if (s) s.remove();
      thread.classList.remove("bounce");
    }
  });
  highlightActive();
}

function highlightActive() {
  if (!cyl) return;
  const threads = cyl.querySelectorAll(".thread");
  let closest = 0;
  let best = Infinity;
  threads.forEach(th => {
    const idx = Number(th.dataset.index);
    let a = idx * angleStep + rotationX;
    a = ((a % 360) + 360) % 360;
    const diff = Math.min(Math.abs(a), Math.abs(360 - a));
    if (diff < best) { best = diff; closest = idx; }
  });
  threads.forEach(t => t.classList.remove("active"));
  const active = cyl.querySelector(`.thread[data-index="${closest}"]`);
  if (active) active.classList.add("active");
}

// ---------- pointer/touch handlers ----------
function bindPointerHandlers() {
  if (!cyl) return;
  cyl.addEventListener("pointerdown", (e) => {
    dragging = true;
    prevY = e.clientY;
    velocity = 0;
    if (e.pointerId) cyl.setPointerCapture?.(e.pointerId);
    if (momentumTimer) { clearInterval(momentumTimer); momentumTimer = null; }
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dy = e.clientY - prevY;
    prevY = e.clientY;
    rotationX += dy * 0.95;
    velocity = dy * 0.95;
  });
  window.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    startMomentum();
  });
  window.addEventListener("wheel", (e) => {
    rotationX += (e.deltaY > 0 ? 1 : -1) * angleStep;
  }, { passive: true });
}

function startMomentum() {
  if (momentumTimer) clearInterval(momentumTimer);
  momentumTimer = setInterval(() => {
    velocity *= 0.92;
    rotationX += velocity;
    if (Math.abs(velocity) < 0.12) {
      clearInterval(momentumTimer);
      momentumTimer = null;
      snapToNearest();
    }
  }, 16);
}

function snapToNearest() {
  const target = Math.round(rotationX / angleStep) * angleStep;
  animateTo(target, 320);
}

function animateTo(targetAngle, duration = 400, cb) {
  const start = rotationX;
  const delta = targetAngle - start;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    rotationX = start + delta * ease;
    if (t < 1) requestAnimationFrame(step);
    else {
      rotationX = targetAngle;
      if (typeof cb === "function") cb();
    }
  }
  requestAnimationFrame(step);
}

// ---------- spin to first unread (one circular spin) ----------
export function spinToFirstUnread() {
  const threads = ThreadStore.getAll();
  const unread = threads.find(t => (t.unread || 0) > 0);
  if (!unread) return;
  const idx = threads.indexOf(unread);
  const target = -idx * angleStep;
  const start = rotationX;
  const direction = (target - start) > 0 ? 1 : -1;
  const diff = (target - start) + direction * 360;
  animateTo(start + diff, 900, () => {
    rotationX = target;
    threads.forEach(t => { if (t.unread) t.justArrived = true; });
  });
}

// ---------- utils ----------
function escapeHtml(s) {
  return (s + "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function contrastingTextColor(hex) {
  try {
    if (!hex) return "#fff";
    if (hex.startsWith("hsl")) return "#000";
    if (hex.startsWith("#")) {
      const c = hex.substring(1);
      const r = parseInt(c.length === 3 ? c[0]+c[0] : c.substring(0,2), 16);
      const g = parseInt(c.length === 3 ? c[1]+c[1] : c.substring(2,4), 16);
      const b = parseInt(c.length === 3 ? c[2]+c[2] : c.substring(4,6), 16);
      const yiq = (r*299 + g*587 + b*114) / 1000;
      return yiq >= 128 ? "#000" : "#fff";
    }
  } catch (e) { /* ignore */ }
  return "#fff";
}

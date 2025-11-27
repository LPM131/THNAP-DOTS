// chat-cylinder.js — updated
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
let animLoop = null;

export function initCylinder() {
  // root is #chat-root (the fullscreen container created by index.js)
  root = document.getElementById("chat-root");
  if (!root) {
    console.error("[Cylinder] chat-root not found");
    return;
  }

  // ensure chat.html template already injected by index.js
  const overlay = document.getElementById("dots-text-overlay");
  if (!overlay) {
    console.error("[Cylinder] overlay template missing (#dots-text-overlay). Make sure chat.html exists.");
    return;
  }

  // inject css using import.meta.url so it resolves relative to this module (works on GitHub Pages)
  if (!document.querySelector('link[data-chat-ui]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    // relative to this module file
    link.href = new URL("chat-ui.css", import.meta.url).href;
    link.dataset.chatUi = "1";
    document.head.appendChild(link);
  }

  // show overlay and make it truly full-screen
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");

  // hide the main grid (so nothing shows behind the overlay)
  const mainGrid = document.getElementById("main-grid");
  if (mainGrid) mainGrid.classList.add("hidden");

  // attach local references
  cyl = overlay.querySelector("#cylinder");

  // build threads from ThreadStore
  buildThreads();

  // pointer handlers, wheel, etc.
  bindPointerHandlers();

  // back button: remove overlay, restore main grid
  const backBtn = overlay.querySelector("#cyl-back");
  backBtn?.addEventListener("click", () => {
    destroyCylinder();
    // restore the main grid
    if (mainGrid) mainGrid.classList.remove("hidden");
  });

  // spin unread button
  const spinBtn = overlay.querySelector("#spin-unread");
  spinBtn?.addEventListener("click", () => { spinToFirstUnread(); });

  // animation loop
  cancelAnimationFrame(animLoop);
  function loop() { updateThreads(); animLoop = requestAnimationFrame(loop); }
  loop();
}

export function destroyCylinder() {
  // clear timers & loop
  clearInterval(momentumTimer);
  cancelAnimationFrame(animLoop);

  // hide overlay if present
  const overlay = document.getElementById("dots-text-overlay");
  if (overlay) {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
  }

  // if overlay was injected into #chat-root by index.js, leave chat-root but clear cylinder contents
  if (cyl) cyl.innerHTML = "";
  cyl = null;
  rotationX = 0;
}

// ---------- thread build ----------
function buildThreads() {
  if (!cyl) return;
  const threads = ThreadStore.getAll();
  cyl.innerHTML = "";
  threads.forEach((t, i) => {
    const el = document.createElement("div");
    el.className = "thread";
    el.dataset.index = i;
    el.dataset.id = t.id;
    el.innerHTML = `
      <div class="dot" style="background:${t.color}">${(t.name||'')[0]||'?'}</div>
      <div class="meta">
        <div class="name">${escapeHtml(t.name)}</div>
        <div class="preview">${escapeHtml(t.preview||"")}</div>
      </div>
    `;
    el.addEventListener("click", () => {
      const idx = Number(el.dataset.index);
      const target = -idx * angleStep;
      // animate to that index then open thread screen
      animateTo(target, 300, () => {
        if (typeof window.DOTS_CHAT_OPEN_THREAD === "function") {
          window.DOTS_CHAT_OPEN_THREAD(t.id);
        }
      });
    });
    cyl.appendChild(el);
  });
  updateThreads();
}

// ---------- update math ----------
function updateThreads() {
  if (!cyl) return;
  const threads = cyl.querySelectorAll(".thread");
  threads.forEach(thread => {
    const idx = Number(thread.dataset.index);
    const angle = idx * angleStep + rotationX;
    const rad = angle * Math.PI / 180;
    const z = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);
    const scale = 0.45 + 0.55 * ((z + radius) / (2 * radius));
    const opacity = 0.22 + 0.78 * ((z + radius) / (2 * radius));
    const tilt = -y * 0.06;
    thread.style.transform = `translateY(${y}px) translateZ(${z}px) rotateX(${tilt}deg) scale(${scale})`;
    thread.style.opacity = opacity;
  });
  highlightActive();
}

function highlightActive() {
  if (!cyl) return;
  let closest = 0, best = 1e9;
  cyl.querySelectorAll(".thread").forEach(th => {
    const idx = Number(th.dataset.index);
    let a = idx * angleStep + rotationX;
    a = ((a % 360) + 360) % 360;
    const diff = Math.min(Math.abs(a), Math.abs(360 - a));
    if (diff < best) { best = diff; closest = idx; }
  });
  cyl.querySelectorAll(".thread").forEach(t => t.classList.remove("active"));
  const active = cyl.querySelector(`.thread[data-index="${closest}"]`);
  if (active) active.classList.add("active");
}

// ---------- pointers ----------
function bindPointerHandlers() {
  if (!cyl) return;
  cyl.addEventListener("pointerdown", (e) => {
    dragging = true; prevY = e.clientY; velocity = 0;
    clearInterval(momentumTimer);
    cyl.setPointerCapture?.(e.pointerId);
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dy = e.clientY - prevY;
    prevY = e.clientY;
    rotationX += dy * 0.9;
    velocity = dy * 0.9;
  });
  window.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    startMomentum();
  });
  window.addEventListener("wheel", (e) => {
    rotationX += (e.deltaY > 0 ? 1 : -1) * 18;
  });
}

function startMomentum() {
  if (momentumTimer) clearInterval(momentumTimer);
  momentumTimer = setInterval(() => {
    velocity *= 0.92;
    rotationX += velocity;
    if (Math.abs(velocity) < 0.12) {
      clearInterval(momentumTimer);
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
  // normalize delta so we don't get figure-8s — keep smooth monotonic path
  // compute shortest delta (handles wrap)
  let delta = ((targetAngle - start + 540) % 360) - 180;
  // if delta is small, just go directly
  const startTime = performance.now();
  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    rotationX = start + delta * ease;
    if (t < 1) requestAnimationFrame(step);
    else {
      rotationX = start + delta;
      // normalize rotationX to targetAngle (avoid drift)
      rotationX = targetAngle;
      if (cb) cb();
    }
  }
  requestAnimationFrame(step);
}

// ---------- spin to first unread (one clean revolution) ----------
export function spinToFirstUnread() {
  const threads = ThreadStore.getAll();
  const unread = threads.find(t => (t.unread || 0) > 0);
  if (!unread) return;
  const idx = threads.indexOf(unread);
  const target = -idx * angleStep;

  // ensure we spin forward one full rotation and land on target in a single direction
  // determine direction: prefer forward (positive) so it feels like one circle
  let start = rotationX;
  // compute minimal difference in [-180,180]
  let minimal = ((target - start + 540) % 360) - 180;
  // choose to add a full +360 (forward) if minimal is negative, to ensure forward spin
  let diff = minimal;
  if (diff < 0) diff = minimal + 360;
  // final angle = start + diff (one forward spin possibly >360)
  const endAngle = start + diff;

  animateTo(endAngle, 900, () => {
    // normalize to exact target after animation
    rotationX = target;
    // trigger sonar/bounce on unread items
    const overlay = document.getElementById("dots-text-overlay");
    if (overlay) {
      const unreadThreads = threads.filter(t => (t.unread || 0) > 0);
      unreadThreads.forEach(t => {
        const el = overlay.querySelector(`.thread[data-id="${t.id}"]`);
        if (el) {
          el.classList.add("bounce");
          // add sonar visual (if not present)
          if (!el.querySelector(".sonar")) {
            const s = document.createElement("div");
            s.className = "sonar";
            el.querySelector(".dot")?.appendChild(s);
          }
        }
      });
    }
  });
}

// utility
function escapeHtml(s) {
  return (s + "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// scripts/features/chat/chat-cylinder.js
import { ThreadStore } from "./chat-threads.js";

/* Public API: initCylinder() */

let rotationX = 0;
let angleStep = 18;
let radius = 420;
let dragging = false;
let prevY = 0;
let velocity = 0;
let momentumTimer = null;

export function initCylinder() {
  const overlay = document.getElementById("dots-text-overlay");
  if (!overlay) {
    console.error("initCylinder: overlay not found");
    return;
  }

  overlay.setAttribute("aria-hidden", "false");

  const closeBtn = overlay.querySelector("#overlay-close");
  const backdrop = overlay.querySelector(".overlay-backdrop");
  const cyl = overlay.querySelector("#cylinder");

  // safe-guards
  if (!cyl) {
    console.error("initCylinder: #cylinder element missing in overlay");
    return;
  }

  // close handler: hides overlay and restores homescreen
  const closeOverlay = () => {
    const root = document.getElementById("chat-root");
    if (root) root.classList.add("hidden");
    const main = document.getElementById("main-grid");
    if (main) main.classList.remove("hidden");
    // remove overlay node after a short fade
    overlay.classList.remove("show");
    setTimeout(() => { overlay.remove(); }, 260);
  };

  closeBtn?.addEventListener("click", closeOverlay);
  backdrop?.addEventListener("click", closeOverlay);

  // render threads
  const threads = ThreadStore.getAll();
  cyl.innerHTML = "";
  threads.forEach((t, i) => {
    const el = document.createElement("div");
    el.className = "thread";
    el.dataset.index = i;
    el.dataset.id = t.id;
    el.innerHTML = `
      <div class="thread-dot" style="background:${escapeHtmlAttr(t.color)}"></div>
      <div class="thread-meta">
        <div class="thread-name">${escapeHtml(t.name)}</div>
        <div class="thread-preview">${escapeHtml(t.preview || "")}</div>
      </div>`;
    el.addEventListener("click", () => {
      rotationX = -i * angleStep;
      applyRotation();
      setTimeout(() => {
        // Bridge to chat-screen: call global if present
        if (typeof window.DOTS_CHAT_OPEN_THREAD === "function") {
          window.DOTS_CHAT_OPEN_THREAD(t.id);
        } else {
          // dynamic import fallback (ensures chat-screen module available)
          import("./chat-screen.js").then(m => {
            if (typeof window.DOTS_CHAT_OPEN_THREAD === "function") window.DOTS_CHAT_OPEN_THREAD(t.id);
            else if (typeof m.openThreadScreen === "function") m.openThreadScreen(t.id);
          }).catch(err => console.error("chat-screen dynamic import failed", err));
        }
      }, 220);
    });
    cyl.appendChild(el);
  });

  // pointer handlers (pointer API)
  cyl.addEventListener("pointerdown", (e) => {
    if (cyl.classList.contains("frozen")) return;
    dragging = true; prevY = e.clientY; clearInterval(momentumTimer);
    try { cyl.setPointerCapture(e.pointerId); } catch (err) {}
  });

  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dy = e.clientY - prevY;
    prevY = e.clientY;
    rotationX += dy * 1.3;
    velocity = dy * 1.3;
    applyRotation();
  });

  window.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    startMomentum();
  });

  // wheel for desktop
  window.addEventListener("wheel", (e) => {
    rotationX += e.deltaY > 0 ? 16 : -16;
    applyRotation();
  }, { passive: true });

  // spin unread
  overlay.querySelector("#spin-unread")?.addEventListener("click", spinToFirstUnread);

  // initial layout
  applyRotation();
}

/* internal helpers */

function applyRotation() {
  const threads = document.querySelectorAll("#cylinder .thread");
  threads.forEach((thread) => {
    const idx = Number(thread.dataset.index);
    const angle = idx * angleStep + rotationX;
    const rad = angle * Math.PI / 180;
    const z = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);
    const scale = 0.45 + 0.55 * ((z + radius) / (2 * radius));
    const opacity = 0.24 + 0.76 * ((z + radius) / (2 * radius));
    const tilt = -y * 0.06;
    thread.style.transform = `translateY(${y}px) translateZ(${z}px) rotateX(${tilt}deg) scale(${scale})`;
    thread.style.opacity = opacity;
    // set pointer events only for visible threads
    thread.style.pointerEvents = opacity > 0.08 ? "auto" : "none";
  });
  highlightActive();
}

function highlightActive() {
  const threads = document.querySelectorAll("#cylinder .thread");
  let closestIdx = 0; let minDiff = Infinity;
  threads.forEach(thread => {
    const idx = Number(thread.dataset.index);
    let a = idx * angleStep + rotationX;
    a = ((a % 360) + 360) % 360;
    const diff = Math.min(Math.abs(a), Math.abs(360 - a));
    if (diff < minDiff) { minDiff = diff; closestIdx = idx; }
  });
  threads.forEach(t => t.classList.remove("active"));
  const el = document.querySelector(`#cylinder .thread[data-index="${closestIdx}"]`);
  if (el) el.classList.add("active");
}

function startMomentum() {
  if (momentumTimer) clearInterval(momentumTimer);
  momentumTimer = setInterval(() => {
    velocity *= 0.92;
    rotationX += velocity;
    applyRotation();
    if (Math.abs(velocity) < 0.1) {
      clearInterval(momentumTimer);
      snapToNearest();
    }
  }, 16);
}

function snapToNearest() {
  const target = Math.round(rotationX / angleStep) * angleStep;
  const anim = setInterval(() => {
    const diff = target - rotationX;
    rotationX += diff * 0.22;
    applyRotation();
    if (Math.abs(diff) < 0.5) {
      rotationX = target;
      applyRotation();
      clearInterval(anim);
    }
  }, 16);
}

function spinToFirstUnread() {
  const threads = ThreadStore.getAll();
  const unread = threads.find(t => (t.unread || 0) > 0);
  if (!unread) return;
  const idx = threads.indexOf(unread);
  const target = -idx * angleStep;
  const start = rotationX;
  const diff = target - start;
  const dur = 800;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min(1, (now - startTime) / dur);
    const ease = 1 - Math.pow(1 - t, 3);
    rotationX = start + diff * ease;
    applyRotation();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* safe HTML escapes */
function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """)
    .replace(/'/g, "&#39;");
}
function escapeHtmlAttr(s) {
  return escapeHtml(String(s || ""));
}

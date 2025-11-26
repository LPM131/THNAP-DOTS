// scripts/features/chat/chat-cylinder.js
import { ThreadStore } from "./chat-threads.js";

/* Public API */
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

  if (!cyl) {
    console.error("initCylinder: #cylinder element missing");
    return;
  }

  const closeOverlay = () => {
    const root = document.getElementById("chat-root");
    if (root) root.classList.add("hidden");
    const main = document.getElementById("main-grid");
    if (main) main.classList.remove("hidden");

    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 260);
  };

  closeBtn?.addEventListener("click", closeOverlay);
  backdrop?.addEventListener("click", closeOverlay);

  const threads = ThreadStore.getAll();
  cyl.innerHTML = "";
  threads.forEach((t, i) => {
    const el = document.createElement("div");
    el.className = "thread";
    el.dataset.index = i;
    el.dataset.id = t.id;
    el.innerHTML = `
      <div class="thread-dot" style="background:${t.color}"></div>
      <div class="thread-meta">
        <div class="thread-name">${t.name}</div>
        <div class="thread-preview">${t.preview || ""}</div>
      </div>`;

    el.addEventListener("click", () => {
      rotationX = -i * angleStep;
      applyRotation();
      setTimeout(() => {
        if (window.DOTS_CHAT_OPEN_THREAD) window.DOTS_CHAT_OPEN_THREAD(t.id);
      }, 200);
    });

    cyl.appendChild(el);
  });

  cyl.addEventListener("pointerdown", (e) => {
    if (cyl.classList.contains("frozen")) return;
    dragging = true; prevY = e.clientY; clearInterval(momentumTimer);
    try { cyl.setPointerCapture(e.pointerId); } catch {}
  });

  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dy = e.clientY - prevY;
    prevY = e.clientY;
    rotationX += dy * 1.3;
    velocity = dy * 1.3;
    applyRotation();
  });

  window.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    startMomentum();
  });

  window.addEventListener("wheel", (e) => {
    rotationX += e.deltaY > 0 ? 16 : -16;
    applyRotation();
  });

  overlay.querySelector("#spin-unread")?.addEventListener("click", spinToFirstUnread);

  applyRotation();
}

/* Helpers */
function applyRotation() {
  const threads = document.querySelectorAll("#cylinder .thread");
  threads.forEach(thread => {
    const idx = Number(thread.dataset.index);
    const angle = idx * angleStep + rotationX;
    const rad = angle * Math.PI / 180;
    const z = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);
    const scale = 0.45 + 0.55 * ((z + radius) / (2 * radius));
    const opacity = 0.24 + 0.76 * ((z + radius) / (2 * radius));
    const tilt = -y * 0.06;

    thread.style.transform = `
      translateY(${y}px)
      translateZ(${z}px)
      rotateX(${tilt}deg)
      scale(${scale})
    `;
    thread.style.opacity = opacity;
    thread.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
  });

  highlightActive();
}

function highlightActive() {
  const threads = document.querySelectorAll("#cylinder .thread");
  let closest = 0;
  let minDiff = Infinity;

  threads.forEach(t => {
    const idx = Number(t.dataset.index);
    let ang = (idx * angleStep + rotationX) % 360;
    if (ang < 0) ang += 360;
    const diff = Math.min(Math.abs(ang), Math.abs(360 - ang));
    if (diff < minDiff) { minDiff = diff; closest = idx; }
  });

  threads.forEach(t => t.classList.remove("active"));
  const front = document.querySelector(`#cylinder .thread[data-index="${closest}"]`);
  if (front) front.classList.add("active");
}

function startMomentum() {
  clearInterval(momentumTimer);
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
  const unread = threads.find(t => t.unread > 0);
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

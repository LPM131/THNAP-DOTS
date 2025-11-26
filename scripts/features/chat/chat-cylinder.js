// chat-cylinder.js — builds the overlay + 3D cylinder selector
import { ThreadStore } from "./chat-threads.js";

/* basic template loader if chat.html exists */
function loadTemplateIntoBody() {
  // prefer external chat.html if present
  // attempt to fetch relative path (best-effort); otherwise use inline fallback
  try {
    // create node only if missing
    if (document.getElementById("dots-text-overlay")) return document.getElementById("dots-text-overlay");
    // try to fetch chat.html (non-blocking)
    fetch("scripts/features/chat/chat.html").then(res => {
      if (!res.ok) throw new Error("no template");
      return res.text();
    }).then(html => {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      document.body.appendChild(temp.firstElementChild);
    }).catch(() => {
      // fallback inline template if fetch fails
      const TEMPLATE = `
        <div id="dots-text-overlay" class="dots-text-overlay" aria-hidden="true">
          <div class="overlay-backdrop" data-role="backdrop"></div>
          <div class="overlay-content" role="dialog" aria-modal="true">
            <button id="overlay-close" class="overlay-close" aria-label="Close">✕</button>
            <div class="cylinder-shell"><div id="cylinder" class="cylinder"></div></div>
            <div class="cylinder-footer"><button id="spin-unread" class="cta" type="button">Spin to unread</button></div>
          </div>
        </div>`;
      const node = document.createElement("div");
      node.innerHTML = TEMPLATE;
      document.body.appendChild(node.firstElementChild);
    });
  } catch (e) {
    console.warn("template load failed", e);
  }
}

let rotationX = 0;
let angleStep = 18;
let radius = 420;
let dragging = false;
let prevY = 0;
let velocity = 0;
let momentumTimer = null;

export function mountChatOverlay({ onClose, onOpenThread }) {
  loadTemplateIntoBody();

  // small delay till template is in DOM
  const poll = setInterval(() => {
    const overlayRoot = document.getElementById("dots-text-overlay");
    if (!overlayRoot) return;
    clearInterval(poll);

    // show overlay
    overlayRoot.setAttribute("aria-hidden", "false");
    overlayRoot.classList.add("show");

    // hookups
    const closeBtn = overlayRoot.querySelector("#overlay-close");
    const backdrop = overlayRoot.querySelector(".overlay-backdrop");
    const cyl = overlayRoot.querySelector("#cylinder");

    closeBtn.addEventListener("click", () => { if (onClose) onClose(); });
    backdrop.addEventListener("click", () => { if (onClose) onClose(); });

    // render threads
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
          <div class="thread-name">${escapeHtml(t.name)}</div>
          <div class="thread-preview">${escapeHtml(t.preview || "")}</div>
        </div>`;
      el.addEventListener("click", () => {
        rotationX = -i * angleStep;
        applyRotation();
        setTimeout(() => { if (onOpenThread) onOpenThread(t.id); }, 260);
      });
      cyl.appendChild(el);
    });

    // pointer handlers
    cyl.addEventListener("pointerdown", (e) => {
      dragging = true; prevY = e.clientY; clearInterval(momentumTimer);
      cyl.setPointerCapture(e.pointerId);
    });
    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dy = e.clientY - prevY;
      prevY = e.clientY;
      rotationX += dy * 1.2;
      velocity = dy * 1.2;
      applyRotation();
    });
    window.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      startMomentum();
    });
    window.addEventListener("wheel", (e) => {
      rotationX += e.deltaY > 0 ? 15 : -15;
      applyRotation();
    });

    const spinBtn = overlayRoot.querySelector("#spin-unread");
    spinBtn.addEventListener("click", () => spinToFirstUnread());

    applyRotation();
  }, 80);

  // return overlay element for further manipulation if needed
  return document.getElementById("dots-text-overlay");
}

export function unmountChatOverlay() {
  const el = document.getElementById("dots-text-overlay");
  if (!el) return;
  el.classList.remove("show");
  setTimeout(() => { el.remove(); }, 320);
}

/* helpers */
function applyRotation() {
  const threads = document.querySelectorAll("#cylinder .thread");
  threads.forEach((thread) => {
    const idx = Number(thread.dataset.index);
    const angle = idx * angleStep + rotationX;
    const rad = angle * Math.PI / 180;
    const z = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);
    const scale = 0.45 + 0.55 * ((z + radius) / (2 * radius));
    const opacity = 0.25 + 0.75 * ((z + radius) / (2 * radius));
    const tilt = -y * 0.06;
    thread.style.transform = `translateY(${y}px) translateZ(${z}px) rotateX(${tilt}deg) scale(${scale})`;
    thread.style.opacity = opacity;
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

function escapeHtml(s) {
  return (s + "").replace(/[&<>"']/g, (m) => ({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[m]));
}

// chat-cylinder.js
// Mounts a fullscreen cylinder UI into #chat-root
// Exports initCylinder() and destroyCylinder()

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
  root = document.getElementById("chat-root");
  if (!root) {
    console.error("[Cylinder] chat-root not found");
    return;
  }

  // inject stylesheet if not present
  if (!document.querySelector('link[data-chat-ui]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = '/scripts/features/chat/chat-ui.css';
    l.dataset.chatUi = '1';
    document.head.appendChild(l);
  }

  root.classList.add('chat-root');
  root.innerHTML = `
    <div class="chat-header">
      <button class="chat-back-btn" id="cyl-back">Back</button>
      <div class="chat-title">Messages</div>
    </div>
    <div class="chat-body">
      <div class="cylinder-shell">
        <div id="cylinder"></div>
      </div>
    </div>
  `;

  cyl = root.querySelector('#cylinder');

  // build threads (from ThreadStore)
  buildThreads();

  // hook events
  bindPointerHandlers();
  root.querySelector('#cyl-back').addEventListener('click', () => {
    // back to dots homepage: call existing global function if available
    if (typeof window.backToMain === 'function') {
      // unmount cylinder UI first
      destroyCylinder(false);
      window.backToMain();
    } else {
      // fallback: hide root
      destroyCylinder(true);
    }
  });

  // start animation loop
  cancelAnimationFrame(animLoop);
  function loop() { updateThreads(); animLoop = requestAnimationFrame(loop); }
  loop();
}

export function destroyCylinder(keepRoot=false) {
  // clear timers
  clearInterval(momentumTimer);
  cancelAnimationFrame(animLoop);
  if (!keepRoot && root) root.innerHTML = "";
  if (!keepRoot && root) root.classList.remove('chat-root');
}

// ---------- build threads ----------
function buildThreads() {
  const threads = ThreadStore.getAll();
  cyl.innerHTML = '';
  threads.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'thread';
    el.dataset.index = i;
    el.dataset.id = t.id;
    el.innerHTML = `
      <div class="dot" style="background:${t.color};">${(t.name||'')[0]||'?'}</div>
      <div class="meta">
        <div class="name">${escapeHtml(t.name)}</div>
        <div class="preview">${escapeHtml(t.preview||'')}</div>
      </div>
    `;
    el.addEventListener('click', () => {
      // center this thread smoothly, then open thread
      const idx = Number(el.dataset.index);
      const target = -idx * angleStep;
      animateTo(target, 260, () => {
        // call global open thread (chat-screen registers window.DOTS_CHAT_OPEN_THREAD)
        if (typeof window.DOTS_CHAT_OPEN_THREAD === 'function') {
          window.DOTS_CHAT_OPEN_THREAD(t.id);
        }
      });
    });
    cyl.appendChild(el);
  });
  updateThreads();
}

// ---------- rotation math ----------
function updateThreads() {
  const threads = cyl.querySelectorAll('.thread');
  threads.forEach(thread => {
    const idx = Number(thread.dataset.index);
    const angle = idx * angleStep + rotationX;
    const rad = angle * Math.PI / 180;
    // single-axis rotation: Y (vertical) -> translateY, Z
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
  const threads = cyl.querySelectorAll('.thread');
  let closest = 0, best = 1e9;
  threads.forEach(th => {
    const idx = Number(th.dataset.index);
    let a = idx * angleStep + rotationX;
    a = ((a % 360) + 360) % 360;
    const diff = Math.min(Math.abs(a), Math.abs(360 - a));
    if (diff < best) { best = diff; closest = idx; }
  });
  threads.forEach(t => t.classList.remove('active'));
  const active = cyl.querySelector(`.thread[data-index="${closest}"]`);
  if (active) active.classList.add('active');
}

// ---------- pointer/touch handlers ----------
function bindPointerHandlers() {
  cyl.addEventListener('pointerdown', (e) => {
    dragging = true; prevY = e.clientY; velocity = 0; clearInterval(momentumTimer);
    cyl.setPointerCapture?.(e.pointerId);
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dy = e.clientY - prevY;
    prevY = e.clientY;
    rotationX += dy * 0.9;   // tuned sensitivity
    velocity = dy * 0.9;
  });
  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    startMomentum();
  });
  // wheel for desktop
  window.addEventListener('wheel', (e) => {
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
  const delta = targetAngle - start;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    rotationX = start + delta * ease;
    if (t < 1) requestAnimationFrame(step);
    else {
      rotationX = targetAngle;
      if (cb) cb();
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
  // do one full revolution then land
  const diff = (target - start) + (target > start ? 360 : -360);
  animateTo(start + diff, 900, () => { rotationX = target; });
}

// small escape helper
function escapeHtml(s) {
  return (s + '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

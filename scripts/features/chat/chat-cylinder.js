// chat-cylinder.js
// Ported from your standalone barrel UI (preserves original spin physics)
// Mounts a fullscreen cylinder UI into #chat-root
// Exports initCylinder(), destroyCylinder(), spinToFirstUnread()

import { ThreadStore } from "./chat-threads.js";

let root = null;
let cyl = null;
let rotationX = 0;
let angleStep = 18;
let radius = 450;
let dragging = false;
let prevY = 0;
let velocity = 0;
let momentumInterval = null;
let animFrame = null;
let data = []; // local snapshot of threads (keeps same structure as standalone)

// initialize / mount
export function initCylinder() {
  root = document.getElementById("chat-root");
  if (!root) {
    console.error("[Cylinder] #chat-root not found");
    return;
  }

  // inject stylesheet if not present
  if (!document.querySelector('link[data-chat-ui]')) {
    // Load CSS relative to this file (GitHub Pages safe)
    const cssURL = new URL("./chat-ui.css", import.meta.url).href;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssURL;

    document.head.appendChild(link);
  }

  // mark root as fullscreen chat area
  root.classList.add('chat-cylinder-page');
  root.innerHTML = `
    <button class="chat-back" id="cyl-back">Back</button>
    <div id="cylinder-container" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;perspective:1400px;">
      <div id="cylinder" class="cylinder" style="transform-style:preserve-3d;touch-action:none;"></div>
    </div>
  `;

  cyl = root.querySelector('#cylinder');

  // snapshot threads from ThreadStore into local data array (keeps same keys as your standalone)
  const threads = ThreadStore.getAll();
  data = threads.map(t => ({
    id: t.id,
    name: t.name || (t.id || '').toString(),
    color: t.color || '#888',
    messages: (t.messages && t.messages.slice()) || [],
    hasUnread: !!(t.unread && t.unread > 0),
    justArrived: false,
    preview: t.preview || (t.messages && t.messages.length ? t.messages[t.messages.length - 1].text : '')
  }));

  // build DOM threads
  createThreads();

  // hook events
  bindPointerHandlers();

  const back = root.querySelector('#cyl-back');
  back.addEventListener('click', () => {
    // Unmount UI then go back to main grid if available
    destroyCylinder(false);
    if (typeof window.backToMain === 'function') window.backToMain();
  });

  // animate loop (keeps same continuous update as original)
  cancelAnimationFrame(animFrame);
  function loop() { updateThreads(); animFrame = requestAnimationFrame(loop); }
  loop();

  // simulate arrivals if nothing unread (keep original feel)
  setTimeout(() => {
    // only simulate if no unread items exist
    if (!data.some(d => d.hasUnread)) {
      if (data[3]) { data[3].hasUnread = true; data[3].justArrived = true; }
      if (data[7]) { data[7].hasUnread = true; data[7].justArrived = true; }
      if (data[12]){ data[12].hasUnread = true; data[12].justArrived = true; }
      spinToFirstUnread(); // original single spin
    }
  }, 1000);
}

// destroy / unmount
export function destroyCylinder(keepRoot = false) {
  clearInterval(momentumInterval);
  cancelAnimationFrame(animFrame);
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
  if (!keepRoot && root) {
    root.innerHTML = "";
    root.classList.remove('chat-cylinder-page');
  }
}

// ---------- build threads (DOM) ----------
function createThreads() {
  cyl.innerHTML = "";
  data.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'thread';
    div.dataset.index = i;

    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.background = item.color;
    dot.style.boxShadow = `0 0 12px ${item.color}`;
    div.appendChild(dot);

    const textContainer = document.createElement('div');
    textContainer.style.display = 'flex';
    textContainer.style.flexDirection = 'column';

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = item.name;

    const preview = document.createElement('div');
    preview.className = 'preview';
    preview.textContent = item.preview || '';

    textContainer.appendChild(name);
    textContainer.appendChild(preview);
    div.appendChild(textContainer);

    div.addEventListener('click', () => {
      // mark as read locally and remove sonar
      item.hasUnread = false;
      item.justArrived = false;
      removeSonar(div);
      div.classList.remove('bounce');
      // center and then open thread via global bridge (chat-screen registers)
      const idx = Number(div.dataset.index);
      const target = -idx * angleStep;
      animateTo(target, 260, () => {
        if (typeof window.DOTS_CHAT_OPEN_THREAD === 'function') {
          window.DOTS_CHAT_OPEN_THREAD(item.id);
        }
      });
    });

    cyl.appendChild(div);
  });
  updateThreads();
}

// ---------- helpers ----------
function removeSonar(threadEl) {
  const sonar = threadEl.querySelector('.sonar');
  if (sonar) sonar.remove();
}

function updateThreads() {
  if (!cyl) return;
  const threads = cyl.querySelectorAll('.thread');
  threads.forEach(thread => {
    const idx = Number(thread.dataset.index);
    const item = data[idx];
    const angle = angleStep * idx + rotationX;
    const rad = angle * Math.PI / 180;
    const z = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);
    let scale = 0.5 + 0.5 * ((z + radius) / (2 * radius));
    const opacity = 0.3 + 0.7 * ((z + radius) / (2 * radius));
    const tilt = -y * 0.05;

    const dot = thread.querySelector('.dot');
    // clear sonar if already appended (we recreate sonar once)
    removeSonar(thread);
    thread.classList.remove('bounce');

    if (item.hasUnread) {
      if (item.justArrived) {
        const sonar = document.createElement('div');
        sonar.className = 'sonar';
        sonar.style.borderColor = item.color;
        dot.appendChild(sonar);
        item.justArrived = false;
        setTimeout(() => { thread.classList.add('bounce'); }, 1200);
      }
    }

    thread.style.transform = `translateY(${y}px) translateZ(${z}px) rotateX(${tilt}deg) scale(${scale})`;
    thread.style.opacity = opacity;
  });
  highlightActiveThread();
}

function highlightActiveThread() {
  let closestIdx = 0;
  let minDiff = Infinity;
  const threads = cyl.querySelectorAll('.thread');
  threads.forEach(thread => {
    const idx = Number(thread.dataset.index);
    let threadAngle = angleStep * idx + rotationX;
    threadAngle = ((threadAngle % 360) + 360) % 360;
    const diff = Math.min(Math.abs(threadAngle), Math.abs(360 - threadAngle));
    if (diff < minDiff) { minDiff = diff; closestIdx = idx; }
  });
  threads.forEach(t => t.classList.remove('active'));
  const el = cyl.querySelector(`.thread[data-index="${closestIdx}"]`);
  if (el) el.classList.add('active');
}

// ---------- rotation controls (original physics) ----------
function applyRotation() {
  updateThreads();
}

function snapToNearest() {
  const target = Math.round(rotationX / angleStep) * angleStep;
  // smooth snap like original
  const anim = setInterval(() => {
    const diff = target - rotationX;
    rotationX += diff * 0.25;
    applyRotation();
    if (Math.abs(diff) < 0.5) {
      rotationX = target;
      applyRotation();
      clearInterval(anim);
    }
  }, 16);
}

// pointer handlers (use pointer events for mobile compatibility)
function bindPointerHandlers() {
  cyl.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });

  // wheel for desktop
  window.addEventListener('wheel', (e) => {
    rotationX += e.deltaY > 0 ? 15 : -15;
    applyRotation();
  });
}

function onPointerDown(e) {
  dragging = true;
  prevY = e.clientY;
  velocity = 0;
  clearInterval(momentumInterval);
  cyl.setPointerCapture?.(e.pointerId);
}

function onPointerMove(e) {
  if (!dragging) return;
  const dy = e.clientY - prevY;
  prevY = e.clientY;
  rotationX += dy * 1.2; // original sensitivity
  velocity = dy * 1.2;
  applyRotation();
}

function onPointerUp() {
  if (!dragging) return;
  dragging = false;
  // momentum
  momentumInterval = setInterval(() => {
    velocity *= 0.92;
    rotationX += velocity;
    applyRotation();
    if (Math.abs(velocity) < 0.1) {
      clearInterval(momentumInterval);
      snapToNearest();
    }
  }, 16);
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

// ---------- spin to first unread (single full revolution like original) ----------
export function spinToFirstUnread() {
  const unreadLocal = data.filter(d => d.hasUnread);
  if (unreadLocal.length === 0) return;
  const first = unreadLocal[0];
  const idx = data.indexOf(first);
  const target = -idx * angleStep;
  const start = rotationX;
  const diff = target - start + 360 * 1; // one full spin then land
  const duration = 1000;
  const startTime = performance.now();
  function animate(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    rotationX = start + diff * ease;
    applyRotation();
    if (t < 1) requestAnimationFrame(animate);
    else {
      rotationX = target;
      applyRotation();
      // trigger sonar/bounce
      unreadLocal.forEach(it => { it.justArrived = true; });
      updateThreads();
    }
  }
  requestAnimationFrame(animate);
}

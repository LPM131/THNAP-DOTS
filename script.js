// -----------------------------
// 15 Dots Setup (Dynamic Grid)
// -----------------------------
const dots = [
    { id: 1, label: "💬", action: () => handleDot(1) },
    { id: 2, label: "2", action: () => handleDot(2) },
    { id: 3, label: "3", action: () => handleDot(3) },
    { id: 4, label: "4", action: () => handleDot(4) },
    { id: 5, label: "5", action: () => handleDot(5) },
    { id: 6, label: "6", action: () => handleDot(6) },
    { id: 7, label: "7", action: () => handleDot(7) },
    { id: 8, label: "8", action: () => handleDot(8) },
    { id: 9, label: "9", action: () => handleDot(9) },
    { id: 10, label: "10", action: () => handleDot(10) },
    { id: 11, label: "🔤", action: () => handleDot(11) },
    { id: 12, label: "12", action: () => handleDot(12) },
    { id: 13, label: "13", action: () => handleDot(13) },
    { id: 14, label: "14", action: () => handleDot(14) },
    { id: 15, label: "15", action: () => handleDot(15) },
];

const grid = document.querySelector(".dots-grid");

// Render dots dynamically
function renderDots() {
    grid.innerHTML = "";
    dots.forEach(dot => {
        const div = document.createElement("div");
        div.classList.add("dot");
        div.textContent = dot.label;
        div.addEventListener("click", dot.action);
        grid.appendChild(div);
    });
}

// -----------------------------
// DOT CLICK HANDLER
// -----------------------------
function handleDot(id) {
    grid.classList.add("hidden");
    if (id === 1) {
        document.getElementById("chat-modal").classList.remove("hidden");
    } else if (id === 11) {
        document.getElementById("game-modal").classList.remove("hidden");
        initGame(); // Initialize Wordle game
    } else {
        alert(`Dot ${id} clicked`);
        grid.classList.remove("hidden"); // restore grid for other dots
    }
}

// -----------------------------
// BACK BUTTONS
// -----------------------------
function backToDots() {
    document.getElementById("chat-modal").classList.add("hidden");
    grid.classList.remove("hidden");
}

function backToGameDots() {
    document.getElementById("game-modal").classList.add("hidden");
    grid.classList.remove("hidden");
}

// -----------------------------
// CHAT SYSTEM
// -----------------------------
const threads = {
    "Bot": [],
    "Friend 1": [],
    "Friend 2": []
};

let currentThread = null;

function selectThread(name) {
    currentThread = name;
    document.getElementById("thread-dots").classList.add("hidden");
    document.getElementById("chat-interface").classList.remove("hidden");
    renderMessages();
}

function sendMessage() {
    const input = document.getElementById("message-input");
    const msg = input.value.trim();
    if (!msg || !currentThread) return;
    
    threads[currentThread].push({ text: msg, sender: "You" });
    input.value = "";
    renderMessages();
}

function renderMessages() {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    if (!currentThread) return;
    threads[currentThread].forEach(m => {
        const div = document.createElement("div");
        div.textContent = `${m.sender}: ${m.text}`;
        div.classList.add("message");
        messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// -----------------------------
// CHAT SYSTEM: Floating Dots
// -----------------------------
const threadsData = {
    "Bot": { x: 50, y: 50 },
    "Friend 1": { x: 150, y: 50 },
    "Friend 2": { x: 250, y: 50 }
};

const container = document.getElementById("thread-dots");
const velocities = {}; // vx, vy for each thread

function renderThreadDots() {
    container.innerHTML = "";

    Object.keys(threadsData).forEach(name => {
        const dot = document.createElement("div");
        dot.classList.add("thread-dot", "floating");
        dot.textContent = name[0]; // initial
        dot.style.left = threadsData[name].x + "px";
        dot.style.top = threadsData[name].y + "px";

        // Tap to open chat
        dot.addEventListener("click", () => selectThread(name));

        // Drag support
        let offsetX, offsetY, dragging = false;

        dot.addEventListener("mousedown", startDrag);
        dot.addEventListener("touchstart", startDrag, { passive: false });

        function startDrag(e) {
            e.preventDefault();
            dragging = true;
            dot.dataset.dragging = "true";
            const rect = dot.getBoundingClientRect();
            const parentRect = container.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;

            document.addEventListener("mousemove", drag);
            document.addEventListener("mouseup", endDrag);
            document.addEventListener("touchmove", drag, { passive: false });
            document.addEventListener("touchend", endDrag);
        }

        function drag(e) {
            if (!dragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const parentRect = container.getBoundingClientRect();

            let x = clientX - parentRect.left - offsetX;
            let y = clientY - parentRect.top - offsetY;

            // Keep inside container
            x = Math.max(0, Math.min(parentRect.width - 60, x));
            y = Math.max(0, Math.min(parentRect.height - 60, y));

            dot.style.left = x + "px";
            dot.style.top = y + "px";
        }

        function endDrag() {
            dragging = false;
            dot.dataset.dragging = "false";
            localStorage.setItem("threadsPos", JSON.stringify(threadsData));
            document.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", endDrag);
            document.removeEventListener("touchmove", drag, { passive: false });
            document.removeEventListener("touchend", endDrag);
        }

        container.appendChild(dot);
    });
}

// -----------------------------
// Physics variables for floating dots
// -----------------------------
// const container = document.getElementById("thread-dots");
// const velocities = {}; // vx, vy for each thread

function initPhysics() {
    Object.keys(threadsData).forEach(name => {
        // Random initial velocity
        velocities[name] = {
            vx: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1),
            vy: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1)
        };
    });
    requestAnimationFrame(updateDots);
}

function updateDots() {
    const rect = container.getBoundingClientRect();

    Object.keys(threadsData).forEach(name => {
        const dot = document.querySelector(`.thread-dot:nth-child(${Object.keys(threadsData).indexOf(name) + 1})`);
        if (!dot) return;

        // Skip if dragging
        if (dot.dataset.dragging === "true") return;

        let pos = threadsData[name];
        let v = velocities[name];

        pos.x += v.vx;
        pos.y += v.vy;

        // Bounce off walls
        if (pos.x < 0 || pos.x > rect.width - 60) {
            v.vx *= -1;
            pos.x = Math.max(0, Math.min(rect.width - 60, pos.x));
        }
        if (pos.y < 0 || pos.y > rect.height - 60) {
            v.vy *= -1;
            pos.y = Math.max(0, Math.min(rect.height - 60, pos.y));
        }

        dot.style.left = pos.x + "px";
        dot.style.top = pos.y + "px";
        threadsData[name] = { x: pos.x, y: pos.y };
    });

    requestAnimationFrame(updateDots);
}



// -----------------------------
// INIT: load positions & render
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("threadsPos");
    if (saved) {
        const pos = JSON.parse(saved);
        Object.keys(pos).forEach(k => threadsData[k] = pos[k]);
    }
    renderThreadDots();
    initPhysics(); // start physics movement
    renderDots();
});

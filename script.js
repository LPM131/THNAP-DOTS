// ---------------------------
// DOM ELEMENTS
// ---------------------------
const mainGrid = document.getElementById("main-grid");
const chatModal = document.getElementById("chat-modal");
const wordleModal = document.getElementById("wordle-modal");

// Chat DOM
const threadArea = document.getElementById("thread-area");
const chatArea = document.getElementById("chat-area");
const messages = document.getElementById("messages");
const chatInput = document.getElementById("chat-input");

// Wordle DOM
const board = document.getElementById("game-board");
const keyboard = document.getElementById("keyboard");
const gameMsg = document.getElementById("game-message");


// ---------------------------
// NAVIGATION
// ---------------------------
document.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", () => {
        const id = parseInt(dot.dataset.id);

        mainGrid.classList.add("hidden");

        if (id === 1) openChat();
        else if (id === 11) openWordle();
        else {
            alert(`Dot ${id} clicked`);
            backToMain();
        }
    });
});

function backToMain() {
    chatModal.classList.add("hidden");
    wordleModal.classList.add("hidden");
    mainGrid.classList.remove("hidden");
}


// ---------------------------
// CHAT MODULE
// ---------------------------
const threadNames = ["Bot", "Friend 1", "Friend 2"];
let threadsData = {
    "Bot": { x: 40, y: 40 },
    "Friend 1": { x: 160, y: 200 },
    "Friend 2": { x: 100, y: 350 }
};
let velocities = {};

function openChat() {
    chatModal.classList.remove("hidden");
    renderThreadDots();
    initPhysics();
}

function renderThreadDots() {
    threadArea.innerHTML = "";

    threadNames.forEach(name => {
        const dot = document.createElement("div");
        dot.classList.add("thread-dot");
        dot.textContent = name[0];
        dot.style.left = threadsData[name].x + "px";
        dot.style.top = threadsData[name].y + "px";

        dot.addEventListener("click", () => openThread(name));

        threadArea.appendChild(dot);
    });
}

function openThread(name) {
    threadArea.classList.add("hidden");
    chatArea.classList.remove("hidden");
    messages.innerHTML = `<p>Chat with ${name}</p>`;
}

function sendMessage() {
    if (!chatInput.value.trim()) return;

    const bubble = document.createElement("div");
    bubble.textContent = chatInput.value;
    messages.appendChild(bubble);
    chatInput.value = "";
}


// ---------------------------
// FLOATING DOT PHYSICS
// ---------------------------
function initPhysics() {
    threadNames.forEach(name => {
        velocities[name] = {
            vx: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1),
            vy: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1)
        };
    });

    requestAnimationFrame(updateDots);
}

function updateDots() {
    const dots = document.querySelectorAll(".thread-dot");
    const bounds = threadArea.getBoundingClientRect();

    dots.forEach(dot => {
        const name = threadNames[[...dots].indexOf(dot)];
        const pos = threadsData[name];
        const vel = velocities[name];

        pos.x += vel.vx;
        pos.y += vel.vy;

        if (pos.x <= 0 || pos.x >= bounds.width - 60) vel.vx *= -1;
        if (pos.y <= 0 || pos.y >= bounds.height - 60) vel.vy *= -1;

        dot.style.left = pos.x + "px";
        dot.style.top = pos.y + "px";
    });

    requestAnimationFrame(updateDots);
}


// ---------------------------
// WORDLE MODULE
// ---------------------------
const WORDS = ["APPLE", "CRANE", "BRAIN", "CHESS", "FLAME", "GRAPE"];
let todayWord = WORDS[Math.floor(Math.random() * WORDS.length)];
let guesses = [];
let current = "";


function openWordle() {
    wordleModal.classList.remove("hidden");
    setupBoard();
    setupKeyboard();
}

function setupBoard() {
    board.innerHTML = "";
    for (let i = 0; i < 30; i++) {
        const t = document.createElement("div");
        t.classList.add("tile");
        board.appendChild(t);
    }
}

function setupKeyboard() {
    keyboard.innerHTML = "";

    const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

    rows.forEach(r => {
        const row = document.createElement("div");
        row.classList.add("keyboard-row");

        r.split("").forEach(c => {
            const key = document.createElement("div");
            key.classList.add("key");
            key.textContent = c;
            key.addEventListener("click", () => pressKey(c));
            row.appendChild(key);
        });

        if (r === "ZXCVBNM") {
            const back = document.createElement("div");
            back.classList.add("key");
            back.textContent = "⌫";
            back.onclick = () => pressKey("BACK");
            row.appendChild(back);

            const enter = document.createElement("div");
            enter.classList.add("key");
            enter.textContent = "ENTER";
            enter.onclick = () => pressKey("ENTER");
            row.appendChild(enter);
        }

        keyboard.appendChild(row);
    });
}

function pressKey(k) {
    if (k === "BACK") current = current.slice(0, -1);

    else if (k === "ENTER") submitGuess();

    else if (current.length < 5) current += k;

    renderBoard();
}

function renderBoard() {
    const tiles = document.querySelectorAll(".tile");

    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 5; c++) {
            const t = tiles[r * 5 + c];

            if (r < guesses.length) t.textContent = guesses[r][c];
            else if (r === guesses.length) t.textContent = current[c] || "";
            else t.textContent = "";
        }
    }
}

function submitGuess() {
    if (current.length !== 5) {
        gameMsg.textContent = "Must be 5 letters.";
        return;
    }

    guesses.push(current);
    if (current === todayWord) {
        gameMsg.textContent = "🎉 Correct!";
    }

    current = "";
    renderBoard();
}

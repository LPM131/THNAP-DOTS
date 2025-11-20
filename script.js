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
// --- Wordle Setup ---
const WORD = "APPLE";  // For testing, can be randomized later
let guesses = [];
let currentGuess = "";

const board = document.getElementById("game-board");
const keyboardContainer = document.getElementById("virtual-keyboard");
const message = document.getElementById("game-message");

// Create grid tiles (6 rows × 5 letters)
for (let i = 0; i < 6 * 5; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    board.appendChild(tile);
}

// Create virtual keyboard
const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
rows.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.style.display = "grid";
    rowDiv.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
    rowDiv.style.gap = "5px";

    [...row].forEach((char) => {
        const key = document.createElement("div");
        key.classList.add("key");
        key.textContent = char;
        key.addEventListener("click", () => handleKey(char));
        rowDiv.appendChild(key);
    });

    // Add backspace key on last row
    if (row === "ZXCVBNM") {
        const backKey = document.createElement("div");
        backKey.classList.add("key");
        backKey.textContent = "⌫";
        backKey.addEventListener("click", () => handleKey("BACK"));
        rowDiv.appendChild(backKey);

        const enterKey = document.createElement("div");
        enterKey.classList.add("key");
        enterKey.textContent = "ENTER";
        enterKey.addEventListener("click", () => handleKey("ENTER"));
        rowDiv.appendChild(enterKey);
    }

    keyboardContainer.appendChild(rowDiv);
});

// Handle key presses
function handleKey(key) {
    if (key === "BACK") {
        currentGuess = currentGuess.slice(0, -1);
    } else if (key === "ENTER") {
        submitGuess();
    } else if (currentGuess.length < 5) {
        currentGuess += key;
    }
    updateBoard();
}

// Update grid tiles
function updateBoard() {
    const allTiles = board.querySelectorAll(".tile");
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 5; col++) {
            const tile = allTiles[row * 5 + col];
            if (row < guesses.length) {
                tile.textContent = guesses[row][col];
                tile.style.backgroundColor = getTileColor(guesses[row][col], col);
            } else if (row === guesses.length) {
                tile.textContent = currentGuess[col] || "";
                tile.style.backgroundColor = "#ddd";
            } else {
                tile.textContent = "";
                tile.style.backgroundColor = "#ddd";
            }
        }
    }
}

// Simple tile coloring logic
function getTileColor(char, idx) {
    if (WORD[idx] === char) return "#6aaa64"; // Green
    else if (WORD.includes(char)) return "#c9b458"; // Yellow
    else return "#787c7e"; // Gray
}

// Submit guess
function submitGuess() {
    if (currentGuess.length < 5) {
        message.textContent = "Word must be 5 letters!";
        return;
    }
    guesses.push(currentGuess);
    currentGuess = "";
    updateBoard();
    if (guesses[guesses.length - 1] === WORD) {
        message.textContent = "🎉 You guessed it!";
    } else if (guesses.length === 6) {
        message.textContent = `😢 The word was: ${WORD}`;
    } else {
        message.textContent = "";
    }
}

// Responsive adjustment
function resizeGame() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gridSize = Math.min(vw * 0.9, vh * 0.5);
    board.style.width = gridSize + "px";
    keyboardContainer.style.width = gridSize + "px";
}
window.addEventListener("resize", resizeGame);
resizeGame();

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

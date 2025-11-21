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


// ------------------------------
// WORDLE 100% CLEAN MODULE
// ------------------------------

const WORD_LIST = ["APPLE", "BANJO", "CRANE", "DANCE", "ELITE", "FLAME", "GRAPE"];

function getWordOfTheDay() {
    const start = new Date("2025-01-01");
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return WORD_LIST[diff % WORD_LIST.length];
}

let WORD = getWordOfTheDay();
let guesses = [];
let currentGuess = "";

// Elements (shared from globals)
const message = gameMsg;

// ------------------------------
// Init board (30 tiles)
// ------------------------------
function initBoard() {
    board.innerHTML = "";
    for (let i = 0; i < 30; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        const span = document.createElement("span");
        tile.appendChild(span);
        board.appendChild(tile);
    }
}

// ------------------------------
// Init Keyboard
// ------------------------------
function initKeyboard() {
    keyboard.innerHTML = "";

    const keys = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];

    keys.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("keyboard-row");

        if (row === "ZXCVBNM") {
            addKey(rowDiv, "ENTER", "wide");
        }

        [...row].forEach(k => addKey(rowDiv, k));

        if (row === "ZXCVBNM") {
            addKey(rowDiv, "⌫", "wide");
        }

        keyboard.appendChild(rowDiv);
    });
}

function addKey(rowDiv, char, wide = "") {
    const key = document.createElement("div");
    key.classList.add("key");
    if (wide) key.classList.add(wide);
    key.textContent = char;
    key.onclick = () => handleKey(char);
    rowDiv.appendChild(key);
}

// ------------------------------
// Key handling
// ------------------------------
function handleKey(k) {
    if (k === "⌫") {
        currentGuess = currentGuess.slice(0, -1);
        updateBoard();
        return;
    }

    if (k === "ENTER") {
        submitGuess();
        return;
    }

    if (currentGuess.length < 5) {
        currentGuess += k;
        updateBoard();
    }
}

// ------------------------------
// Update Board
// ------------------------------
function updateBoard() {
    const tiles = [...document.querySelectorAll(".tile span")];

    for (let i = 0; i < 30; i++) {
        let row = Math.floor(i / 5);

        if (row < guesses.length) {
            tiles[i].textContent = guesses[row][i % 5];
        } else if (row === guesses.length) {
            tiles[i].textContent = currentGuess[i % 5] || "";
        } else {
            tiles[i].textContent = "";
        }
    }
}

// ------------------------------
// Submit guess
// ------------------------------
function submitGuess() {
    if (currentGuess.length < 5) {
        message.textContent = "Not enough letters.";
        return;
    }

    const guess = currentGuess;
    guesses.push(guess);
    currentGuess = "";
    message.textContent = "";

    revealGuess(guess, guesses.length - 1);
}

// ------------------------------
// Reveal animation & coloring
// ------------------------------
function revealGuess(guess, row) {
    const tiles = [...document.querySelectorAll(".tile")];
    const rowTiles = tiles.slice(row * 5, row * 5 + 5);

    [...guess].forEach((char, i) => {
        setTimeout(() => {
            rowTiles[i].classList.add("flip");

            if (WORD[i] === char) rowTiles[i].classList.add("correct");
            else if (WORD.includes(char)) rowTiles[i].classList.add("present");
            else rowTiles[i].classList.add("absent");

            rowTiles[i].querySelector("span").textContent = char;

            if (i === 4) checkEndGame(guess);

        }, i * 300);
    });
}

function checkEndGame(guess) {
    if (guess === WORD) {
        message.textContent = "🎉 You got it!";
    } else if (guesses.length === 6) {
        message.textContent = `The word was: ${WORD}`;
    }
}

// ------------------------------
// Initialize on modal open
// ------------------------------
function openWordle() {
    wordleModal.classList.remove("hidden");
    initBoard();
    initKeyboard();
    updateBoard();
}

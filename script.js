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
        else if (id === 13) openPokemon();
        else {
            alert(`Dot ${id} clicked`);
            backToMain();
        }
    });
});

function backToMain() {
    chatModal.classList.add("hidden");
    wordleModal.classList.add("hidden");
    document.getElementById("pokemon-modal").classList.add("hidden");
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

/* --------------------------- */
/* POKEMON GAME MODULE */
/* ----------------------------- */

let pokemonNames = [];
let fullPokemonData = [];
let filteredList = [];
let currentPokemonName = "";
let currentPokemonSprite = "";

/* GENERATION RANGES */
const GEN_RANGES = {
    "Gen 1": [1, 151],
    "Gen 2": [152, 251],
    "Gen 3": [252, 386],
    "Gen 4": [387, 493],
    "Gen 5": [494, 649],
    "Gen 6": [650, 721],
    "Gen 7": [722, 809],
    "Gen 8": [810, 898],
    "Gen 9": [899, 1025]
};

/* LOAD ALL NAMES */
async function loadAllPokemonNames() {
    if (pokemonNames.length > 0) return;

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
    const data = await res.json();

    pokemonNames = data.results.map(p => p.name);
    fullPokemonData = data.results;
}

/* OPEN GAME */
function openPokemon() {
    document.getElementById("pokemon-modal").classList.remove("hidden");

    loadAllPokemonNames().then(() => {
        document.querySelector('.gen-row button:first-child').classList.add('active');
        loadPokemon();
    });

    const input = document.getElementById("pokemon-guess");
    input.addEventListener("input", spellingAssist);
}

// ---------------------------
// GENERATION FILTER
// ---------------------------
function setGeneration(gen) {
    document.querySelectorAll('.gen-row button').forEach(btn => btn.classList.remove('active'));

    if (gen === 'all') {
        filteredList = fullPokemonData;
        document.querySelector('.gen-row:nth-child(2) button:last-child').classList.add('active');
    } else {
        const start = GEN_RANGES[`Gen ${gen}`][0] - 1;
        const end = GEN_RANGES[`Gen ${gen}`][1];
        filteredList = fullPokemonData.slice(start, end);

        // Highlight the clicked gen
        const row = gen <= 5 ? 1 : 2;
        const index = gen <= 5 ? gen - 1 : gen - 6;
        document.querySelector(`.gen-row:nth-child(${row}) button:nth-child(${index + 1})`).classList.add('active');
    }
    loadPokemon();
}

/* LOAD RANDOM POKEMON */
async function loadPokemon() {
    const pool = filteredList.length ? filteredList : fullPokemonData;

    const choice = pool[Math.floor(Math.random() * pool.length)];
    const res = await fetch(choice.url);
    const data = await res.json();

    currentPokemonName = data.name;
    currentPokemonSprite = data.sprites.front_default;

    const img = document.getElementById("pokemon-silhouette");
    img.src = currentPokemonSprite;
    img.style.filter = "brightness(0)";

    document.getElementById("pokemon-feedback").textContent = "";
    document.getElementById("pokemon-guess").value = "";
    document.getElementById("pokemon-suggestions").style.display = "none";
}

/* GUESS */
function guessPokemon() {
    const guess = document.getElementById("pokemon-guess").value.trim().toLowerCase();
    if (!guess) return;

    const feedback = document.getElementById("pokemon-feedback");

    if (guess === currentPokemonName) {
        feedback.textContent = "🎉 Correct!";
        document.getElementById("pokemon-silhouette").style.filter = "none";

        setTimeout(loadPokemon, 1500);
    } else {
        feedback.textContent = "❌ Wrong. Try again!";
    }
}

/* HINT */
function giveHint() {
    const feedback = document.getElementById("pokemon-feedback");
    feedback.textContent = `Hint: Starts with \"${currentPokemonName[0].toUpperCase()}\"`;
}

// SPELLING ASSIST DROPDOWN
function spellingAssist() {
    const q = document.getElementById("pokemon-guess").value.toLowerCase();
    const list = document.getElementById("pokemon-suggestions");

    if (!q) { list.style.display = "none"; return; }

    const matches = pokemonNames
        .filter(n => n.startsWith(q))
        .slice(0, 12);

    list.innerHTML = "";
    matches.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        li.onclick = () => {
            document.getElementById("pokemon-guess").value = li.textContent;
            list.style.display = "none";
        };
        list.appendChild(li);
    });

    list.style.display = matches.length ? "block" : "none";
}

// Load input event listener
document.getElementById("pokemon-guess").addEventListener("input", spellingAssist);

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

// Elements
const boardEl = document.getElementById("game-board");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("game-message");

// ------------------------------
// Init board (30 tiles)
// ------------------------------
function initBoard() {
    boardEl.innerHTML = "";
    for (let i = 0; i < 30; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        const span = document.createElement("span");
        tile.appendChild(span);
        boardEl.appendChild(tile);
    }
}

// ------------------------------
// Init Keyboard
// ------------------------------
function initKeyboard() {
    keyboardEl.innerHTML = "";

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

        keyboardEl.appendChild(rowDiv);
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
        messageEl.textContent = "Not enough letters.";
        return;
    }

    const guess = currentGuess;
    guesses.push(guess);
    currentGuess = "";
    messageEl.textContent = "";

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
        messageEl.textContent = "🎉 You got it!";
    } else if (guesses.length === 6) {
        messageEl.textContent = `The word was: ${WORD}`;
    }
}

// ------------------------------
// Initialize on modal open
// ------------------------------
function initGame() {
    guesses = [];
    currentGuess = "";
    WORD = getWordOfTheDay();
    initBoard();
    initKeyboard();
    updateBoard();
}

function openWordle() {
    wordleModal.classList.remove("hidden");
    initGame();
}

// ——————————————————————
// DOTS — FINAL WORKING SCRIPT (MOBILE + DESKTOP)
// ——————————————————————

const mainGrid     = document.getElementById("main-grid");
const chatModal    = document.getElementById("chat-modal");
const chatList     = document.getElementById("chat-list");
const chatArea     = document.getElementById("chat-area");
const messages     = document.getElementById("messages");
const chatInput    = document.getElementById("chat-input");
const wordleModal  = document.getElementById("wordle-modal");

// ————— DOT CLICK HANDLER —————
document.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", () => {
        mainGrid.classList.add("hidden");
        const id = parseInt(dot.dataset.id);
        if (id === 1) openChat();
        else if (id === 11) openWordle();
        else if (id === 13) openPokemon();
        else {
            alert(`Dot ${id} coming soon`);
            backToMain();
        }
    });
});

// ————— CHAT SYSTEM —————
let threadNames = ["Bot", "Mom", "Alex"];
let threads = {};
let threadsData = {};
let currentThread = null;

function initChat() {
    const n = localStorage.getItem("threads_names");
    const t = localStorage.getItem("threads");
    const d = localStorage.getItem("threads_data");
    threadNames = n ? JSON.parse(n) : threadNames;
    threads = t ? JSON.parse(t) : {};
    threadsData = d ? JSON.parse(d) : {};
    threadNames.forEach(name => {
        if (!threads[name]) threads[name] = [];
        if (!threadsData[name]) threadsData[name] = { unread: 0 };
    });
    saveChat();
}
initChat();

function saveChat() {
    localStorage.setItem("threads_names", JSON.stringify(threadNames));
    localStorage.setItem("threads", JSON.stringify(threads));
    localStorage.setItem("threads_data", JSON.stringify(threadsData));
}

function renderChatList() {
    chatList.innerHTML = threadNames.map(name => {
        const last = threads[name][threads[name].length - 1];
        const preview = last ? (last.sender === "me" ? "You: " : "") + (last.text || "Voice") : "No messages";
        const unread = threadsData[name].unread > 0 ? `<div class="unread-badge">${threadsData[name].unread}</div>` : "";
        return `<div class="chat-thread-item ${threadsData[name].unread > 0 ? "unread" : ""}" onclick="openThread('${name}')">
            <div class="contact-dot" style="background:${strToColor(name)}">${name[0]}</div>
            <div class="thread-preview">
                <div class="thread-name">${name}</div>
                <div class="thread-last">${preview}</div>
            </div>
            ${unread}
        </div>`;
    }).join("");
}

function openChat() {
    chatModal.classList.remove("hidden");
    chatList.classList.remove("hidden");
    chatArea.classList.add("hidden");
    document.getElementById("chat-title").textContent = "Messages";
    renderChatList();
}

function openThread(name) {
    currentThread = name;
    threadsData[name].unread = 0;
    saveChat();
    document.getElementById("chat-title").textContent = name;
    chatList.classList.add("hidden");
    chatArea.classList.remove("hidden");
    messages.innerHTML = "";
    threads[name].forEach(msg => {
        const b = document.createElement("div");
        b.className = `bubble ${msg.sender === "me" ? "me" : "them"}`;
        b.textContent = msg.text || "Voice message";
        messages.appendChild(b);
    });
    messages.scrollTop = messages.scrollHeight;
    renderChatList();
}

function backToMain() {
    if (!chatArea.classList.contains("hidden")) {
        chatArea.classList.add("hidden");
        chatList.classList.remove("hidden");
        document.getElementById("chat-title").textContent = "Messages";
        renderChatList();
        return;
    }
    chatModal.classList.add("hidden");
    wordleModal.classList.add("hidden");
    document.getElementById("pokemon-modal").classList.add("hidden");
    mainGrid.classList.remove("hidden");
}

function createNewThread() {
    const name = prompt("Name:");
    if (name && !threadNames.includes(name)) {
        threadNames.push(name);
        threads[name] = [];
        threadsData[name] = { unread: 0 };
        saveChat();
        renderChatList();
    }
}

function sendMessage() {
    if (!chatInput.value.trim() || !currentThread) return;
    const msg = { text: chatInput.value, sender: "me", time: Date.now() };
    threads[currentThread].push(msg);
    const b = document.createElement("div");
    b.className = "bubble me";
    b.textContent = msg.text;
    messages.appendChild(b);
    chatInput.value = "";
    messages.scrollTop = messages.scrollHeight;
    saveChat();
    renderChatList();
}

function strToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${hash % 360}, 70%, 55%)`;
}

// ————— POKEMON GAME —————
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

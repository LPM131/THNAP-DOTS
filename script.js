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
// CHAT MODULE – FULLY UPGRADED
// ---------------------------

const threadNames = ["Bot", "Friend 1", "Friend 2"];
let threadsData = {};           // { name: { x, y, unread: 3 } }
let threads = {};               // { name: [{text, time, sender: "me"|"them", replyTo?, reactions:[]}] }
let currentThread = null;

// Load from localStorage
function loadChatData() {
    const pos = localStorage.getItem('dotPositions');
    const msg = localStorage.getItem('chatThreads');
    threadsData = pos ? JSON.parse(pos) : {};
    threads = msg ? JSON.parse(msg) : {};

    // Init missing threads
    threadNames.forEach(name => {
        if (!threadsData[name]) threadsData[name] = { x: Math.random()*200+50, y: Math.random()*400+50, unread: 0 };
        if (!threads[name]) threads[name] = [];
    });
    saveChatData();
}
loadChatData();

// Save everything
function saveChatData() {
    localStorage.setItem('dotPositions', JSON.stringify(threadsData));
    localStorage.setItem('chatThreads', JSON.stringify(threads));
}

// Render thread dots with unread badges
function renderThreadDots() {
    threadArea.innerHTML = `
        <div class="add-thread-dot">+</div>
        ${threadNames.map(name => {
            const t = threadsData[name];
            const unread = t.unread > 0 ? `<span class="unread-badge">${t.unread}</span>` : '';
            return `<div class="thread-dot" data-name="${name}" style="left:${t.x}px;top:${t.y}px;">
                        ${name[0]}${unread}
                    </div>`;
        }).join('')}
    `;

    // Draggable + long-press delete
    document.querySelectorAll('.thread-dot').forEach(dot => {
        const name = dot.dataset.name;
        makeDraggable(dot, name);
        addLongPress(dot, () => confirmDeleteThread(name));
    });

    document.querySelector('.add-thread-dot')?.addEventListener('click', createNewThread);
}

// ─────── PERFECT DRAG + CLICK (works on phone & desktop) ───────
function makeDraggable(el, name) {
    let pos = { x: threadsData[name].x, y: threadsData[name].y };
    let isDragging = false;
    let startX, startY;

    const move = (clientX, clientY) => {
        if (!isDragging) return;
        const rect = threadArea.getBoundingClientRect();
        pos.x = clientX - rect.left - 35;
        pos.y = clientY - rect.top - 35;

        // Keep inside bounds
        pos.x = Math.max(0, Math.min(pos.x, rect.width - 70));
        pos.y = Math.max(0, Math.min(pos.y, rect.height - 70));

        el.style.left = pos.x + 'px';
        el.style.top = pos.y + 'px';
    };

    const startDrag = (e) => {
        e.preventDefault();
        isDragging = false;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;

        const onMove = (e) => {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const delta = Math.hypot(clientX - startX, clientY - startY);
            if (delta > 10) isDragging = true; // 10px threshold = real drag
            move(clientX, clientY);
        };

        const onEnd = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchend', onEnd);

            if (isDragging) {
                threadsData[name].x = pos.x;
                threadsData[name].y = pos.y;
                saveChatData();
            }
            // if NOT dragged → it's a click → open thread
            else if (!isDragging) {
                openThread(name);
            }
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    };

    el.addEventListener('mousedown', startDrag);
    el.addEventListener('touchstart', startDrag, { passive: false });
}

// Long press handler
function addLongPress(el, callback) {
    let timer;
    el.addEventListener('mousedown', () => timer = setTimeout(callback, 800));
    el.addEventListener('touchstart', () => timer = setTimeout(callback, 800));
    el.addEventListener('mouseup', () => clearTimeout(timer));
    el.addEventListener('touchend', () => clearTimeout(timer));
}

// Open thread
function openThread(name) {
    currentThread = name;
    threadsData[name].unread = 0;
    saveChatData();
    renderThreadDots();

    threadArea.classList.add("hidden");
    chatArea.classList.remove("hidden");
    messages.innerHTML = `<div class="thread-header">${name} <span id="typing"></span></div>`;

    threads[name].forEach(msg => addMessageBubble(msg));
    messages.scrollTop = messages.scrollHeight;

    // Simulate replies for Bot only
    if (name === "Bot") setTimeout(simulateBotReply, 2000);
}

// Add message bubble
function addMessageBubble(msg) {
    const bubble = document.createElement("div");
    bubble.className = `bubble ${msg.sender}`;
    if (msg.replyTo) bubble.classList.add('reply');

    bubble.innerHTML = `
        ${msg.replyTo ? `<div class="reply-to">↳ ${msg.replyTo}</div>` : ''}
        <div class="text">${msg.text}</div>
        <div class="time">${formatTime(msg.time)}</div>
    `;

    // Reactions
    if (msg.reactions?.length) {
        const reacts = document.createElement("div");
        reacts.className = "reactions";
        reacts.textContent = msg.reactions.join('');
        bubble.appendChild(reacts);
    }

    // Long press → react
    addLongPress(bubble, () => showReactionPicker(bubble, msg));

    // Swipe to reply
    let startX;
    bubble.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    bubble.addEventListener('touchend', e => {
        if (startX && Math.abs(e.changedTouches[0].clientX - startX) > 80) {
            replyToMessage(msg.text);
        }
    });

    messages.appendChild(bubble);
}

// Send message
let replyingTo = null;
function sendMessage() {
    if (!chatInput.value.trim()) return;

    const msg = {
        text: chatInput.value,
        time: new Date(),
        sender: "me",
        replyTo: replyingTo,
        reactions: []
    };

    threads[currentThread].push(msg);
    addMessageBubble(msg);
    chatInput.value = "";
    replyingTo = null;
    updateReplyBanner();
    messages.scrollTop = messages.scrollHeight;

    // Typing indicator + fake reply
    showTyping();
    if (currentThread === "Bot") setTimeout(simulateBotReply, 1500 + Math.random()*2000);

    saveChatData();
}

// Simulate bot reply
function simulateBotReply() {
    if (currentThread !== "Bot") return;
    const replies = ["haha yes", "true", "omg", "exactly", "wait what??", "🤯", "no way"];
    const msg = {
        text: replies[Math.floor(Math.random()*replies.length)],
        time: new Date(),
        sender: "them",
        reactions: []
    };
    threads.Bot.push(msg);
    if (chatArea.classList.contains("hidden")) threadsData.Bot.unread++;
    else addMessageBubble(msg);
    renderThreadDots();
    saveChatData();
}

// Typing indicator
function showTyping() {
    const typing = document.getElementById("typing");
    typing.textContent = "typing…";
    setTimeout(() => typing.textContent = "", 2000);
}

// Reply banner
function updateReplyBanner() {
    let banner = document.getElementById("reply-banner");
    if (!replyingTo && banner) banner.remove();
}
function replyToMessage(text) {
    replyingTo = text;
    let banner = document.createElement("div");
    banner.id = "reply-banner";
    banner.innerHTML = `↳ Replying to "${text}" <span onclick="replyingTo=null;updateReplyBanner()">×</span>`;
    chatArea.querySelector(".input-section").before(banner);
}

// Reaction picker
function showReactionPicker(bubble, msg) {
    const picker = document.createElement("div");
    picker.className = "reaction-picker";
    "❤️😂😮👍👎🎉".split('').forEach(emoji => {
        const btn = document.createElement("button");
        btn.textContent = emoji;
        btn.onclick = () => {
            msg.reactions = msg.reactions || [];
            if (!msg.reactions.includes(emoji)) msg.reactions.push(emoji);
            saveChatData();
            bubble.querySelector('.reactions')?.remove();
            const reacts = document.createElement("div");
            reacts.className = "reactions";
            reacts.textContent = msg.reactions.join('');
            bubble.appendChild(reacts);
            picker.remove();
        };
        picker.appendChild(btn);
    });
    bubble.appendChild(picker);
}

// New thread
function createNewThread() {
    const name = prompt("New chat name:");
    if (!name) return;
    threadNames.push(name);
    threads[name] = [];
    threadsData[name] = { x: 100, y: 200, unread: 0 };
    saveChatData();
    renderThreadDots();
}

// Delete thread
function confirmDeleteThread(name) {
    if (confirm(`Delete chat with ${name}?`)) {
        delete threads[name];
        delete threadsData[name];
        threadNames.splice(threadNames.indexOf(name), 1);
        saveChatData();
        renderThreadDots();
    }
}

// Utils
function formatTime(date) {
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return d.toLocaleDateString();
}

// Open chat → refresh
function openChat() {
    chatModal.classList.remove("hidden");
    renderThreadDots();
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

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

// ←←← THE MAGIC BACK BUTTON ←←←
function backToMain() {
    // If we're inside a chat → go back to floating dots
    if (!chatArea.classList.contains("hidden")) {
        chatArea.classList.add("hidden");
        threadArea.classList.remove("hidden");
        document.getElementById("chat-title").textContent = "Chats";
        renderThreadDots();
        return;
    }

    // If we're already in thread list → exit to main grid
    if (!threadArea.classList.contains("hidden")) {
        chatModal.classList.add("hidden");
        mainGrid.classList.remove("hidden");
        return;
    }

    // Fallback: any other modal
    chatModal.classList.add("hidden");
    wordleModal.classList.add("hidden");
    document.getElementById("pokemon-modal").classList.add("hidden");
    mainGrid.classList.remove("hidden");
}


// ---------------------------
// CHAT MODULE – BULLETPROOF VERSION
// ---------------------------

const threadNames = ["Bot", "Friend 1", "Friend 2"];
let threadsData = {};
let threads = {};
let currentThread = null;

// Load from localStorage
function loadChatData() {
    try {
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
        console.log("Chat data loaded:", threadsData); // DEBUG
    } catch (e) {
        console.error("Load error:", e); // DEBUG
    }
}
loadChatData();

// Save everything
function saveChatData() {
    try {
        localStorage.setItem('dotPositions', JSON.stringify(threadsData));
        localStorage.setItem('chatThreads', JSON.stringify(threads));
    } catch (e) {
        console.error("Save error:", e);
    }
}

// Render thread dots with unread badges
function renderThreadDots() {
    threadArea.innerHTML = `
        <div class="add-thread-dot" style="bottom:30px;right:30px;">+</div>
        ${threadNames.map(name => {
            const t = threadsData[name];
            const unread = t.unread > 0 ? `<span class="unread-badge">${t.unread > 99 ? '99+' : t.unread}</span>` : '';
            return `<div class="thread-dot" data-name="${name}" style="left:${t.x}px;top:${t.y}px;">
                        ${name[0].toUpperCase()}${unread}
                    </div>`;
        }).join('')}
    `;

    // Bind events AFTER render
    setTimeout(() => {  // Tiny delay = DOM ready
        document.querySelectorAll('.thread-dot').forEach(dot => {
            const name = dot.dataset.name;
            console.log("Binding dot:", name); // DEBUG
            makeDraggable(dot, name);
            addLongPress(dot, () => confirmDeleteThread(name));
        });

        const addDot = document.querySelector('.add-thread-dot');
        if (addDot) addDot.addEventListener('click', createNewThread);
    }, 50);
}

// ─────── FIXED DRAG (15px threshold + click fallback) ───────
function makeDraggable(el, name) {
    let startPos = { x: 0, y: 0 };
    let currentPos = { x: threadsData[name].x, y: threadsData[name].y };
    let isDragging = false;

    const getEventPos = (e) => ({
        x: e.touches ? e.touches[0].clientX : e.clientX,
        y: e.touches ? e.touches[0].clientY : e.clientY
    });

    const startDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getEventPos(e);
        startPos = pos;
        isDragging = false;

        console.log("Drag start on", name); // DEBUG

        const onMove = (e) => {
            e.preventDefault();
            const pos = getEventPos(e);
            const delta = Math.hypot(pos.x - startPos.x, pos.y - startPos.y);

            if (delta > 15) {  // 15px = real drag
                isDragging = true;
                const rect = threadArea.getBoundingClientRect();
                currentPos.x = Math.max(0, Math.min(pos.x - rect.left - 35, rect.width - 70));
                currentPos.y = Math.max(0, Math.min(pos.y - rect.top - 35, rect.height - 70));

                el.style.left = currentPos.x + 'px';
                el.style.top = currentPos.y + 'px';
            }
        };

        const onEnd = (e) => {
            e.preventDefault();
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('touchmove', onMove, { passive: false });
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchend', onEnd);

            if (isDragging) {
                threadsData[name].x = currentPos.x;
                threadsData[name].y = currentPos.y;
                saveChatData();
                console.log("Drag saved for", name, currentPos); // DEBUG
            } else {
                // NO DRAG = CLICK → open thread
                console.log("TAP DETECTED on", name); // DEBUG
                openThread(name);
            }
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    };

    // Bind events
    el.addEventListener('mousedown', startDrag, { passive: false });
    el.addEventListener('touchstart', startDrag, { passive: false });
}

// ─────── FIXED LONG-PRESS (separate from drag) ───────
function addLongPress(el, callback) {
    let timer;
    let pressPos = { x: 0, y: 0 };

    const startPress = (e) => {
        const pos = getEventPos(e);  // Reuse from above
        pressPos = pos;
        timer = setTimeout(() => {
            const delta = Math.hypot(e.clientX - pressPos.x, e.clientY - pressPos.y);
            if (delta < 10) {  // Still finger on spot
                callback();
                console.log("LONG-PRESS on", el.dataset.name); // DEBUG
            }
        }, 1000);  // 1 second
    };

    const endPress = (e) => {
        clearTimeout(timer);
    };

    el.addEventListener('mousedown', startPress);
    el.addEventListener('touchstart', startPress, { passive: false });
    el.addEventListener('mouseup', endPress);
    el.addEventListener('touchend', endPress);
    el.addEventListener('mouseleave', endPress);  // Mouse wander
}

function openThread(name) {
    currentThread = name;
    threadsData[name].unread = 0;
    saveChatData();

    document.getElementById("chat-title").textContent = name;  // ← Title becomes contact name

    threadArea.classList.add("hidden");
    chatArea.classList.remove("hidden");
    messages.innerHTML = `<div id="typing"></div>`;

    threads[name].forEach(msg => addMessageBubble(msg));
    messages.scrollTop = messages.scrollHeight;

    if (name === "Bot") setTimeout(simulateBotReply, 2000);
}

function addMessageBubble(msg) {
    const bubble = document.createElement("div");
    bubble.className = `bubble ${msg.sender}`;
    if (msg.replyTo) bubble.classList.add('reply');

    bubble.innerHTML = `
        ${msg.replyTo ? `<div class="reply-to">↳ ${msg.replyTo}</div>` : ''}
        <div class="text">${msg.text}</div>
        <div class="time">${formatTime(msg.time)}</div>
    `;

    if (msg.reactions?.length) {
        const reacts = document.createElement("div");
        reacts.className = "reactions";
        reacts.textContent = msg.reactions.join('');
        bubble.appendChild(reacts);
    }

    addLongPress(bubble, () => showReactionPicker(bubble, msg));

    let startX;
    bubble.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    bubble.addEventListener('touchend', e => {
        if (startX && Math.abs(e.changedTouches[0].clientX - startX) > 80) {
            replyToMessage(msg.text);
        }
    });

    messages.appendChild(bubble);
}

let replyingTo = null;
function sendMessage() {
    if (!chatInput.value.trim() || !currentThread) return;

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

    showTyping();
    if (currentThread === "Bot") setTimeout(simulateBotReply, 1500 + Math.random()*2000);

    saveChatData();
}

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

function showTyping() {
    const typing = document.getElementById("typing");
    if (typing) {
        typing.textContent = "typing…";
        setTimeout(() => typing.textContent = "", 2000);
    }
}

function updateReplyBanner() {
    let banner = document.getElementById("reply-banner");
    if (!replyingTo && banner) banner.remove();
}
function replyToMessage(text) {
    replyingTo = text;
    let banner = document.getElementById("reply-banner");
    if (banner) banner.remove();
    banner = document.createElement("div");
    banner.id = "reply-banner";
    banner.innerHTML = `↳ Replying to "${text}" <span onclick="replyingTo=null;updateReplyBanner()">×</span>`;
    chatArea.querySelector(".input-section").before(banner);
}

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
            const reacts = bubble.querySelector('.reactions');
            if (reacts) reacts.textContent = msg.reactions.join('');
            else {
                const newReacts = document.createElement("div");
                newReacts.className = "reactions";
                newReacts.textContent = msg.reactions.join('');
                bubble.appendChild(newReacts);
            }
            picker.remove();
        };
        picker.appendChild(btn);
    });
    bubble.appendChild(picker);
}

function createNewThread() {
    const name = prompt("New chat name:");
    if (!name || threadNames.includes(name)) return;
    threadNames.push(name);
    threads[name] = [];
    threadsData[name] = { x: 100, y: 200, unread: 0 };
    saveChatData();
    renderThreadDots();
}

function confirmDeleteThread(name) {
    if (confirm(`Delete chat with ${name}?`)) {
        delete threads[name];
        delete threadsData[name];
        const idx = threadNames.indexOf(name);
        if (idx > -1) threadNames.splice(idx, 1);
        saveChatData();
        renderThreadDots();
    }
}

function formatTime(date) {
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return d.toLocaleDateString();
}

function openChat() {
    chatModal.classList.remove("hidden");
    // Always start at thread list
    threadArea.classList.remove("hidden");
    chatArea.classList.add("hidden");
    document.getElementById("chat-title").textContent = "Chats";
    renderThreadDots();
}

function openThread(name) {
    currentThread = name;
    threadsData[name].unread = 0;
    saveChatData();

    document.getElementById("chat-title").textContent = name;  // ← Title becomes contact name

    threadArea.classList.add("hidden");
    chatArea.classList.remove("hidden");
    messages.innerHTML = `<div id="typing"></div>`;

    threads[name].forEach(msg => addMessageBubble(msg));
    messages.scrollTop = messages.scrollHeight;

    if (name === "Bot") setTimeout(simulateBotReply, 2000);
}

// Add this helper (used in long-press)
function getEventPos(e) {
    return {
        x: e.touches ? e.touches[0].clientX : e.clientX,
        y: e.touches ? e.touches[0].clientY : e.clientY
    };
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

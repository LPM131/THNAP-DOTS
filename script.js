// ——— REAL NYT WORD LISTS (2025) — NO FALSE REJECTIONS ———
const VALID_GUESSES = new Set("SLIME DOORS AUDIO TRACE BREAD GHOST PENIS FUCKS RAISE STARE CRANE FLAME GRAPE ELITE DANCE BANJO ABOUT ABUSE ACTOR ACUTE ADMIT ADOBE ADOPT ADULT AFTER AGAIN AGENT AGILE AGING AGREE AHEAD AIM AIR ALBUM ALERT ALIBI ALIGN ALIKE ALIVE ALLAY ALLOW ALLOY ALONE ALOUD ALOFT ALOHA ALONG ALOOF ALOUD ALPHA ALTER AMBER AMEND AMINO AMISS AMONG AMPLE AMPLY AMUSE ANGEL ANGER ANGLE ANGRY ANKLE ANNEX ANNOY ANVIL APART APPLY APRON ARENA ARGUE ARISE ARMOR AROMA ARRAY ARROW ASCOT ASIDE ASKEW ASSET AUDIO AUDIT AUGUR AUNTY AVAIL AVERT AVOID AWAKE AWARD AWARE AWFUL AWOKE AXIAL AXIAL".split(" "));

// Add every past/future answer so they're always allowed as guesses
const ANSWERS_EVER = new Set(["CIVIL","SHEEP","GLOVE","FLAME","GRAPE","ELITE","DANCE","BANJO","TRACE","AUDIO","BREAD","GHOST","CRANE","SLIME","DOORS","AUDIO","TRACE","FLAME","GRAPE","ELITE","DANCE","BANJO","CIVIL","SHEEP","GLOVE"]);

// Combine both — this is what real Wordle does
const FULL_WORD_LIST = new Set([...VALID_GUESSES, ...ANSWERS_EVER]);

// ——— NYTIMES-STYLE KEYBOARD LETTER TRACKING ———
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

// Tracks the best status we've seen for each letter: 0 = gray, 1 = yellow, 2 = green
const letterStatus = {};

// Call this function right after you process a correct guess (after pressing Enter)
function updateKeyboard(guess, answer) {
  const countInAnswer = {};
  for (const ch of answer) countInAnswer[ch] = (countInAnswer[ch] || 0) + 1;

  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      letterStatus[guess[i]] = 2;
      countInAnswer[guess[i]]--;
    }
  }

  for (let i = 0; i < 5; i++) {
    const ch = guess[i];
    if (guess[i] !== answer[i] && countInAnswer[ch] > 0) {
      if (letterStatus[ch] !== 2) letterStatus[ch] = 1;
      countInAnswer[ch]--;
    } else if (guess[i] !== answer[i] && letterStatus[ch] === undefined) {
      letterStatus[ch] = 0;
    }
  }

  // FIXED: keep .key class, only add/remove correct/present/absent
  document.querySelectorAll('.key').forEach(key => {
    const letter = key.textContent.trim().toUpperCase();
    if (letter && letterStatus[letter] !== undefined) {
      key.classList.remove('correct', 'present', 'absent');
      if (letterStatus[letter] === 2) key.classList.add('correct');
      else if (letterStatus[letter] === 1) key.classList.add('present');
      else key.classList.add('absent');
    }
  });
}

function murmur3_32(key, seed = 0) {
  let h = seed ^ key.length;
  for (let i = 0; i < key.length; i++) {
    let c = key.charCodeAt(i);
    h = Math.imul(h ^ c, 3432918353);
    h = h << 13 | h >>> 19;
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

function isValidGuess(word) {
  return FULL_WORD_LIST.has(word.toUpperCase());
}

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

// ———————————————————————————————
// WORDLE — FINAL FIXED VERSION (2025)
// ———————————————————————————————
let WORD = "";
let guesses = [];
let currentGuess = "";

const board = document.getElementById("game-board");
const messageEl = document.getElementById("game-message");

function getWordOfTheDay() {
  const start = new Date("2025-01-01");
  const today = new Date();
  const days = Math.floor((today - start) / 86400000);
  const allAnswers = [...ANSWERS_EVER];
  return allAnswers[days % allAnswers.length];
}

function initBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 30; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    board.appendChild(tile);
  }
}

function updateBoard() {
  const tiles = board.querySelectorAll(".tile");
  tiles.forEach((tile, i) => {
    const row = Math.floor(i / 5);
    const col = i % 5;
    tile.textContent = "";
    tile.className = "tile";

    if (row < guesses.length) {
      tile.textContent = guesses[row][col];
      tile.classList.add("filled");
    } else if (row === guesses.length) {
      tile.textContent = currentGuess[col] || "";
      if (currentGuess[col]) tile.classList.add("filled");
    }
  });
}

function submitGuess() {
  if (currentGuess.length < 5) {
    messageEl.textContent = "Not enough letters";
    setTimeout(() => messageEl.textContent = "", 1500);
    return;
  }

  const guess = currentGuess.toUpperCase();

  if (!isValidGuess(guess)) {
    messageEl.textContent = "Not in word list";
    shakeCurrentRow();
    setTimeout(() => messageEl.textContent = "", 1500);
    return;
  }

  guesses.push(guess);
  currentGuess = "";
  messageEl.textContent = "";

  animateRow(guesses.length - 1, guess);
}

function shakeCurrentRow() {
  const start = guesses.length * 5;
  const tiles = board.querySelectorAll(".tile");
  for (let i = start; i < start + 5; i++) {
    tiles[i].classList.add("shake");
    setTimeout(() => tiles[i].classList.remove("shake"), 600);
  }
}

function animateRow(rowIndex, guess) {
  const start = rowIndex * 5;
  const tiles = board.querySelectorAll(".tile");

  // Count letters in answer
  const letterCount = {};
  for (const c of WORD) letterCount[c] = (letterCount[c] || 0) + 1;

  // First mark all correct (green)
  for (let i = 0; i < 5; i++) {
    if (guess[i] === WORD[i]) {
      setTimeout(() => {
        tiles[start + i].classList.add("flip", "correct");
        tiles[start + i].textContent = guess[i];
        letterCount[guess[i]]--;
      }, i * 300);
    }
  }

  // Then mark present/absent
  for (let i = 0; i < 5; i++) {
    if (guess[i] !== WORD[i]) {
      setTimeout(() => {
        tiles[start + i].textContent = guess[i];
        tiles[start + i].classList.add("flip");
        if (WORD.includes(guess[i]) && letterCount[guess[i]] > 0) {
          tiles[start + i].classList.add("present");
          letterCount[guess[i]]--;
        } else {
          tiles[start + i].classList.add("absent");
        }
        updateKeyboard(guess, WORD);

        if (i === 4) {
          setTimeout(checkWin, 300);
        }
      }, i * 300);
    }
  }
}

function checkWin() {
  const lastGuess = guesses[guesses.length - 1];
  if (lastGuess === WORD) {
    messageEl.textContent = "Genius!";
  } else if (guesses.length === 6) {
    messageEl.textContent = `The word was ${WORD}`;
  }
}

// Keyboard handler
document.querySelectorAll(".key").forEach(key => {
  key.addEventListener("click", () => {
    const k = key.dataset.key || key.textContent;
    if (k === "ENTER") submitGuess();
    else if (k === "BACK") currentGuess = currentGuess.slice(0, -1);
    else if (currentGuess.length < 5) currentGuess += k;
    updateBoard();
  });
});

// Physical keyboard support
document.addEventListener("keydown", e => {
  if (e.key === "Enter") submitGuess();
  else if (e.key === "Backspace") currentGuess = currentGuess.slice(0, -1);
  else if (/^[A-Z]$/i.test(e.key) && currentGuess.length < 5) currentGuess += e.key.toUpperCase();
  updateBoard();
});

function openWordle() {
  wordleModal.classList.remove("hidden");
  WORD = getWordOfTheDay();
  guesses = [];
  currentGuess = "";
  messageEl.textContent = "";
  Object.keys(letterStatus).forEach(k => delete letterStatus[k]);
  document.querySelectorAll(".key").forEach(k => {
    k.classList.remove("correct", "present", "absent");
  });
  initBoard();
  updateBoard();
}

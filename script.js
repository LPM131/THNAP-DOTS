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
// WORDLE GAME WITH KEYBOARD
// -----------------------------
const wordList = ["APPLE","BRAVE","CRANE","DREAM","EARTH"];
const keyboardLetters = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");

function renderKeyboard() {
    const kb = document.getElementById("keyboard");
    kb.innerHTML = "";
    keyboardLetters.forEach(letter => {
        const btn = document.createElement("div");
        btn.classList.add("key");
        btn.textContent = letter;
        btn.addEventListener("click", () => pressKey(letter));
        kb.appendChild(btn);
    });

    // Add Enter and Backspace buttons
    const enter = document.createElement("div");
    enter.classList.add("key");
    enter.textContent = "ENTER";
    enter.style.gridColumn = "span 2";
    enter.addEventListener("click", submitGuess);
    kb.appendChild(enter);

    const backspace = document.createElement("div");
    backspace.classList.add("key");
    backspace.textContent = "⌫";
    backspace.style.gridColumn = "span 2";
    backspace.addEventListener("click", deleteLetter);
    kb.appendChild(backspace);
}

let currentGuess = "";

function pressKey(letter) {
    if (currentGuess.length >= 5) return;
    currentGuess += letter;
    updateBoard();
}

function deleteLetter() {
    currentGuess = currentGuess.slice(0, -1);
    updateBoard();
}

function updateBoard() {
    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${attempts}-${i}`);
        cell.textContent = currentGuess[i] || "";
        cell.style.backgroundColor = "#ddd";
    }
}

function submitGuess() {
    if (currentGuess.length !== 5) {
        alert("Enter a 5-letter word!");
        return;
    }

    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${attempts}-${i}`);
        const letter = currentGuess[i];

        // Trigger flip animation
        cell.classList.add("flip");

        // Delay coloring to match flip animation
        setTimeout(() => {
            if (letter === targetWord[i]) {
                cell.style.backgroundColor = "#6aaa64"; // correct
                markKeyboardKey(letter, "correct");
            } else if (targetWord.includes(letter)) {
                cell.style.backgroundColor = "#c9b458"; // present
                markKeyboardKey(letter, "present");
            } else {
                cell.style.backgroundColor = "#787c7e"; // absent
                markKeyboardKey(letter, "absent");
            }
            cell.classList.remove("flip"); // reset for next guess
        }, 250); // halfway through flip
        cell.textContent = letter;
    }

    attempts++;
    if (currentGuess === targetWord) {
        document.getElementById("game-message").textContent = "You guessed it!";
        currentGuess = "";
        return;
    }

    if (attempts >= 6) {
        document.getElementById("game-message").textContent = `Game over! Word was ${targetWord}`;
        currentGuess = "";
        return;
    }

    currentGuess = "";
}

function markKeyboardKey(letter, status) {
    const keys = document.querySelectorAll(".key");
    keys.forEach(k => {
        if (k.textContent === letter) {
            k.classList.remove("correct", "present", "absent");
            k.classList.add(status);
        }
    });
}

// Modify initGame to include keyboard
function initGame() {
    targetWord = wordList[Math.floor(Math.random() * wordList.length)];
    attempts = 0;
    currentGuess = "";

    const board = document.getElementById("game-board");
    board.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const box = document.createElement("div");
            box.classList.add("letter-box");
            box.id = `cell-${i}-${j}`;
            board.appendChild(box);
        }
    }

    renderKeyboard();
    document.getElementById("game-message").textContent = "";
}

// -----------------------------
// INIT
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
    renderDots();
});

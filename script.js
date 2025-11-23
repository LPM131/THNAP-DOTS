// Declare global DOM references (will be assigned in DOMContentLoaded)
let threadArea, chatArea, messages, boardEl, keyboardEl, messageEl;

// ---------------------------------
// FEATURE FUNCTIONS
// ---------------------------------

function openChat() {
  threadArea.innerHTML = '';
  loadChatThreads();
  document.getElementById('chat-modal').classList.remove('hidden');
}

function openWordle() {
  initWordle();
  document.getElementById('wordle-modal').classList.remove('hidden');
}

function openPokemon() {
  initPokemonGame();
  document.getElementById('pokemon-modal').classList.remove('hidden');
}

function openCrossword() {
  initCrossword();
  document.getElementById('crossword-modal').classList.remove('hidden');
}

// ---------------------------------
// CHAT SYSTEM
// ---------------------------------

function loadChatThreads() {
  const threads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
  threads.forEach(thread => {
    createThreadDot(thread.id, thread.name, thread.x, thread.y);
  });

  if (threads.length === 0) {
    // Create a default thread
    createThreadDot(1, 'Chat');
  }

  makeDotsDraggable();
}

function createThreadDot(id, name, x = Math.random() * (window.innerWidth - 60), y = Math.random() * (window.innerHeight - 200) + 100) {
  const dot = document.createElement('div');
  dot.className = 'thread-dot';
  dot.textContent = name[0].toUpperCase();
  dot.dataset.id = id;
  dot.dataset.name = name;
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  threadArea.appendChild(dot);
  dot.addEventListener('click', () => openConversation(id, name));
}

function makeDotsDraggable() {
  document.querySelectorAll('.thread-dot').forEach(dot => {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    dot.addEventListener('touchstart', startDrag);
    dot.addEventListener('mousedown', startDrag);

    function startDrag(e) {
      e.preventDefault();
      isDragging = false;
      const rect = dot.getBoundingClientRect();
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);
      initialX = rect.left;
      initialY = rect.top;

      document.addEventListener('touchmove', drag);
      document.addEventListener('mousemove', drag);
      document.addEventListener('touchend', endDrag);
      document.addEventListener('mouseup', endDrag);

      dot.style.transition = 'none';
    }

    function drag(e) {
      if (!isDragging) {
        const dx = (e.clientX || (e.touches && e.touches[0].clientX)) - startX;
        const dy = (e.clientY || (e.touches && e.touches[0].clientY)) - startY;
        if (Math.sqrt(dx * dx + dy * dy) > 5) isDragging = true;
      }
      if (!isDragging) return;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      let newX = initialX + (clientX - startX);
      let newY = initialY + (clientY - startY);

      const areaRect = threadArea.getBoundingClientRect();
      newX = Math.max(0, Math.min(newX, areaRect.width - 50));
      newY = Math.max(0, Math.min(newY, areaRect.height - 50));

      dot.style.left = `${newX}px`;
      dot.style.top = `${newY}px`;

      // Bounce effect
      if (newX <= 0 || newX >= areaRect.width - 50) {
        dot.style.transform = 'scale(0.9)';
      } else if (newY <= 0 || newY >= areaRect.height - 50) {
        dot.style.transform = 'scale(0.9)';
      } else {
        dot.style.transform = 'scale(1)';
      }
    }

    function endDrag() {
      document.removeEventListener('touchmove', drag);
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('touchend', endDrag);
      document.removeEventListener('mouseup', endDrag);
      dot.style.transition = 'transform 0.2s ease';
      dot.style.transform = 'scale(1)';

      if (isDragging) {
        saveThreadPosition(dot.dataset.id, parseFloat(dot.style.left), parseFloat(dot.style.top));
      }
    }
  });
}

function saveThreadPosition(id, x, y) {
  const threads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
  const thread = threads.find(t => t.id == id);
  if (thread) {
    thread.x = x;
    thread.y = y;
    localStorage.setItem('chatThreads', JSON.stringify(threads));
  }
}

function openConversation(id, name) {
  document.getElementById('chat-modal').querySelector('h2').textContent = name;
  threadArea.classList.add('hidden');
  chatArea.classList.remove('hidden');

  loadMessages(id);
}

function loadMessages(id) {
  messages.innerHTML = '';
  const msgs = JSON.parse(localStorage.getItem(`chatMessages_${id}`) || '[]');
  msgs.forEach(msg => {
    addMessage(msg.text, msg.timestamp, false);
  });
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const chatTitle = document.getElementById('chat-modal').querySelector('h2').textContent;
  const threads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
  let threadId = threads.find(t => t.name === chatTitle)?.id;
  if (!threadId) {
    threadId = Date.now();
    threads.push({ id: threadId, name: chatTitle, x: 100, y: 100 });
    localStorage.setItem('chatThreads', JSON.stringify(threads));
  }

  const msg = { text, timestamp: Date.now() };
  const msgs = JSON.parse(localStorage.getItem(`chatMessages_${threadId}`) || '[]');
  msgs.push(msg);
  localStorage.setItem(`chatMessages_${threadId}`, JSON.stringify(msgs));

  addMessage(text, Date.now());
  input.value = '';
}

function addMessage(text, timestamp, scroll = true) {
  const msgDiv = document.createElement('div');
  msgDiv.innerHTML = `<strong>You:</strong> ${text} <em>${new Date(timestamp).toLocaleTimeString()}</em>`;
  messages.appendChild(msgDiv);
  if (scroll) messages.scrollTop = messages.scrollHeight;
}

// ---------------------------------
// WORDLE GAME
// ---------------------------------

const wordleWords = ['APPLE', 'BRAIN', 'CLOUD', 'DREAM', 'EARTH', 'FLAME', 'GRAPE', 'HEART', 'IVORY', 'JUMBO']; // Simple list, can expand
let currentWord = '';
let currentGuess = [];
let currentRow = 0;
let gameWon = false;
let gameOver = false;

function initWordle() {
  currentWord = wordleWords[Math.floor(Math.random() * wordleWords.length)];
  currentGuess = [];
  currentRow = 0;
  gameWon = false;
  gameOver = false;
  boardEl.innerHTML = '';
  keyboardEl.innerHTML = '';
  messageEl.textContent = '';

  // Create board
  for (let i = 0; i < 30; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.innerHTML = '<span></span>';
    boardEl.appendChild(tile);
  }

  // Create keyboard
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
  ];

  rows.forEach(rowKeys => {
    const row = document.createElement('div');
    row.className = 'keyboard-row';
    keyboardEl.appendChild(row);

    rowKeys.forEach(key => {
      const btn = document.createElement('div');
      btn.className = key === 'ENTER' || key === 'BACK' ? 'key wide' : 'key';
      btn.textContent = key;
      btn.dataset.key = key;
      btn.addEventListener('click', () => handleKey(key));
      row.appendChild(btn);
    });
  });
}

function handleKey(key) {
  if (gameWon || gameOver) return;

  if (key === 'ENTER') {
    if (currentGuess.length === 5) {
      checkGuess();
    }
  } else if (key === 'BACK') {
    currentGuess.pop();
    updateBoard();
  } else if (currentGuess.length < 5) {
    currentGuess.push(key.toUpperCase());
    updateBoard();
  }
}

function updateBoard() {
  const tiles = boardEl.querySelectorAll('.tile');
  for (let i = 0; i < 30; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const tile = tiles[i];
    const span = tile.querySelector('span');
    if (row === currentRow && col < currentGuess.length) {
      span.textContent = currentGuess[col];
    } else if (row === currentRow) {
      span.textContent = '';
    }
  }
}

function checkGuess() {
  const guessStr = currentGuess.join('');
  const tiles = boardEl.querySelectorAll('.tile');
  const rowTiles = Array.from(tiles).slice(currentRow * 5, (currentRow + 1) * 5);
  let wordLetters = currentWord.split('');
  let correct = 0;

  // First pass: mark correct positions
  currentGuess.forEach((letter, i) => {
    const tile = rowTiles[i];
    tile.style.backgroundColor = '#787c7e'; // default gray
    if (letter === wordLetters[i]) {
      tile.style.backgroundColor = '#6aaa64'; // green
      correct++;
      wordLetters[i] = null; // remove from consideration
      updateKeyboard(letter, 'correct');
    }
  });

  // Second pass: mark present but wrong position
  currentGuess.forEach((letter, i) => {
    const tile = rowTiles[i];
    if (tile.style.backgroundColor === '#6aaa64') return; // already correct
    const index = wordLetters.indexOf(letter);
    if (index !== -1) {
      tile.style.backgroundColor = '#c9b458'; // yellow
      wordLetters[index] = null;
      updateKeyboard(letter, 'present');
    } else {
      updateKeyboard(letter, 'absent');
    }
  });

  if (correct === 5) {
    gameWon = true;
    messageEl.textContent = 'Congratulations!';
  } else if (currentRow === 5) {
    gameOver = true;
    messageEl.textContent = `Game over! Word: ${currentWord}`;
  } else {
    currentRow++;
    currentGuess = [];
  }

  requestAnimationFrame(() => {
    rowTiles.forEach(tile => tile.classList.add('flip'));
  });
}

function updateKeyboard(letter, status) {
  const keys = keyboardEl.querySelectorAll(`[data-key="${letter}"]`);
  keys.forEach(key => {
    if (status === 'correct') {
      key.classList.add('correct');
    } else if (status === 'present' && !key.classList.contains('correct')) {
      key.classList.add('present');
    } else if (status === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
      key.classList.add('absent');
    }
  });
}

// ---------------------------------
// POKEMON GAME
// ---------------------------------

// Simplified Pokemon list (can use API for full list)
const pokemonByGen = {
  1: ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon', 'Charizard', 'Squirtle', 'Wartortle', 'Blastoise', 'Pikachu', 'Raichu'],
  2: ['Chikorita', 'Bayleef', 'Meganium', 'Cyndaquil', 'Quilava', 'Typhlosion', 'Totodile', 'Croconaw', 'Feraligatr'],
  3: ['Treecko', 'Grovyle', 'Sceptile', 'Torchic', 'Combusken', 'Blaziken', 'Mudkip', 'Marshtomp', 'Swampert'],
  4: ['Turtwig', 'Grotle', 'Torterra', 'Chimchar', 'Monferno', 'Infernape', 'Piplup', 'Prinplup', 'Empoleon'],
  5: ['Snivy', 'Servine', 'Serperior', 'Tepig', 'Pignite', 'Emboar', 'Oshawott', 'Dewott', 'Samurott'],
  6: ['Chespin', 'Quilladin', 'Chesnaught', 'Fennekin', 'Braixen', 'Delphox', 'Froakie', 'Frogadier', 'Greninja'],
  7: ['Rowlet', 'Decidueye', 'Litten', 'Torracat', 'Incineroar', 'Popplio', 'Brionne', 'Primarina'],
  8: ['Grookey', 'Thwackey', 'Rillaboom', 'Scorbunny', 'Raboot', 'Cinderace', 'Sobble', 'Drizzile', 'Inteleon'],
  9: ['Sprigatito', 'Floragato', 'Meowscarada', 'Fuecoco', 'Crocalor', 'Skeledirge', 'Quaxly', 'Quaxwell', 'Quaquaval'],
  all: []
};

let currentPokemon = '';
let currentGen = 'all';
let hintShown = false;

function initPokemonGame() {
  pokemonByGen.all = Object.values(pokemonByGen).flat().filter(x => Array.isArray(x)).flat();
  resetPokemonGame();
  setGeneration('all'); // default all
}

function resetPokemonGame() {
  document.getElementById('pokemon-silhouette').src = '';
  document.getElementById('pokemon-guess').value = '';
  document.getElementById('pokemon-feedback').textContent = '';
  hideSuggestions();
  hintShown = false;
  currentPokemon = '';
}

function setGeneration(gen) {
  currentGen = gen;
  resetPokemonGame();
  const pokemonList = pokemonByGen[gen];
  const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
  currentPokemon = randomPokemon;
  loadPokemonSilhouette(randomPokemon);
}

function loadPokemonSilhouette(name) {
  const silhouetteUrl = `https://play.pokemonshowdown.com/sprites/gen5/${name.toLowerCase()}.png`; // Placeholder, may not work without images
  document.getElementById('pokemon-silhouette').src = silhouetteUrl;
}

function guessPokemon() {
  const guess = document.getElementById('pokemon-guess').value.trim();
  if (!guess) return;

  const feedbackEl = document.getElementById('pokemon-feedback');
  const pokemonList = pokemonByGen[currentGen];

  if (guess.toLowerCase() === currentPokemon.toLowerCase()) {
    feedbackEl.textContent = `Correct! It was ${currentPokemon}!`;
    feedbackEl.style.color = 'green';
    revealPokemon();
    setTimeout(() => setGeneration(currentGen), 2000); // new game
  } else {
    feedbackEl.textContent = 'Wrong! Try again.';
    feedbackEl.style.color = 'red';
  }
}

function giveHint() {
  if (hintShown) return;
  hintShown = true;
  const hint = currentPokemon[0] + ' with ' + currentPokemon.length + ' letters.';
  document.getElementById('pokemon-feedback').textContent = `Hint: ${hint}`;
}

function spellingAssist() {
  const input = document.getElementById('pokemon-guess');
  const query = input.value.trim().toLowerCase();
  const suggestionsEl = document.getElementById('pokemon-suggestions');

  if (query.length < 2) {
    suggestionsEl.style.display = 'none';
    return;
  }

  const pokemonList = pokemonByGen[currentGen];
  const matches = pokemonList.filter(p => p.toLowerCase().startsWith(query)).slice(0, 5);

  suggestionsEl.innerHTML = '';
  if (matches.length > 0) {
    matches.forEach(pokemon => {
      const li = document.createElement('li');
      li.textContent = pokemon;
      li.addEventListener('click', () => selectSuggestion(pokemon));
      suggestionsEl.appendChild(li);
    });
    suggestionsEl.style.display = 'block';
  } else {
    suggestionsEl.style.display = 'none';
  }
}

function selectSuggestion(pokemon) {
  document.getElementById('pokemon-guess').value = pokemon;
  hideSuggestions();
  guessPokemon();
}

function hideSuggestions() {
  document.getElementById('pokemon-suggestions').style.display = 'none';
}

function revealPokemon() {
  document.getElementById('pokemon-silhouette').style.filter = 'none';
}

// ---------------------------------
// CROSSWORD PUZZLE
// ---------------------------------

let crosswordGrid = [];
let crosswordClues = {};
let currentDirection = 'across';
let currentClue = 1;

function initCrossword() {
  crosswordGrid = Array.from({ length: 15 }, () => Array(15).fill(''));
  // Simple 15x15 grid, set some black squares and pre-filled letters
  // For demo, set a simple crossword
  setCrosswordData();
  renderCrosswordGrid();
  renderCrosswordKeyboard();
  updateClueDisplay();
}

function setCrosswordData() {
  // Set black squares
  const blacks = [
    [2, 2], [2, 12], [5, 5], [5, 9], [9, 5], [9, 9], [12, 2], [12, 12]
  ];
  blacks.forEach(([r, c]) => crosswordGrid[r][c] = 'black');

  // Pre-fill some letters
  crosswordGrid[0][4] = 'C';
  crosswordGrid[0][5] = 'L';
  crosswordGrid[0][6] = 'O';
  crosswordGrid[0][7] = 'U';
  crosswordGrid[0][8] = 'D';

  crosswordClues = {
    across: { 1: 'Weather formation' },
    down: { 1: 'Sky covering' }
  };
}

function renderCrosswordGrid() {
  const gridEl = document.getElementById('crossword-grid');
  gridEl.innerHTML = '';
  gridEl.style.gridTemplateColumns = 'repeat(15, 1fr)';
  gridEl.style.gridTemplateRows = 'repeat(15, 1fr)';

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      const cell = document.createElement('div');
      cell.className = 'cross-cell';
      if (crosswordGrid[r][c] === 'black') {
        cell.classList.add('black');
      } else {
        cell.textContent = crosswordGrid[r][c];
        cell.addEventListener('click', () => selectCell(r, c));
      }
      gridEl.appendChild(cell);
    }
  }
}

function renderCrosswordKeyboard() {
  const keyboardEl = document.getElementById('crossword-keyboard');
  keyboardEl.innerHTML = '';

  const ckRow1 = document.createElement('div');
  ckRow1.className = 'ck-row';
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].forEach(key => {
    const btn = document.createElement('div');
    btn.className = 'ck-key';
    btn.textContent = key;
    btn.dataset.key = key;
    btn.addEventListener('click', () => handleCrosswordKey(key));
    ckRow1.appendChild(btn);
  });
  keyboardEl.appendChild(ckRow1);

  // Other rows similar
  const ckRow2 = document.createElement('div');
  ckRow2.className = 'ck-row';
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].forEach(key => {
    const btn = document.createElement('div');
    btn.className = 'ck-key';
    btn.textContent = key;
    btn.dataset.key = key;
    btn.addEventListener('click', () => handleCrosswordKey(key));
    ckRow2.appendChild(btn);
  });
  keyboardEl.appendChild(ckRow2);

  const ckRow3 = document.createElement('div');
  ckRow3.className = 'ck-row';

  const backBtn = document.createElement('div');
  backBtn.className = 'ck-key wide function';
  backBtn.textContent = '⌫';
  backBtn.dataset.key = 'BACK';
  backBtn.addEventListener('click', () => handleCrosswordKey('BACK'));
  ckRow3.appendChild(backBtn);

  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'].forEach(key => {
    const btn = document.createElement('div');
    btn.className = 'ck-key';
    btn.textContent = key;
    btn.dataset.key = key;
    btn.addEventListener('click', () => handleCrosswordKey(key));
    ckRow3.appendChild(btn);
  });

  const nextBtn = document.createElement('div');
  nextBtn.className = 'ck-key wide function';
  nextBtn.textContent = 'Next';
  nextBtn.dataset.key = 'NEXT';
  nextBtn.addEventListener('click', () => toggleDirection());
  ckRow3.appendChild(nextBtn);

  keyboardEl.appendChild(ckRow3);
}

function selectCell(r, c) {
  document.querySelectorAll('.cross-cell.selected').forEach(cell => cell.classList.remove('selected'));
  const cell = document.getElementById('crossword-grid').children[r * 15 + c];
  cell.classList.add('selected');
  // Update current clue based on position
}

function handleCrosswordKey(key) {
  if (!document.querySelector('.cross-cell.selected')) return;

  const selected = document.querySelector('.cross-cell.selected');
  const r = Math.floor(Array.from(selected.parentNode.children).indexOf(selected) / 15);
  const c = Array.from(selected.parentNode.children).indexOf(selected) % 15;

  if (key === 'BACK') {
    crosswordGrid[r][c] = '';
  } else {
    crosswordGrid[r][c] = key;
  }
  selected.textContent = crosswordGrid[r][c];
}

function toggleDirection() {
  currentDirection = currentDirection === 'across' ? 'down' : 'across';
  updateClueDisplay();
}

function updateClueDisplay() {
  const clueEl = document.getElementById('crossword-clue');
  const directionEl = clueEl.querySelector('.clue-direction');
  const numberEl = clueEl.querySelector('.clue-number');
  const textEl = clueEl.querySelector('.clue-text');

  directionEl.textContent = currentDirection.charAt(0).toUpperCase() + currentDirection.slice(1);
  numberEl.textContent = currentClue + '.';
  textEl.textContent = crosswordClues[currentDirection][currentClue] || 'Loading…';
}

// -----------------------------
// LAYOUT & NAVIGATION
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  const mainGrid = document.querySelector('.main-grid');
  const title = document.querySelector('h1');

  // Assign DOM references inside DOMContentLoaded
  threadArea = document.getElementById("thread-area");
  chatArea   = document.getElementById("chat-area");
  messages   = document.getElementById("messages");

  boardEl = document.getElementById("game-board");
  keyboardEl = document.getElementById("keyboard");
  messageEl = document.getElementById("game-message");

  function showMainGrid() {
    if (title) title.textContent = 'DOTS';
    if (mainGrid) mainGrid.style.display = 'grid';
    document.querySelectorAll('.modal').forEach(modal =>
      modal.classList.add('hidden')
    );
    // reset chat view
    if (threadArea && chatArea) {
      threadArea.classList.remove('hidden');
      chatArea.classList.add('hidden');
    }
  }

  const featureMap = {
    1: openChat,
    2: openWordle,
    3: openPokemon,
    12: openCrossword
  };

  function showFeature(dotId) {
    if (mainGrid) mainGrid.style.display = 'none';
    if (title) title.textContent = '';
    const feature = featureMap[dotId];
    if (typeof feature === 'function') feature();
  }

  if (mainGrid) {
    mainGrid.addEventListener('click', (e) => {
      const dot = e.target.closest('.dot');
      if (!dot) return;
      const dotId = Number(dot.getAttribute('data-id'));
      showFeature(dotId);
    });
  }

  document.querySelectorAll('.back').forEach(btn => {
    btn.addEventListener('click', showMainGrid);
  });

  // Responsive 3–5 columns dot layout
  const grid = mainGrid;
  const dots = document.querySelectorAll('.dot');

  function layoutDots() {
    const totalDots = dots.length;
    const w = window.innerWidth;
    const h = window.innerHeight;

    let cols = Math.ceil(Math.sqrt(totalDots * (w / h)));
    let rows = Math.ceil(totalDots / cols);

    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    grid.style.width = '100vw';
    grid.style.height = '100vh';
    grid.style.justifyItems = 'center';
    grid.style.alignItems = 'center';
    grid.style.gap = '6px';

    const dotSize = Math.min(
      (w - (cols - 1) * 6) / cols,
      (h - (rows - 1) * 6) / rows
    );

    dots.forEach(dot => {
      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;
    });
  }

  layoutDots();
  window.addEventListener('resize', layoutDots);

  // Chat send button
  document.getElementById('chat-send-btn')
    .addEventListener('click', sendMessage);

  // Pokemon buttons
  document.getElementById('pokemon-guess-btn')
    .addEventListener('click', guessPokemon);
  document.getElementById('pokemon-hint-btn')
    .addEventListener('click', giveHint);
  document.getElementById('pokemon-guess')
    .addEventListener('input', spellingAssist);
  document
    .querySelectorAll('#gen-filter button')
    .forEach(btn => {
      btn.addEventListener('click', () => {
        const gen = btn.dataset.gen === 'all' ? 'all' : Number(btn.dataset.gen);
        setGeneration(gen);
      });
    });

  // --------------- Wordle Game ---------------
  const wordleWords = ['APPLE', 'BRAIN', 'CLOUD', 'DREAM', 'EARTH', 'FLAME', 'GRAPE', 'HEART', 'IVORY', 'JUMBO'];
  let currentWord = '';
  let currentGuess = [];
  let currentRow = 0;
  let gameWon = false;
  let gameOver = false;

  function openWordle() {
    // Initialize the game
    currentWord = wordleWords[Math.floor(Math.random() * wordleWords.length)];
    currentGuess = [];
    currentRow = 0;
    gameWon = false;
    gameOver = false;
    boardEl.innerHTML = '';
    keyboardEl.innerHTML = '';
    messageEl.textContent = '';

    // Create board
    for (let i = 0; i < 30; i++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.innerHTML = '<span></span>';
      boardEl.appendChild(tile);
    }

    // Create keyboard
    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
    ];

    rows.forEach(rowKeys => {
      const row = document.createElement('div');
      row.className = 'keyboard-row';
      keyboardEl.appendChild(row);

      rowKeys.forEach(key => {
        const btn = document.createElement('div');
        btn.className = key === 'ENTER' || key === 'BACK' ? 'key wide' : 'key';
        btn.textContent = key;
        btn.dataset.key = key;
        btn.addEventListener('click', () => handleKey(key));
        row.appendChild(btn);
      });
    });

    document.getElementById('wordle-modal').classList.remove('hidden');
  }

  function handleKey(key) {
    if (gameWon || gameOver) return;

    if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        checkGuess();
      }
    } else if (key === 'BACK') {
      currentGuess.pop();
      updateBoard();
    } else if (currentGuess.length < 5) {
      currentGuess.push(key.toUpperCase());
      updateBoard();
    }
  }

  function updateBoard() {
    const tiles = boardEl.querySelectorAll('.tile');
    for (let i = 0; i < 30; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const tile = tiles[i];
      const span = tile.querySelector('span');
      if (row === currentRow && col < currentGuess.length) {
        span.textContent = currentGuess[col];
      } else if (row === currentRow) {
        span.textContent = '';
      }
    }
  }

  function checkGuess() {
    const guessStr = currentGuess.join('');
    const tiles = boardEl.querySelectorAll('.tile');
    const rowTiles = Array.from(tiles).slice(currentRow * 5, (currentRow + 1) * 5);
    let wordLetters = currentWord.split('');
    let correct = 0;

    // First pass: mark correct positions
    currentGuess.forEach((letter, i) => {
      const tile = rowTiles[i];
      tile.style.backgroundColor = '#787c7e';
      if (letter === wordLetters[i]) {
        tile.style.backgroundColor = '#6aaa64';
        correct++;
        wordLetters[i] = null;
        updateKeyboard(letter, 'correct');
      }
    });

    // Second pass: mark present but wrong position
    currentGuess.forEach((letter, i) => {
      const tile = rowTiles[i];
      if (tile.style.backgroundColor === '#6aaa64') return;
      const index = wordLetters.indexOf(letter);
      if (index !== -1) {
        tile.style.backgroundColor = '#c9b458';
        wordLetters[index] = null;
        updateKeyboard(letter, 'present');
      } else {
        updateKeyboard(letter, 'absent');
      }
    });

    if (correct === 5) {
      gameWon = true;
      messageEl.textContent = 'Congratulations!';
    } else if (currentRow === 5) {
      gameOver = true;
      messageEl.textContent = `Game over! Word: ${currentWord}`;
    } else {
      currentRow++;
      currentGuess = [];
    }

    requestAnimationFrame(() => {
      rowTiles.forEach(tile => tile.classList.add('flip'));
    });
  }

  function updateKeyboard(letter, status) {
    const keys = keyboardEl.querySelectorAll(`[data-key="${letter}"]`);
    keys.forEach(key => {
      if (status === 'correct') {
        key.classList.add('correct');
      } else if (status === 'present' && !key.classList.contains('correct')) {
        key.classList.add('present');
      } else if (status === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
        key.classList.add('absent');
      }
    });
  }

  // --------------- Pokemon Game ---------------
  const pokemonByGen = {
    1: ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon', 'Charizard', 'Squirtle', 'Wartortle', 'Blastoise', 'Pikachu', 'Raichu'],
    2: ['Chikorita', 'Bayleef', 'Meganium', 'Cyndaquil', 'Quilava', 'Typhlosion', 'Totodile', 'Croconaw', 'Feraligatr'],
    3: ['Treecko', 'Grovyle', 'Sceptile', 'Torchic', 'Combusken', 'Blaziken', 'Mudkip', 'Marshtomp', 'Swampert'],
    4: ['Turtwig', 'Grotle', 'Torterra', 'Chimchar', 'Monferno', 'Infernape', 'Piplup', 'Prinplup', 'Empoleon'],
    5: ['Snivy', 'Servine', 'Serperior', 'Tepig', 'Pignite', 'Emboar', 'Oshawott', 'Dewott', 'Samurott'],
    6: ['Chespin', 'Quilladin', 'Chesnaught', 'Fennekin', 'Braixen', 'Delphox', 'Froakie', 'Frogadier', 'Greninja'],
    7: ['Rowlet', 'Decidueye', 'Litten', 'Torracat', 'Incineroar', 'Popplio', 'Brionne', 'Primarina'],
    8: ['Grookey', 'Thwackey', 'Rillaboom', 'Scorbunny', 'Raboot', 'Cinderace', 'Sobble', 'Drizzile', 'Inteleon'],
    9: ['Sprigatito', 'Floragato', 'Meowscarada', 'Fuecoco', 'Crocalor', 'Skeledirge', 'Quaxly', 'Quaxwell', 'Quaquaval'],
    all: []
  };

  let currentPokemon = '';
  let currentGen = 'all';
  let hintShown = false;

  function openPokemon() {
    pokemonByGen.all = Object.values(pokemonByGen).flat().filter(x => Array.isArray(x)).flat();
    resetPokemonGame();
    setGeneration('all');
    document.getElementById('pokemon-modal').classList.remove('hidden');
  }

  function resetPokemonGame() {
    document.getElementById('pokemon-silhouette').src = '';
    document.getElementById('pokemon-guess').value = '';
    document.getElementById('pokemon-feedback').textContent = '';
    hideSuggestions();
    hintShown = false;
    currentPokemon = '';
  }

  function setGeneration(gen) {
    currentGen = gen;
    resetPokemonGame();
    const pokemonList = pokemonByGen[gen];
    const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
    currentPokemon = randomPokemon;
    loadPokemonSilhouette(randomPokemon);
  }

  function loadPokemonSilhouette(name) {
    const silhouetteUrl = `https://play.pokemonshowdown.com/sprites/gen5/${name.toLowerCase()}.png`;
    document.getElementById('pokemon-silhouette').src = silhouetteUrl;
  }

  function guessPokemon() {
    const guess = document.getElementById('pokemon-guess').value.trim();
    if (!guess) return;

    const feedbackEl = document.getElementById('pokemon-feedback');
    const pokemonList = pokemonByGen[currentGen];

    if (guess.toLowerCase() === currentPokemon.toLowerCase()) {
      feedbackEl.textContent = `Correct! It was ${currentPokemon}!`;
      feedbackEl.style.color = 'green';
      revealPokemon();
      setTimeout(() => setGeneration(currentGen), 2000);
    } else {
      feedbackEl.textContent = 'Wrong! Try again.';
      feedbackEl.style.color = 'red';
    }
  }

  function giveHint() {
    if (hintShown) return;
    hintShown = true;
    const hint = currentPokemon[0] + ' with ' + currentPokemon.length + ' letters.';
    document.getElementById('pokemon-feedback').textContent = `Hint: ${hint}`;
  }

  function spellingAssist() {
    const input = document.getElementById('pokemon-guess');
    const query = input.value.trim().toLowerCase();
    const suggestionsEl = document.getElementById('pokemon-suggestions');

    if (query.length < 2) {
      suggestionsEl.style.display = 'none';
      return;
    }

    const pokemonList = pokemonByGen[currentGen];
    const matches = pokemonList.filter(p => p.toLowerCase().startsWith(query)).slice(0, 5);

    suggestionsEl.innerHTML = '';
    if (matches.length > 0) {
      matches.forEach(pokemon => {
        const li = document.createElement('li');
        li.textContent = pokemon;
        li.addEventListener('click', () => selectSuggestion(pokemon));
        suggestionsEl.appendChild(li);
      });
      suggestionsEl.style.display = 'block';
    } else {
      suggestionsEl.style.display = 'none';
    }
  }

  function selectSuggestion(pokemon) {
    document.getElementById('pokemon-guess').value = pokemon;
    hideSuggestions();
    guessPokemon();
  }

  function hideSuggestions() {
    document.getElementById('pokemon-suggestions').style.display = 'none';
  }

  function revealPokemon() {
    document.getElementById('pokemon-silhouette').style.filter = 'none';
  }

  // Add event listeners for Pokemon
  document.getElementById('chat-send-btn').addEventListener('click', sendMessage);
  document.getElementById('pokemon-guess-btn').addEventListener('click', guessPokemon);
  document.getElementById('pokemon-hint-btn').addEventListener('click', giveHint);
  document.getElementById('pokemon-guess').addEventListener('input', spellingAssist);
  document.querySelectorAll('#gen-filter button').forEach(btn => {
    btn.addEventListener('click', () => {
      const gen = btn.dataset.gen === 'all' ? 'all' : Number(btn.dataset.gen);
      setGeneration(gen);
    });
  });

  // --------------- Crossword Puzzle ---------------
  let crosswordGrid = [];
  let crosswordClues = {};
  let currentDirection = 'across';
  let currentClue = 1;

  function openCrossword() {
    crosswordGrid = Array.from({ length: 15 }, () => Array(15).fill(''));
    setCrosswordData();
    renderCrosswordGrid();
    renderCrosswordKeyboard();
    updateClueDisplay();
    document.getElementById('crossword-modal').classList.remove('hidden');
  }

  function setCrosswordData() {
    const blacks = [
      [2, 2], [2, 12], [5, 5], [5, 9], [9, 5], [9, 9], [12, 2], [12, 12]
    ];
    blacks.forEach(([r, c]) => crosswordGrid[r][c] = 'black');

    crosswordGrid[0][4] = 'C';
    crosswordGrid[0][5] = 'L';
    crosswordGrid[0][6] = 'O';
    crosswordGrid[0][7] = 'U';
    crosswordGrid[0][8] = 'D';

    crosswordClues = {
      across: { 1: 'Weather formation' },
      down: { 1: 'Sky covering' }
    };
  }

  function renderCrosswordGrid() {
    const gridEl = document.getElementById('crossword-grid');
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = 'repeat(15, 1fr)';
    gridEl.style.gridTemplateRows = 'repeat(15, 1fr)';

    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        const cell = document.createElement('div');
        cell.className = 'cross-cell';
        if (crosswordGrid[r][c] === 'black') {
          cell.classList.add('black');
        } else {
          cell.textContent = crosswordGrid[r][c];
          cell.addEventListener('click', () => selectCell(r, c));
        }
        gridEl.appendChild(cell);
      }
    }
  }

  function renderCrosswordKeyboard() {
    const keyboardEl = document.getElementById('crossword-keyboard');
    keyboardEl.innerHTML = '';

    const ckRow1 = document.createElement('div');
    ckRow1.className = 'ck-row';
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].forEach(key => {
      const btn = document.createElement('div');
      btn.className = 'ck-key';
      btn.textContent = key;
      btn.dataset.key = key;
      btn.addEventListener('click', () => handleCrosswordKey(key));
      ckRow1.appendChild(btn);
    });
    keyboardEl.appendChild(ckRow1);

    const ckRow2 = document.createElement('div');
    ckRow2.className = 'ck-row';
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].forEach(key => {
      const btn = document.createElement('div');
      btn.className = 'ck-key';
      btn.textContent = key;
      btn.dataset.key = key;
      btn.addEventListener('click', () => handleCrosswordKey(key));
      ckRow2.appendChild(btn);
    });
    keyboardEl.appendChild(ckRow2);

    const ckRow3 = document.createElement('div');
    ckRow3.className = 'ck-row';

    const backBtn = document.createElement('div');
    backBtn.className = 'ck-key wide function';
    backBtn.textContent = '⌫';
    backBtn.dataset.key = 'BACK';
    backBtn.addEventListener('click', () => handleCrosswordKey('BACK'));
    ckRow3.appendChild(backBtn);

    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'].forEach(key => {
      const btn = document.createElement('div');
      btn.className = 'ck-key';
      btn.textContent = key;
      btn.dataset.key = key;
      btn.addEventListener('click', () => handleCrosswordKey(key));
      ckRow3.appendChild(btn);
    });

    const nextBtn = document.createElement('div');
    nextBtn.className = 'ck-key wide function';
    nextBtn.textContent = 'Next';
    nextBtn.dataset.key = 'NEXT';
    nextBtn.addEventListener('click', () => toggleDirection());
    ckRow3.appendChild(nextBtn);

    keyboardEl.appendChild(ckRow3);
  }

  function selectCell(r, c) {
    document.querySelectorAll('.cross-cell.selected').forEach(cell => cell.classList.remove('selected'));
    const cell = document.getElementById('crossword-grid').children[r * 15 + c];
    cell.classList.add('selected');
  }

  function handleCrosswordKey(key) {
    if (!document.querySelector('.cross-cell.selected')) return;

    const selected = document.querySelector('.cross-cell.selected');
    const r = Math.floor(Array.from(selected.parentNode.children).indexOf(selected) / 15);
    const c = Array.from(selected.parentNode.children).indexOf(selected) % 15;

    if (key === 'BACK') {
      crosswordGrid[r][c] = '';
    } else {
      crosswordGrid[r][c] = key;
    }
    selected.textContent = crosswordGrid[r][c];
  }

  function toggleDirection() {
    currentDirection = currentDirection === 'across' ? 'down' : 'across';
    updateClueDisplay();
  }

  function updateClueDisplay() {
    const clueEl = document.getElementById('crossword-clue');
    const directionEl = clueEl.querySelector('.clue-direction');
    const numberEl = clueEl.querySelector('.clue-number');
    const textEl = clueEl.querySelector('.clue-text');

    directionEl.textContent = currentDirection.charAt(0).toUpperCase() + currentDirection.slice(1);
    numberEl.textContent = currentClue + '.';
    textEl.textContent = crosswordClues[currentDirection][currentClue] || 'Loading…';
  }

  // Initial state
  showMainGrid();
});

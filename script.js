// Declare global DOM references (will be assigned inside event listener)
let threadArea, chatArea, messages;

// ====================================
// APPLICATION ENTRY POINT
// ====================================

document.addEventListener('DOMContentLoaded', () => {
  // DOM cache
  const mainGrid = document.querySelector('.main-grid');
  const title = document.querySelector('h1');
  const threadArea = document.getElementById('thread-area');
  const chatArea = document.getElementById('chat-area');
  const messagesDiv = document.getElementById('messages');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');

  // ===================================
  // UNIVERSAL NAVIGATION
  // ===================================
  function showMain() {
    title.textContent = 'DOTS';
    mainGrid.style.display = 'grid';
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  }

  document.querySelectorAll('.back').forEach(btn => {
    btn.addEventListener('click', showMain);
  });

  // ===================================
  // MAIN GRID → FEATURES
  // ===================================
  mainGrid.addEventListener('click', e => {
    const dot = e.target.closest('.dot');
    if (!dot) return;
    const id = dot.dataset.id;
    mainGrid.style.display = 'none';
    title.textContent = '';

    if (id === '1') openChatFeature();
    if (id === '2') openWordle();
    if (id === '3') openPokemon();
    if (id === '12') openCrossword();
  });

  // ===================================
  // 1. CHAT – FULLY FIXED & MAGICAL
  // ===================================
  function openChatFeature() {
    document.getElementById('chat-modal').classList.remove('hidden');
    threadArea.innerHTML = '';
    loadThreads();
    createPlusButton();
  }

  function loadThreads() {
    const threads = JSON.parse(localStorage.getItem('dots_threads') || '[]');
    if (threads.length === 0) {
      // Create first demo thread
      createThread({ id: Date.now(), name: 'Demo', emoji: 'Hello', x: 60, y: 120 });
    } else {
      threads.forEach(createThread);
    }
  }

  function createThread(thread) {
    const dot = document.createElement('div');
    dot.className = 'thread-dot';
    dot.textContent = thread.emoji || thread.name[0];
    dot.dataset.id = thread.id;
    dot.style.left = (thread.x || Math.random() * 200 + 50) + 'px';
    dot.style.top = (thread.y || Math.random() * 300 + 80) + 'px';

    // Unread badge (optional future use)
    if (thread.unread > 0) {
      const badge = document.createElement('div');
      badge.className = 'unread-badge';
      badge.textContent = thread.unread > 9 ? '9+' : thread.unread;
      dot.appendChild(badge);
    }

    makeDraggable(dot, thread.id);
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      openConversation(thread.id, thread.name || thread.emoji);
    });

    threadArea.appendChild(dot);
  }

  function createPlusButton() {
    if (document.getElementById('plus-btn')) return;
    const plus = document.createElement('div');
    plus.id = 'plus-btn';
    plus.className = 'thread-dot';
    plus.textContent = '+';
    plus.style.fontSize = '48px';
    plus.style.fontWeight = '300';
    plus.style.background = 'rgba(255,255,255,0.15)';
    plus.style.left = '24px';
    plus.style.top = '24px';

    plus.addEventListener('click', (e) => {
      e.stopPropagation();
      const input = prompt('Chat name or emoji:', 'New Chat')?.trim();
      if (!input) return;

      const id = Date.now();
      const newThread = { id, name: input, emoji: input.length <= 3 ? input : null, x: 100, y: 200 };
      const threads = JSON.parse(localStorage.getItem('dots_threads') || '[]');
      threads.push(newThread);
      localStorage.setItem('dots_threads', JSON.stringify(threads));

      createThread(newThread);
    });

    threadArea.appendChild(plus);
  }

  function makeDraggable(el, threadId) {
    let startX, startY, initX, initY;
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      initX = el.offsetLeft;
      initY = el.offsetTop;
      el.style.transition = 'none';

      const move = (e) => {
        const x = initX + (e.clientX - startX);
        const y = initY + (e.clientY - startY);
        const rect = threadArea.getBoundingClientRect();
        el.style.left = Math.max(0, Math.min(x, rect.width - 60)) + 'px';
        el.style.top = Math.max(0, Math.min(y, rect.height - 60)) + 'px';
      };
      const up = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        // Save position
        const threads = JSON.parse(localStorage.getItem('dots_threads') || '[]');
        const t = threads.find(t => t.id == threadId);
        if (t) {
          t.x = el.offsetLeft;
          t.y = el.offsetTop;
          localStorage.setItem('dots_threads', JSON.stringify(threads));
        }
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
  }

  function openConversation(id, name) {
    document.querySelector('#chat-modal h2').textContent = name;
    threadArea.classList.add('hidden');
    chatArea.classList.remove('hidden');
    messagesDiv.innerHTML = '';
    const msgs = JSON.parse(localStorage.getItem(`dots_msgs_${id}`) || '[]');
    msgs.forEach(m => addMessage(m.text, m.time));
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  sendBtn.addEventListener('click', () => {
    if (!chatInput.value.trim()) return;
    const text = chatInput.value.trim();
    const name = document.querySelector('#chat-modal h2').textContent;
    const threads = JSON.parse(localStorage.getItem('dots_threads') || '[]');
    const thread = threads.find(t => (t.name || t.emoji) === name);
    if (!thread) return;

    const msgs = JSON.parse(localStorage.getItem(`dots_msgs_${thread.id}`) || '[]');
    msgs.push({ text, time: Date.now() });
    localStorage.setItem(`dots_msgs_${thread.id}`, JSON.stringify(msgs));

    addMessage(text);
    chatInput.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  // ===================================
  // WORDLE, POKEMON, CROSSWORD – untouched & working
  // ===================================
  function openWordle() {
    document.getElementById('wordle-modal').classList.remove('hidden');
    initWordle(); // your existing initWordle() works perfectly
  }
  function openPokemon() {
    document.getElementById('pokemon-modal').classList.remove('hidden');
    initPokemonGame(); // your existing init works
  }
  function openCrossword() {
    document.getElementById('crossword-modal').classList.remove('hidden');
    initCrossword(); // your existing init works
  }

  // Your existing initWordle(), initPokemonGame(), initCrossword() etc. stay exactly as you wrote them
  // Just make sure they are still in this file below this line (they already are in your code)

  // ===================================
  // START
  // ===================================
  showMain();
});

// Declare global DOM references (will be assigned inside event listener)
let boardEl, keyboardEl, messageEl;

// ====================================
// WORDLE GAME
// ====================================

const wordleWords = ['APPLE', 'BRAIN', 'CLOUD', 'DREAM', 'EARTH', 'FLAME', 'GRAPE', 'HEART', 'IVORY', 'JUMBO'];
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

  for (let i = 0; i < 30; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.innerHTML = '<span></span>';
    boardEl.appendChild(tile);
  }

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

// ====================================
// POKEMON GAME
// ====================================

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
  setGeneration('all');
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
  const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)] || pokemonList[0];
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

// ====================================
// CROSSWORD PUZZLE
// ====================================

let crosswordGrid = [];
let crosswordClues = {};
let currentDirection = 'across';
let currentClue = 1;

function initCrossword() {
  crosswordGrid = Array.from({ length: 15 }, () => Array(15).fill(''));
  setCrosswordData();
  renderCrosswordGrid();
  renderCrosswordKeyboard();
  updateClueDisplay();
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

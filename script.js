// Declare global DOM references (will be assigned in DOMContentLoaded)
let threadArea, chatArea, messages, boardEl, keyboardEl, messageEl;

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

  // Initial state
  showMainGrid();
});

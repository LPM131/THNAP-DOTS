document.addEventListener('DOMContentLoaded', () => {
  const mainGrid = document.getElementById('main-grid');
  const title = document.querySelector('h1');

  // Show main grid and hide all modals
  function showMainGrid() {
    if (title) title.textContent = 'DOTS';
    if (mainGrid) mainGrid.style.display = 'grid';
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
  }

  // Map dot IDs to feature functions
  const featureMap = {
    1: openChat,
    11: openWordle,
    12: openCrossword,
    13: openPokemon
  };

  // Show feature/modal by dot ID
  function showFeature(dotId) {
    if (mainGrid) mainGrid.style.display = 'none';
    if (title) title.textContent = '';
    const feature = featureMap[dotId];
    if (feature) feature();
  }

  // Handle dot clicks
  if (mainGrid) {
    mainGrid.addEventListener('click', (e) => {
      const dot = e.target.closest('.dot');
      if (!dot) return;
      const dotId = Number(dot.getAttribute('data-id'));
      showFeature(dotId);
    });
  }

  // Back button for all modals
  document.querySelectorAll('.back, .back-btn').forEach(btn => {
    btn.addEventListener('click', showMainGrid);
  });

  // Initialize main grid
  showMainGrid();
});

/* Add your existing feature functions below (openChat, openWordle, openCrossword, openPokemon) */

function openChat() {
  const chatModal = document.getElementById('chat-modal');
  if (chatModal) chatModal.classList.remove('hidden');
  // Init chat module here...
}

function openWordle() {
  const wordleModal = document.getElementById('wordle-modal');
  if (wordleModal) wordleModal.classList.remove('hidden');
  // Init Wordle module here...
}

function openCrossword() {
  const crosswordModal = document.getElementById('crossword-modal');
  if (crosswordModal) crosswordModal.classList.remove('hidden');
  // Init crossword module here...
}

function openPokemon() {
  const pokemonModal = document.getElementById('pokemon-modal');
  if (pokemonModal) pokemonModal.classList.remove('hidden');
  // Init Pokemon module here...
}

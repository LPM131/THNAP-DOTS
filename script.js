document.addEventListener('DOMContentLoaded', () => {
  const mainGrid = document.getElementById('main-grid');
  const title = document.querySelector('h1');

  // Show main grid and hide all modals
  function showMainGrid() {
    if (title) title.textContent = 'DOTS';
    if (mainGrid) mainGrid.style.display = 'grid';
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
  }

  // Map dot IDs to modal elements
  const dotMap = {
    1: 'chat-modal',
    11: 'wordle-modal',
    12: 'crossword-modal',
    13: 'pokemon-modal'
  };

  // Show modal by dot ID
  function showFeature(dotId) {
    if (mainGrid) mainGrid.style.display = 'none';
    if (title) title.textContent = '';
    const modalId = dotMap[dotId];
    if (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('hidden');
    }
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

  // Initialize
  showMainGrid();
});

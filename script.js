document.addEventListener('DOMContentLoaded', () => {
  const dots = document.querySelectorAll('.dot');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const id = dot.dataset.id;
      console.log(`Dot ${id} clicked!`);
      // Example: open a modal for this dot
      // openModal(id);
    });
  });
});

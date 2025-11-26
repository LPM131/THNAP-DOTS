// Handles mobile vh fix (especially iOS Safari)
export function initViewportFix() {
  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
  window.addEventListener('focusin', () => setTimeout(setVH, 100));
  window.addEventListener('focusout', () => setTimeout(setVH, 100));
}

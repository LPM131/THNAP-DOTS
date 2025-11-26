// chat-animations.js — DOT expand / overlay -> dot and screen show/hide helpers

// small helper for mobile vh issues
export function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

// animate dot -> overlay (simple clone morph)
export function animateDotToOverlay(dotEl) {
  return new Promise((resolve) => {
    const rect = dotEl.getBoundingClientRect();
    const clone = dotEl.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.zIndex = 999999;
    clone.style.borderRadius = "50%";
    clone.style.transition = "all 380ms cubic-bezier(.2,.9,.2,1)";
    clone.style.transformOrigin = "center";
    document.body.appendChild(clone);

    const targetX = (window.innerWidth / 2) - (rect.width / 2);
    const targetY = 36;
    const scale = Math.max(window.innerWidth / rect.width, window.innerHeight / rect.height) * 0.6;

    requestAnimationFrame(() => {
      clone.style.transform = `translate(${targetX - rect.left}px, ${targetY - rect.top}px) scale(${scale})`;
      clone.style.opacity = 0.98;
    });

    clone.addEventListener("transitionend", () => { clone.remove(); resolve(); }, { once: true });
  });
}

export function animateOverlayToDot(dotEl) {
  return new Promise((resolve) => {
    const flash = document.createElement("div");
    flash.style.position = "fixed";
    flash.style.left = 0; flash.style.top = 0; flash.style.width = "100%"; flash.style.height = "100%";
    flash.style.background = "#fff"; flash.style.opacity = "0"; flash.style.transition = "opacity 260ms ease-out"; flash.style.zIndex = 999998;
    document.body.appendChild(flash);
    requestAnimationFrame(()=> flash.style.opacity = "1");
    setTimeout(()=> { flash.style.opacity = "0"; setTimeout(()=> { flash.remove(); resolve(); }, 260); }, 140);
  });
}

// expose attach function for index.js to call (if needed)
export function attachChatAnimations() {
  // back button handling (when chat screen emits close)
  window.DOTS_CHAT_ANIMATIONS = {
    closeChatScreen: async (dotEl) => {
      // remove chat screen element if present
      const screen = document.querySelector(".chat-screen-wrapper");
      if (screen) screen.remove();
      // unfreeze cylinder (cylinder handles itself)
      return;
    }
  };
}

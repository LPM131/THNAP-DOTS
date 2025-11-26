// chat-animations.js — dot -> overlay / overlay -> dot animations
export function animateDotToOverlay(dotEl) {
  return new Promise((resolve) => {
    const rect = dotEl.getBoundingClientRect();
    const clone = dotEl.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.zIndex = 9999;
    clone.style.borderRadius = "50%";
    clone.style.transition = "all 380ms cubic-bezier(.2,.9,.2,1)";
    clone.style.transformOrigin = "center";
    document.body.appendChild(clone);

    // compute target: top-center where avatar will be
    const targetX = (window.innerWidth / 2) - (rect.width / 2);
    const targetY = 36;
    // scale up moderately (morph into overlay)
    const scale = Math.max(window.innerWidth / rect.width, window.innerHeight / rect.height) * 0.6;
    requestAnimationFrame(() => {
      clone.style.transform = `translate(${targetX - rect.left}px, ${targetY - rect.top}px) scale(${scale})`;
      clone.style.opacity = 0.98;
    });

    clone.addEventListener("transitionend", () => {
      clone.remove();
      resolve();
    }, { once: true });
  });
}

export function animateOverlayToDot(dotEl) {
  return new Promise((resolve) => {
    // small white flash overlay to hide the morph
    const flash = document.createElement("div");
    flash.style.position = "fixed";
    flash.style.left = 0;
    flash.style.top = 0;
    flash.style.width = "100%";
    flash.style.height = "100%";
    flash.style.background = "#fff";
    flash.style.opacity = "0";
    flash.style.transition = "opacity 260ms ease-out";
    flash.style.zIndex = 9998;
    document.body.appendChild(flash);
    requestAnimationFrame(() => flash.style.opacity = "1");
    setTimeout(() => {
      flash.style.opacity = "0";
      setTimeout(()=> { flash.remove(); resolve(); }, 260);
    }, 140);
  });
}

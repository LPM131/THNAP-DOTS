// index.js — Text feature bootstrap + integration
import { ThreadStore } from "./chat-threads.js";
import { mountChatOverlay, unmountChatOverlay } from "./chat-cylinder.js";
import { openThreadScreen } from "./chat-screen.js";
import { animateDotToOverlay, animateOverlayToDot } from "./chat-animations.js";

let overlayRoot = null;
let activeThreadId = null;

export function initTextFeature() {
  const dot = document.getElementById("text-dot") || document.querySelector('.dot[data-id="1"]');
  if (!dot) {
    console.warn("Text dot not found.");
    return;
  }

  dot.addEventListener("click", async (ev) => {
    dot.classList.add("pressed");
    await animateDotToOverlay(dot);
    overlayRoot = mountChatOverlay({
      onClose: async () => {
        unmountChatOverlay();
        await animateOverlayToDot(dot);
      },
      onOpenThread: async (threadId) => {
        activeThreadId = threadId;
        await openThreadScreen(document.getElementById("dots-text-overlay"), threadId, async () => {
          // on close of chat screen, nothing extra for now
        });
      }
    });
  });
}

export function openTextDotProgrammatically() {
  const dot = document.getElementById("text-dot") || document.querySelector('.dot[data-id="1"]');
  if (!dot) return;
  dot.click();
}

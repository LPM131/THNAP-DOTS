// chat-screen.js — full-screen iMessage-style chat screen + bridge

import { ThreadStore } from "./chat-threads.js";

/* This module registers window.DOTS_CHAT_OPEN_THREAD(threadId) which the cylinder calls.
   It also provides initChatScreen() (no-op) to satisfy index.js contract.
*/

let currentThreadId = null;
let containerRoot = null;

export function initChatScreen() {
  // placeholder init (module loaded so it can register callback)
  // register openThread function used by cylinder
  window.DOTS_CHAT_OPEN_THREAD = async (threadId) => {
    try {
      await openThreadScreen(threadId);
    } catch (e) {
      console.error("openThread error", e);
    }
  };
}

// openThreadScreen: injects chat-screen wrapper into the overlay-content
export async function openThreadScreen(threadId) {
  const overlay = document.getElementById("dots-text-overlay");
  if (!overlay) {
    console.warn("openThreadScreen: no overlay present");
    return;
  }

  // freeze cylinder interactions while chat is open
  overlay.querySelector("#cylinder")?.classList.add("frozen");

  // create container
  const wrapper = document.createElement("div");
  wrapper.className = "chat-screen-wrapper";

  wrapper.innerHTML = `
    <div class="chat-header">
      <div id="header-avatar" class="header-avatar"></div>
      <div class="header-title">
        <div id="header-name" class="header-name">Conversation</div>
        <div id="header-sub" class="header-sub"></div>
      </div>
      <button id="chat-back" class="chat-back">Back</button>
    </div>
    <div id="chat-messages" class="chat-messages" role="log" aria-live="polite"></div>
    <div class="chat-input-area">
      <input id="chat-send-input" placeholder="Message" autocomplete="off"/>
      <button id="chat-send-btn">Send</button>
    </div>
  `;

  overlay.querySelector(".overlay-content").appendChild(wrapper);
  containerRoot = wrapper;
  currentThreadId = threadId;

  // populate header
  const t = ThreadStore.getById(threadId) || { name: "Unknown", color: "#888", members: [] };
  wrapper.querySelector("#header-avatar").style.background = t.color;
  wrapper.querySelector("#header-name").textContent = t.name;
  wrapper.querySelector("#header-sub").textContent = `${t.members?.length || 1} member${(t.members?.length>1?"s":"")}`;

  // render messages
  renderMessages();

  // handlers
  wrapper.querySelector("#chat-back").addEventListener("click", () => {
    // mark read
    ThreadStore.markRead(threadId);
    // remove screen
    wrapper.remove();
    // unfreeze cylinder
    overlay.querySelector("#cylinder")?.classList.remove("frozen");
  });

  const input = wrapper.querySelector("#chat-send-input");
  wrapper.querySelector("#chat-send-btn").addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;
    ThreadStore.pushMessage(threadId, { from: "You", text });
    input.value = "";
    renderMessages(true);
  });

  input.addEventListener("keydown", (e) => { if (e.key === "Enter") wrapper.querySelector("#chat-send-btn").click(); });

  // scroll to bottom
  setTimeout(() => { wrapper.querySelector("#chat-messages").scrollTop = wrapper.querySelector("#chat-messages").scrollHeight; }, 80);
}

function renderMessages(jumpBottom = false) {
  const thread = ThreadStore.getById(currentThreadId) || { messages: [] };
  const box = containerRoot?.querySelector("#chat-messages");
  if (!box) return;
  box.innerHTML = "";
  (thread.messages || []).forEach(msg => {
    const msgEl = document.createElement("div");
    msgEl.className = `chat-msg ${msg.from === "You" ? "you" : "other"}`;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = msg.text;
    msgEl.appendChild(bubble);
    box.appendChild(msgEl);
  });
  if (jumpBottom) box.scrollTop = box.scrollHeight + 120;
}

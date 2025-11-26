// scripts/features/chat/chat-screen.js
import { ThreadStore } from "./chat-threads.js";

let currentThreadId = null;
let container = null;

export function initChatScreen() {
  window.DOTS_CHAT_OPEN_THREAD = (threadId) => openThreadScreen(threadId);
}

export function openThreadScreen(threadId) {
  const overlay = document.getElementById("dots-text-overlay");
  if (!overlay) return;

  overlay.querySelector("#cylinder")?.classList.add("frozen");

  if (container) container.remove();

  container = document.createElement("div");
  container.className = "chat-screen-wrapper";

  container.innerHTML = `
    <div class="chat-header">
      <div id="header-avatar" class="header-avatar"></div>
      <div class="header-title">
        <div id="header-name" class="header-name">Chat</div>
        <div id="header-sub" class="header-sub"></div>
      </div>
      <button id="chat-back" class="chat-back">Back</button>
    </div>

    <div id="chat-messages" class="chat-messages"></div>

    <div class="chat-input-area">
      <input id="chat-send-input" placeholder="Message" autocomplete="off">
      <button id="chat-send-btn">Send</button>
    </div>
  `;

  overlay.querySelector(".overlay-content").appendChild(container);

  currentThreadId = threadId;
  const t = ThreadStore.getById(threadId);

  container.querySelector("#header-avatar").style.background = t.color;
  container.querySelector("#header-name").textContent = t.name;
  container.querySelector("#header-sub").textContent =
    `${t.members?.length || 1} member${t.members?.length > 1 ? "s" : ""}`;

  renderMessages();

  container.querySelector("#chat-back").addEventListener("click", () => {
    ThreadStore.markRead(threadId);

    container.remove();
    container = null;

    overlay.querySelector("#cylinder")?.classList.remove("frozen");
  });

  const input = container.querySelector("#chat-send-input");
  container.querySelector("#chat-send-btn").addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;

    ThreadStore.pushMessage(threadId, { from: "You", text });
    input.value = "";
    renderMessages(true);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") container.querySelector("#chat-send-btn").click();
  });
}

function renderMessages(scrollToBottom = false) {
  const t = ThreadStore.getById(currentThreadId);
  const box = container.querySelector("#chat-messages");

  box.innerHTML = "";

  t.messages.forEach(msg => {
    const msgEl = document.createElement("div");
    msgEl.className = `chat-msg ${msg.from === "You" ? "you" : "other"}`;
    msgEl.innerHTML = `<div class="bubble">${msg.text}</div>`;
    box.appendChild(msgEl);
  });

  if (scrollToBottom) {
    box.scrollTop = box.scrollHeight + 200;
  }
}

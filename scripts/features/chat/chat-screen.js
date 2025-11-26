// chat-screen.js — full-screen iMessage-style chat screen
import { ThreadStore } from "./chat-threads.js";

const CHAT_TEMPLATE = `
  <div class="chat-screen">
    <div class="chat-header">
      <div class="header-avatar" id="header-avatar"></div>
      <div class="header-title">
        <div id="header-name" class="header-name">Conversation</div>
        <div id="header-sub" class="header-sub">Online</div>
      </div>
      <button id="chat-back" class="chat-back">Back</button>
    </div>
    <div id="chat-messages" class="chat-messages" role="log" aria-live="polite"></div>
    <div class="chat-input-area">
      <input id="chat-send-input" placeholder="Message" autocomplete="off" />
      <button id="chat-send-btn">Send</button>
    </div>
  </div>
`;

let currentThreadId = null;
let root = null;

export async function openThreadScreen(overlayRoot, threadId, closeCallback) {
  currentThreadId = threadId;
  const thread = ThreadStore.getById(threadId);
  if (!overlayRoot) return;
  // create wrapper
  const container = document.createElement("div");
  container.className = "chat-screen-wrapper";
  container.innerHTML = CHAT_TEMPLATE;
  overlayRoot.querySelector(".overlay-content").appendChild(container);
  root = container;

  // populate header
  const avatar = container.querySelector("#header-avatar");
  avatar.style.background = thread.color || "#3FA7FF";
  container.querySelector("#header-name").textContent = thread.name;
  container.querySelector("#header-sub").textContent = `${thread.members?.length || 1} member${(thread.members?.length>1? "s":"")}`;

  renderMessages();

  // handlers
  container.querySelector("#chat-back").addEventListener("click", async () => {
    container.remove();
    ThreadStore.markRead(threadId);
    if (closeCallback) await closeCallback();
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
    if (e.key === "Enter") {
      container.querySelector("#chat-send-btn").click();
    }
  });

  scrollToBottom();
}

function renderMessages(jumpBottom = false) {
  const thread = ThreadStore.getById(currentThreadId);
  if (!root) return;
  const box = root.querySelector("#chat-messages");
  box.innerHTML = "";
  (thread.messages || []).forEach(msg => {
    const m = document.createElement("div");
    m.className = `chat-msg ${msg.from === "You" ? "you" : "other"}`;
    m.innerHTML = `<div class="bubble">${escapeHtml(msg.text)}</div>`;
    box.appendChild(m);
  });
  if (jumpBottom) scrollToBottom();
}

function scrollToBottom() {
  const box = root.querySelector("#chat-messages");
  if (!box) return;
  setTimeout(()=> { box.scrollTop = box.scrollHeight + 100; }, 60);
}

function escapeHtml(s) {
  return (s + "").replace(/[&<>"']/g, (m) => ({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[m]));
}

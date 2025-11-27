// chat-screen.js
import { ThreadStore } from "./chat-threads.js";

let currentThreadId = null;
let root = null;
let screenNode = null;

export function initChatScreen() {
  // registers the global bridge function used by the cylinder
  window.DOTS_CHAT_OPEN_THREAD = async (threadId) => {
    await openThreadScreen(threadId);
  };
}

async function openThreadScreen(threadId) {
  root = document.getElementById('chat-root');
  if (!root) return console.warn("chat-root missing");

  // create chat-screen node
  screenNode = document.createElement('div');
  screenNode.className = 'chat-screen';
  screenNode.innerHTML = `
    <div class="top chat-header">
      <button class="chat-back-btn" id="chat-screen-back">Back</button>
      <div class="chat-title" id="chat-title">Conversation</div>
    </div>
    <div class="chat-messages" id="chat-messages" role="log" aria-live="polite"></div>
    <div class="chat-input">
      <input id="chat-input-text" placeholder="Message" autocomplete="off" />
      <button id="chat-send">Send</button>
    </div>
  `;

  // append and hide cylinder interactions
  root.appendChild(screenNode);
  root.querySelector('#cylinder')?.classList.add('frozen');

  currentThreadId = threadId;
  populateHeader();
  renderMessages();

  // handlers
  screenNode.querySelector('#chat-screen-back').addEventListener('click', () => {
    // close chat screen and return to cylinder
    screenNode.remove();
    root.querySelector('#cylinder')?.classList.remove('frozen');
    screenNode = null;
    currentThreadId = null;
  });

  screenNode.querySelector('#chat-send').addEventListener('click', () => {
    const v = screenNode.querySelector('#chat-input-text').value.trim();
    if (!v) return;
    ThreadStore.pushMessage(threadId, { from: "You", text: v });
    screenNode.querySelector('#chat-input-text').value = '';
    renderMessages(true);
  });
  screenNode.querySelector('#chat-input-text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') screenNode.querySelector('#chat-send').click();
  });

  // scroll to bottom
  setTimeout(() => { const box = document.getElementById('chat-messages'); if(box) box.scrollTop = box.scrollHeight; }, 120);
}

function populateHeader() {
  const t = ThreadStore.getById(currentThreadId) || { name: 'Unknown', color: '#888' };
  const title = screenNode.querySelector('#chat-title');
  title.textContent = t.name;
  const avatar = document.createElement('div');
  avatar.style.width = '34px'; avatar.style.height = '34px'; avatar.style.borderRadius = '50%';
  avatar.style.background = t.color; avatar.style.marginLeft = '8px';
  screenNode.querySelector('.top').insertBefore(avatar, title);
}

function renderMessages(jumpBottom = false) {
  const thread = ThreadStore.getById(currentThreadId);
  if (!thread) return;
  const box = screenNode.querySelector('#chat-messages');
  box.innerHTML = '';

  // ensure a few simulated messages exist (won't duplicate existing)
  if (!thread._seeded) {
    thread.messages.unshift({ from: thread.name, text: "Hey! This new chat UI looks slick." });
    thread.messages.push({ from: "You", text: "Nice — loving the barrel!" });
    thread._seeded = true;
  }

  thread.messages.forEach(msg => {
    const row = document.createElement('div');
    row.className = `msg ${msg.from === "You" ? 'you' : 'other'}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = msg.text;
    row.appendChild(bubble);
    box.appendChild(row);
  });

  if (jumpBottom) box.scrollTop = box.scrollHeight + 200;
}

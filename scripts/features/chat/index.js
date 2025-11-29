// index.js — module-compatible wrapper for the legacy global-style chat components
// Exports: initChatFeature() and initTextFeature() (alias for compatibility)

export async function initChatFeature() {

  function qs(sel, base=document) { return base.querySelector(sel); }

  // ---------------------------------
  // 1. LOAD CHAT TEMPLATE + CSS
  // ---------------------------------
  async function mountTemplate(){
    try {
      const resp = await fetch('./scripts/features/chat/chat.html');
      const html = await resp.text();
      const wrap = document.createElement('div');
      wrap.innerHTML = html;
      document.body.appendChild(wrap);
    } catch(err) {
      console.warn("chat.html missing, using fallback");
      const fallback = document.createElement('div');
      fallback.id = "chat-root";
      fallback.className = "chat-root hidden";

      fallback.innerHTML = `
        <div id="cylinder-container" class="cylinder-container">
          <div id="cylinder" class="cylinder"></div>
          <button id="cylinder-back" class="cylinder-back">✕</button>
        </div>

        <div id="chat-screen" class="chat-screen hidden">
          <header class="chat-screen-header">
            <button id="chat-back" class="chat-back">←</button>

            <div class="chat-header-title">
              <div id="chat-header-dot" class="chat-header-dot"></div>
              <div id="chat-header-name" class="chat-header-name"></div>
            </div>
          </header>

          <main id="messages" class="messages"></main>

          <form id="chat-form" class="chat-form" autocomplete="off">
            <input id="chat-input" class="chat-input" type="text" placeholder="Message..." />
            <button id="chat-send" class="chat-send" type="submit">Send</button>
          </form>
        </div>
      `;

      document.body.appendChild(fallback);
    }

    // Inject CSS if not already present
    if(!document.querySelector('link[data-dots-chat]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './scripts/features/chat/chat-ui.css';
      link.setAttribute('data-dots-chat','1');
      document.head.appendChild(link);
    }
  }

  // ---------------------------------
  // 2. WAIT FOR GLOBALS (legacy modules)
  // ---------------------------------
  function waitForGlobals() {
    return new Promise(resolve => {
      const check = () => {
        if(
          window.DOTSChatCylinder &&
          window.DOTSChatThreads &&
          window.DOTSChatScreen
        ) { return resolve(); }
        requestAnimationFrame(check);
      };
      check();
    });
  }

  // ---------------------------------
  // 3. MAIN INIT
  // ---------------------------------
  async function init() {
    await mountTemplate();
    await waitForGlobals(); // ensure legacy globals are present

    const root = document.getElementById('chat-root');
    if(!root) {
      console.error("chat root missing");
      return;
    }

    // show chat root full screen
    root.classList.remove('hidden');

    const threadsApi = window.DOTSChatThreads;

    // create cylinder instance (uses legacy global factory)
    const cylinder = window.DOTSChatCylinder.create(root, threadsApi, {
      onThreadOpen: threadId => openThread(threadId)
    });

    // create chat screen instance
    const chatScreen = window.DOTSChatScreen.create(root, threadsApi);

    // open thread: hide cylinder and show chat screen
    function openThread(threadId) {
      const cylContainer = root.querySelector('.cylinder-container');
      if(cylContainer) cylContainer.classList.add('hidden');
      if(chatScreen && typeof chatScreen.open === 'function') chatScreen.open(threadId);
    }

    // when chat screen closes, show cylinder again and refresh list
    window.addEventListener('dots:chat:closed', () => {
      const cylContainer = root.querySelector('.cylinder-container');
      if(cylContainer) cylContainer.classList.remove('hidden');

      // refresh cylinder threads
      try {
        cylinder.threads = threadsApi.load();
        if(typeof cylinder.buildThreads === 'function') cylinder.buildThreads();
        if(typeof cylinder.updateThreads === 'function') cylinder.updateThreads();
      } catch(e){ /* swallow */ }
    });

    // when cylinder requests close -> hide chat root and notify app
    window.addEventListener('dots:cylinder:close', () => {
      root.classList.add('hidden');
      window.dispatchEvent(new CustomEvent('dots:chat:hide'));
    });

    // expose small global API for app shell
    window.DOTSChat = {
      spinToUnread: () => { try { cylinder.spinToUnread(); } catch(e){} },
      openThread: id => openThread(id),
      refresh: () => {
        try {
          cylinder.threads = threadsApi.load();
          cylinder.buildThreads();
          cylinder.updateThreads();
        } catch(e){}
      },
      root
    };

    // autoplay spinToUnread if there are unread threads
    setTimeout(() => {
      try {
        const threads = threadsApi.load();
        if(Array.isArray(threads) && threads.some(t => t && t.hasUnread)) cylinder.spinToUnread();
      } catch(e) {}
    }, 700);
  }

  // Auto-start when module is executed (preserve existing behavior)
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // run but do NOT block; this mirrors your original IIFE behavior
    init().catch(err => console.error('initChatFeature error', err));
  } else {
    document.addEventListener('DOMContentLoaded', () => init().catch(err => console.error('initChatFeature error', err)));
  }
}

// Backwards-compatible alias for old loader code that calls initTextFeature()
export const initTextFeature = initChatFeature;

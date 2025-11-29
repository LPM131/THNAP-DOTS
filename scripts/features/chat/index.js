// index.js
(function(){
  // ensure DOM is ready
  function qs(sel, base=document) { return base.querySelector(sel); }
  function qsa(sel, base=document) { return Array.from(base.querySelectorAll(sel)); }

  // inject template & css if not present
  async function mountTemplate(){
    const rootPlaceholder = document.body;
    // load html if needed (we assume chat.html file exists as raw; if your bundler supports fetch, adjust accordingly)
    // For simplicity, we attempt to fetch chat.html relative to current script.
    try {
      const resp = await fetch('./scripts/features/chat/chat.html');
      const html = await resp.text();
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);
    } catch(e){
      console.warn('Could not fetch chat.html; ensure file is copied. Falling back to in-code template.');
      // fallback: create container manually (minimal)
      const fallback = document.createElement('div');
      fallback.id = 'chat-root';
      fallback.className = 'chat-root hidden';
      fallback.innerHTML = `<div id="cylinder-container" class="cylinder-container"><div id="cylinder" class="cylinder"></div><button id="cylinder-back" class="cylinder-back">✕</button></div><div id="chat-screen" class="chat-screen hidden"><header class="chat-screen-header"><button id="chat-back" class="chat-back">←</button><div class="chat-header-title"><div id="chat-header-dot" class="chat-header-dot"></div><div id="chat-header-name" class="chat-header-name"></div></div></header><main id="messages" class="messages"></main><form id="chat-form" class="chat-form" autocomplete="off"><input id="chat-input" class="chat-input" type="text" placeholder="Message..."/><button id="chat-send" class="chat-send" type="submit">Send</button></form></div>`;
      document.body.appendChild(fallback);
    }

    // inject CSS
    const cssUrl = './scripts/features/chat/chat-ui.css';
    if(!document.querySelector(`link[data-dots-chat]`)){
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssUrl;
      link.setAttribute('data-dots-chat','1');
      document.head.appendChild(link);
    }
  }

  async function init(){
    await mountTemplate();
    const root = document.getElementById('chat-root');
    if(!root) return console.error('chat root missing');

    // show chat root full screen
    root.classList.remove('hidden');

    // create modules
    const threadsApi = window.DOTSChatThreads;
    const cylinder = window.DOTSChatCylinder.create(root, threadsApi, {
      onThreadOpen: (threadId)=>{
        openThread(threadId);
      }
    });

    const chatScreen = window.DOTSChatScreen.create(root, threadsApi);

    // wire navigation between cylinder and chat-screen
    function openThread(threadId){
      // animate cylinder out and open chat
      root.querySelector('.cylinder-container').classList.add('hidden');
      chatScreen.open(threadId);
    }

    // back from chat to cylinder
    window.addEventListener('dots:chat:closed', ()=> {
      root.querySelector('.cylinder-container').classList.remove('hidden');
      // rebuild threads to pick up new previews/unreads
      cylinder.threads = threadsApi.load();
      cylinder.buildThreads();
      cylinder.updateThreads();
    });

    // close cylinder (back to app main grid)
    window.addEventListener('dots:cylinder:close', ()=> {
      // hide chat root and fire event so app returns to main grid
      root.classList.add('hidden');
      window.dispatchEvent(new CustomEvent('dots:chat:hide'));
    });

    // expose quick API
    window.DOTSChat = {
      spinToUnread: ()=> cylinder.spinToUnread(),
      openThread: (id)=> openThread(id),
      root,
      refresh: ()=> {
        cylinder.threads = threadsApi.load();
        cylinder.buildThreads();
        cylinder.updateThreads();
      }
    };

    // autoplay spinToUnread on first load if items with unread
    setTimeout(()=> {
      const threads = threadsApi.load();
      if(threads.some(t=>t.hasUnread)) cylinder.spinToUnread();
    }, 700);
  }

  // init when DOM loaded
  if(['interactive','complete'].includes(document.readyState)) init();
  else document.addEventListener('DOMContentLoaded', init);
})();

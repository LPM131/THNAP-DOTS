// chat-screen.js
(function(global){
  function ChatScreen(rootEl, threadsApi){
    this.root = rootEl;
    this.screen = rootEl.querySelector('#chat-screen');
    this.messagesEl = rootEl.querySelector('#messages');
    this.input = rootEl.querySelector('#chat-input');
    this.form = rootEl.querySelector('#chat-form');
    this.backBtn = rootEl.querySelector('#chat-back');
    this.headerName = rootEl.querySelector('#chat-header-name');
    this.headerDot = rootEl.querySelector('#chat-header-dot');
    this.threadsApi = threadsApi;
    this.activeThreadId = null;
    this.threads = threadsApi.load();
    this.init();
  }

  ChatScreen.prototype.init = function(){
    this.form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const text = this.input.value.trim();
      if(!text) return;
      this.sendMessage(text);
      this.input.value = '';
      this.input.focus();
    });

    this.backBtn.addEventListener('click', ()=>{
      this.close();
    });
  };

  ChatScreen.prototype.open = function(threadId){
    this.activeThreadId = threadId;
    this.threads = this.threadsApi.load();
    const t = this.threads.find(x=>x.id===threadId);
    if(!t) return;
    this.headerName.textContent = t.name;
    this.headerDot.style.background = t.color;
    this.screen.classList.remove('hidden');
    // render messages
    this.renderMessages(t.messages);
    // scroll to bottom
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    // mark read and persist
    this.threadsApi.markRead(this.threads, threadId);
    // save back
    this.threadsApi.save(this.threads);
    // provide focus to input on mobile
    setTimeout(()=> this.input.focus(), 120);
  };

  ChatScreen.prototype.renderMessages = function(messages){
    this.messagesEl.innerHTML = '';
    messages.forEach(m=>{
      const el = document.createElement('div');
      el.className = 'bubble ' + (m.from === 'me' ? 'me' : 'them');
      el.textContent = m.text;
      this.messagesEl.appendChild(el);
    });
  };

  ChatScreen.prototype.sendMessage = function(text){
    const threads = this.threadsApi.load();
    const message = { id: 'm-' + Date.now(), from: 'me', text, ts: Date.now() };
    const t = this.threadsApi.addMessage(threads, this.activeThreadId, message) || threads.find(x=>x.id===this.activeThreadId);
    // add to model and save
    this.threadsApi.save(threads);
    // re-render
    this.renderMessages(t.messages);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    // simulate reply for demo purposes (remove in production)
    setTimeout(()=>{
      const reply = { id: 'm-' + Date.now(), from: 'them', text: 'Auto reply: ' + text, ts: Date.now() };
      this.threadsApi.addMessage(threads, this.activeThreadId, reply);
      this.threadsApi.save(threads);
      if(this.activeThreadId === t.id){
        this.renderMessages(t.messages);
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
      }
    }, 800);
  };

  ChatScreen.prototype.close = function(){
    this.screen.classList.add('hidden');
    // notify app to show cylinder again
    const ev = new CustomEvent('dots:chat:closed');
    window.dispatchEvent(ev);
  };

  global.DOTSChatScreen = {
    create: (rootEl, threadsApi) => new ChatScreen(rootEl, threadsApi)
  };
})(window);

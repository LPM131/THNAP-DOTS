// chat-screen.js — improved legacy/global-style chat screen component
(function(global){
  /**
   * ChatScreen
   * - auto-scroll behavior: only scroll to bottom when user is near bottom (option A)
   * - IME-safe input handling
   * - accessible attributes + send-button enable/disable
   * - refresh() public method to re-render (useful when threads API updates externally)
   */

  // how close to bottom (in px) counts as "near bottom"
  const NEAR_BOTTOM_THRESHOLD = 140;

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
    this.threads = threadsApi.load ? threadsApi.load() : [];
    this._lastRenderTimestamp = 0; // for lightweight change detection
    this._isComposing = false; // IME composition flag

    this.init();
  }

  ChatScreen.prototype.init = function(){
    // Form submit / send
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = (this.input.value || '').trim();
      if (!text) return;
      this.sendMessage(text);
      this.input.value = '';
      this.updateSendState();
      this.input.focus();
    });

    // Input events (composition for IME)
    this.input.addEventListener('compositionstart', () => { this._isComposing = true; });
    this.input.addEventListener('compositionend', () => { this._isComposing = false; this.updateSendState(); });

    this.input.addEventListener('input', () => { this.updateSendState(); });

    // Back / close
    if (this.backBtn) {
      this.backBtn.addEventListener('click', () => this.close());
    }

    // Keyboard: Enter when not composing
    document.addEventListener('keydown', (e) => {
      if (!this.screen || this.screen.classList.contains('hidden')) return;
      if (e.key === 'Enter' && !this._isComposing) {
        // prevent default form submit double-run; form submit already wired
        e.preventDefault();
        const text = (this.input.value || '').trim();
        if (text) {
          this.sendMessage(text);
          this.input.value = '';
          this.updateSendState();
        }
      }
    });

    // If user scrolls manually we track that (used by isNearBottom)
    this.messagesEl.addEventListener('scroll', () => {
      // nothing needed here now, but could be used for badges or lazy load
    });

    // initial send-button state
    this.updateSendState();
  };

  ChatScreen.prototype.updateSendState = function(){
    const sendBtn = this.form.querySelector('button[type="submit"]');
    if (!sendBtn) return;
    const text = (this.input.value || '').trim();
    sendBtn.disabled = !text || this._isComposing;
    sendBtn.setAttribute('aria-disabled', sendBtn.disabled ? 'true' : 'false');
  };

  ChatScreen.prototype.open = function(threadId){
    this.activeThreadId = threadId;
    this.threads = this.threadsApi.load();
    const t = this.threads.find(x => x.id === threadId);
    if (!t) return;

    // header
    this.headerName.textContent = t.name || 'Chat';
    if (this.headerDot) this.headerDot.style.background = t.color || '#333';

    // show
    this.screen.classList.remove('hidden');

    // render messages with auto-scroll behavior A
    this._renderMessagesWithAutoScroll(t.messages);

    // mark read & persist
    try {
      this.threadsApi.markRead(this.threads, threadId);
      if (typeof this.threadsApi.save === 'function') this.threadsApi.save(this.threads);
    } catch(err){ /* swallow */ }

    // focus input after small delay for mobile keyboards
    setTimeout(()=> {
      this.input.focus();
      // ensure send state correct after focus
      this.updateSendState();
    }, 120);
  };

  ChatScreen.prototype.renderMessages = function(messages){
    // Replace messages with safe DOM operations (textContent only)
    this.messagesEl.innerHTML = '';
    const frag = document.createDocumentFragment();
    messages.forEach(m => {
      const el = document.createElement('div');
      el.className = 'bubble ' + (m.from === 'me' ? 'me' : 'them');
      el.setAttribute('role', 'article');
      el.setAttribute('aria-label', `${m.from === 'me' ? 'You' : 'Them'}: ${m.text}`);
      // Ensure untrusted text doesn't get interpreted as HTML:
      el.textContent = m.text;
      frag.appendChild(el);
    });
    this.messagesEl.appendChild(frag);
    this._lastRenderTimestamp = Date.now();
  };

  ChatScreen.prototype._isNearBottom = function(){
    // true if user is within NEAR_BOTTOM_THRESHOLD px of bottom
    const el = this.messagesEl;
    if (!el) return true;
    const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
    return distance <= NEAR_BOTTOM_THRESHOLD;
  };

  ChatScreen.prototype._scrollToBottom = function(behavior = 'auto'){
    const el = this.messagesEl;
    if (!el) return;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior });
    } catch (e) {
      // fallback
      el.scrollTop = el.scrollHeight;
    }
  };

  ChatScreen.prototype._renderMessagesWithAutoScroll = function(messages){
    // Determine whether to auto-scroll (option A)
    const wasNearBottom = this._isNearBottom();
    // Render
    this.renderMessages(messages || []);
    // Scroll if user was near bottom
    if (wasNearBottom) {
      // use smooth if mobile/modern browsers for nicer UX
      this._scrollToBottom('smooth');
    }
  };

  ChatScreen.prototype.sendMessage = function(text){
    // guard
    if (!this.activeThreadId) return;

    // load freshest threads
    const threads = this.threadsApi.load ? this.threadsApi.load() : this.threads;

    const message = { id: 'm-' + Date.now(), from: 'me', text: String(text), ts: Date.now() };

    // add message through threadsApi (if available)
    let thread = null;
    if (typeof this.threadsApi.addMessage === 'function') {
      thread = this.threadsApi.addMessage(threads, this.activeThreadId, message);
    }
    if (!thread) {
      thread = threads.find(x => x.id === this.activeThreadId);
      if (thread) {
        thread.messages = thread.messages || [];
        thread.messages.push(message);
        thread.preview = message.text;
      }
    }

    // persist via API
    if (typeof this.threadsApi.save === 'function') {
      try { this.threadsApi.save(threads); } catch(e){}
    }

    // re-render respecting user's scroll position (auto-scroll if near bottom)
    if (thread) this._renderMessagesWithAutoScroll(thread.messages);

    // simulate demo reply only if threadsApi.simulateReplies true (opt-in)
    if (this.threadsApi && this.threadsApi.simulateReplies) {
      setTimeout(()=> {
        const reply = { id: 'm-' + Date.now(), from: 'them', text: 'Auto reply: ' + text, ts: Date.now() };
        if (typeof this.threadsApi.addMessage === 'function') {
          this.threadsApi.addMessage(threads, this.activeThreadId, reply);
        } else if (thread) {
          thread.messages.push(reply);
          thread.preview = reply.text;
          thread.hasUnread = true;
          thread.justArrived = true;
        }
        try { this.threadsApi.save(threads); } catch(e){}

        // Only re-render if the active thread is still open
        if (this.activeThreadId === thread.id) {
          // If user is near bottom -> auto-scroll, else do NOT force scroll (option A)
          const wasNearBottom = this._isNearBottom();
          this.renderMessages(thread.messages);
          if (wasNearBottom) this._scrollToBottom('smooth');
        }
      }, 700);
    }
  };

  ChatScreen.prototype.close = function(){
    this.screen.classList.add('hidden');
    // notify app to show cylinder again
    const ev = new CustomEvent('dots:chat:closed');
    window.dispatchEvent(ev);
  };

  // Public method to refresh current thread view (useful if threads changed externally)
  ChatScreen.prototype.refresh = function(){
    if (!this.activeThreadId) return;
    const threads = this.threadsApi.load ? this.threadsApi.load() : this.threads;
    const t = threads.find(x => x.id === this.activeThreadId);
    if (!t) return;
    // render but only auto-scroll if user is near bottom (A)
    this._renderMessagesWithAutoScroll(t.messages);
  };

  // Expose factory -- legacy global style
  global.DOTSChatScreen = {
    create: (rootEl, threadsApi) => new ChatScreen(rootEl, threadsApi)
  };
})(window);

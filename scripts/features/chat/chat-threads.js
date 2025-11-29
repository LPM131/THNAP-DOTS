// chat-threads.js
(function(global){
  const STORAGE_KEY = 'dots_chat_threads_v1';

  function defaultThreads(){
    // lightweight demo data; real app will push/populate
    return Array.from({length:12}, (_,i)=>({
      id: `t-${i+1}`,
      name: `User ${i+1}`,
      color: `hsl(${(i*360/12)}, 70%, 55%)`,
      preview: `Last message from User ${i+1}`,
      messages: [{id: `m-${i+1}-1`, from: 'them', text:`Hello from User ${i+1}`, ts: Date.now()}],
      hasUnread: false,
      justArrived: false,
      createdAt: Date.now() - i*100000
    }));
  }

  function load(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) {
        const init = defaultThreads();
        save(init);
        return init;
      }
      return JSON.parse(raw);
    } catch(e){
      console.error('load threads', e);
      const init = defaultThreads();
      save(init);
      return init;
    }
  }

  function save(threads){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  }

  function find(threads, id){
    return threads.find(t=>t.id===id);
  }

  function addMessage(threads, threadId, message){
    const t = find(threads, threadId);
    if(!t) return;
    t.messages.push(message);
    t.preview = message.text;
    t.hasUnread = message.from === 'them' ? true : t.hasUnread;
    t.justArrived = message.from === 'them';
    save(threads);
    return t;
  }

  function createThread(threads, opts){
    const t = Object.assign({
      id: `t-${Date.now()}`,
      name: opts.name||'New',
      color: opts.color || '#888',
      preview: '',
      messages: [],
      hasUnread: false,
      justArrived:false,
      createdAt: Date.now()
    }, opts);
    threads.unshift(t);
    save(threads);
    return t;
  }

  function markRead(threads, threadId){
    const t = find(threads, threadId);
    if(!t) return;
    t.hasUnread = false;
    t.justArrived = false;
    save(threads);
  }

  // expose API
  global.DOTSChatThreads = {
    STORAGE_KEY,
    load,
    save,
    find,
    addMessage,
    createThread,
    markRead
  };
})(window);

// chat-threads.js — cleaned, stable, modern message & thread storage

(function(global){

  const STORAGE_KEY = 'dots-chat-threads-v2';

  // -------------------------------
  // DEFAULT THREADS (optional)
  // -------------------------------
  const DEFAULT_THREADS = [
    {
      id: 1,
      name: "Assistant",
      color: "#4cffb7",
      hasUnread: true,
      messages: [
        {
          id: "initial-1",
          from: "them",
          text: "Hey — welcome to DOTS Chat! 👋",
          ts: Date.now() - 10000
        }
      ]
    }
  ];

  // -------------------------------
  // LOAD FROM STORAGE
  // -------------------------------
  function load(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw){
        // initialize default data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_THREADS));
        return JSON.parse(JSON.stringify(DEFAULT_THREADS));
      }
      return JSON.parse(raw);
    } catch(e){
      console.warn("load threads failed:", e);
      return JSON.parse(JSON.stringify(DEFAULT_THREADS));
    }
  }

  // -------------------------------
  // SAVE TO STORAGE
  // -------------------------------
  function save(threads){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch(e){
      console.error("save threads failed:", e);
    }
  }

  // -------------------------------
  // FIND THREAD
  // -------------------------------
  function findThread(threads, id){
    return threads.find(t => t.id === id);
  }

  // -------------------------------
  // ADD MESSAGE
  // -------------------------------
  function addMessage(threads, threadId, message){
    let t = findThread(threads, threadId);

    // Create thread if missing
    if(!t){
      t = {
        id: threadId,
        name: "Chat " + threadId,
        color: "#666",
        hasUnread: true,
        messages: []
      };
      threads.push(t);
    }

    t.messages.push(message);
    updatePreview(t);
    sortThreads(threads);

    // If message is from "them", mark unread
    if(message.from === "them"){
      t.hasUnread = true;
    }

    return t;
  }

  // -------------------------------
  // MARK THREAD READ
  // -------------------------------
  function markRead(threads, threadId){
    const t = findThread(threads, threadId);
    if(t){
      t.hasUnread = false;
    }
  }

  // -------------------------------
  // UNREAD COUNT
  // -------------------------------
  function unreadCount(threads){
    return threads.filter(t => t.hasUnread).length;
  }

  // -------------------------------
  // PREVIEW TEXT
  // -------------------------------
  function updatePreview(thread){
    const last = thread.messages[thread.messages.length - 1];
    if(!last) return;

    let txt = last.text;
    if(txt.length > 42) txt = txt.slice(0, 42) + "…";
    thread.preview = txt;
    thread.previewTs = last.ts;
  }

  // -------------------------------
  // SORT THREADS (most recent first)
  // -------------------------------
  function sortThreads(threads){
    threads.sort((a,b)=>{
      const ta = a.previewTs || 0;
      const tb = b.previewTs || 0;
      return tb - ta;
    });
  }

  // -------------------------------
  // PUBLIC API
  // -------------------------------
  global.DOTSChatThreads = {
    load,
    save,
    addMessage,
    markRead,
    unreadCount,
    find: findThread,
    sort: sortThreads
  };

})(window);

// chat-threads.js — storage + thread API (localStorage-backed)
const STORAGE_KEY = "dots_threads_v1";

const defaultThreads = [
  {
    id: "t-1",
    name: "Bot",
    color: "#3FA7FF",
    members: ["Bot"],
    preview: "Welcome to DOTS!",
    unread: 0,
    messages: [
      { id: "m-1", from: "Bot", text: "Welcome to DOTS!", ts: Date.now() - 1000 * 60 * 15 }
    ]
  },
  {
    id: "t-2",
    name: "Mom",
    color: "#F76C6C",
    members: ["Mom"],
    preview: "See you soon!",
    unread: 1,
    messages: [
      { id: "m-10", from: "Mom", text: "See you soon!", ts: Date.now() - 1000 * 60 * 60 }
    ]
  },
  {
    id: "t-3",
    name: "Alex",
    color: "#7AF58A",
    members: ["Alex"],
    preview: "Gonna play later?",
    unread: 0,
    messages: [
      { id: "m-20", from: "Alex", text: "Gonna play later?", ts: Date.now() - 1000 * 60 * 60 * 24 }
    ]
  }
];

export const ThreadStore = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultThreads));
        return JSON.parse(JSON.stringify(defaultThreads));
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed loading threads", e);
      return JSON.parse(JSON.stringify(defaultThreads));
    }
  },

  save(threads) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch (e) {
      console.error("Failed saving threads", e);
    }
  },

  getAll() { return this.load(); },

  getById(id) { return this.load().find(t => t.id === id); },

  pushMessage(threadId, message) {
    const threads = this.load();
    const t = threads.find(x => x.id === threadId);
    if (!t) return false;
    const msg = { id: `m-${Date.now()}`, from: message.from, text: message.text, ts: Date.now() };
    t.messages.push(msg);
    t.preview = message.text;
    if (message.from !== "You") t.unread = (t.unread || 0) + 1;
    this.save(threads);
    return true;
  },

  markRead(threadId) {
    const threads = this.load();
    const t = threads.find(x => x.id === threadId);
    if (!t) return;
    t.unread = 0;
    this.save(threads);
  },

  createThread(meta) {
    const threads = this.load();
    const id = `t-${Date.now()}`;
    const t = Object.assign({
      id, name: meta.name || "New", color: meta.color || "#888", members: meta.members || [], preview: "", unread: 0, messages: []
    }, meta);
    threads.push(t);
    this.save(threads);
    return t;
  }

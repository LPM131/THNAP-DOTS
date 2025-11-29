// chat-threads.js — in-memory thread + message store

export const ThreadStore = {
    _threads: [
        {
            id: "general",
            name: "General Chat",
            color: "#4A90E2",
            members: ["Bot"],
            unread: 0,
            messages: [
                { from: "Bot", text: "Welcome to the new text system!" }
            ],
            preview: "Welcome to the new text system!"
        },
        {
            id: "ideas",
            name: "Ideas",
            color: "#50E3C2",
            members: ["Bot"],
            unread: 1,
            justArrived: true,
            messages: [
                { from: "Bot", text: "What should we build next?" }
            ],
            preview: "What should we build next?"
        },
        {
            id: "log",
            name: "Log",
            color: "#F5A623",
            members: ["Bot"],
            unread: 0,
            messages: [
                { from: "Bot", text: "This is your activity log." }
            ],
            preview: "This is your activity log."
        }
    ],

    getAll() {
        return this._threads;
    },

    getById(id) {
        return this._threads.find(t => t.id === id);
    },

    markRead(id) {
        const t = this.getById(id);
        if (t) t.unread = 0;
    },

    pushMessage(id, msg) {
        const t = this.getById(id);
        if (!t) return;

        t.messages.push(msg);
        t.preview = msg.text;
        if (msg.from !== "You") t.unread++;
    }
};

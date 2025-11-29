// scripts/features/chat/index.js

// Entry point for the Text feature
export async function initTextFeature() {
    console.log("[Text] Initializing Text Feature…");

    // -------------------------------
    // 1. Create a dedicated container
    // -------------------------------
    let root = document.getElementById("chat-root");
    if (!root) {
        root = document.createElement("div");
        root.id = "chat-root";
        document.body.appendChild(root);
    }
    root.innerHTML = ""; // reset if reused

    // -------------------------------
    // 2. Load chat.html template
    // -------------------------------
    try {
        const htmlUrl = new URL("chat.html", import.meta.url);

        const htmlText = await fetch(htmlUrl).then(res => {
            if (!res.ok) throw new Error("chat.html not found");
            return res.text();
        });

        root.innerHTML = htmlText;
        console.log("[Text] chat.html loaded successfully");

    } catch (err) {
        console.error("[Text] Failed to load chat.html:", err);
        return;
    }

    // -------------------------------
    // 3. Load cylinder (FIRST)
    // -------------------------------
    try {
        const cylinder = await import("./chat-cylinder.js");
        cylinder.initCylinder();
        console.log("[Text] Barrel Cylinder initialized");
    } catch (err) {
        console.error("[Text] Failed to load chat-cylinder.js:", err);
    }

    // -------------------------------
    // 4. Load chat message screen
    // -------------------------------
    try {
        const screen = await import("./chat-screen.js");
        screen.initChatScreen();
        console.log("[Text] Chat Screen initialized");
    } catch (err) {
        console.error("[Text] Failed to load chat-screen.js:", err);
    }

    // -------------------------------
    // 5. Load animations LAST
    // -------------------------------
    try {
        const anim = await import("./chat-animations.js");
        anim.attachChatAnimations();
        console.log("[Text] Chat animations ready");
    } catch (err) {
        console.error("[Text] Failed to load chat-animations.js:", err);
    }
}

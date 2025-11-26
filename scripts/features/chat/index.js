// scripts/features/chat/index.js

// Entry point for the Text feature
export async function initTextFeature() {
    console.log("[Text] Initializing Text Feature…");

    // 1. Get the fullscreen root container
    const root = document.getElementById("chat-root");
    if (!root) {
        console.error("[Text] ERROR: #chat-root not found in DOM");
        return;
    }

    // 2. Make sure the root is visible
    root.classList.remove("hidden");
    root.innerHTML = ""; // clear previous content if user reopens

    // 3. Load chat.html template
    try {
        const html = await fetch("/scripts/features/chat/chat.html")
            .then(res => {
                if (!res.ok) throw new Error("chat.html not found");
                return res.text();
            });

        // Insert the HTML template into the fullscreen root
        root.innerHTML = html;
        console.log("[Text] chat.html loaded successfully");

    } catch (err) {
        console.error("[Text] Failed to load chat.html:", err);
        return;
    }

    // 4. Load Barrel Cylinder Logic
    try {
        const cylinderModule = await import("./chat-cylinder.js");
        cylinderModule.initCylinder();
        console.log("[Text] Barrel Cylinder initialized");
    } catch (err) {
        console.error("[Text] Failed to load chat-cylinder.js:", err);
    }

    // 5. Load Chat Screen Logic (iMessage messages view)
    try {
        const screenModule = await import("./chat-screen.js");
        screenModule.initChatScreen();
        console.log("[Text] Chat Screen initialized");
    } catch (err) {
        console.error("[Text] Failed to load chat-screen.js:", err);
    }

    // 6. Load animations (DOT fly-up, chat drop-down)
    try {
        const animations = await import("./chat-animations.js");
        animations.attachChatAnimations();
        console.log("[Text] Chat animations ready");
    } catch (err) {
        console.error("[Text] Failed to load chat-animations.js:", err);
    }
}

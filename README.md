# DOTS — Innovative Dots-Based Messaging Platform

DOTS is a mobile-first Progressive Web App (PWA) that reimagines interfaces with a "dots everywhere" paradigm. Every feature and action is represented as a tactile circular dot. The project emphasizes a snappy UX, offline-first behavior, and elegant micro-interactions — notably a 3D cylindrical ("barrel") chat selector with physics-based rotation and a fullscreen chat overlay.

## Key Ideas & Philosophy

- **Everything is a dot**: UI, navigation, notifications and actions use circular touch targets.
- **Mobile-first & tactile**: Designed for touch with large hit targets and gestures.
- **Self-contained PWA**: Offline-first with local persistence (localStorage / future IndexedDB).
- **Snappy UX**: Lightweight vanilla JS + CSS; minimal dependencies; smooth animations.

## What's Included

- 3D barrel-style thread selector with momentum, snap-to-center, unread sonar, and auto-spin.
- Fullscreen chat overlay with simple conversation UI and simulated messages.
- Wordle-like daily word game (offline-capable).
- Modular code under `scripts/features/` for easy maintenance and extension.

## Project Structure (Important Files)

```
THNAP-DOTS/
├─ index.html
├─ script.js               # global app glue, grid + navigation
├─ style.css
├─ manifest.json
├─ README.md
└─ scripts/
   └─ features/
      └─ chat/
         ├─ chat-cylinder.js    # barrel physics + thread rendering
         ├─ chat-screen.js      # fullscreen chat view
         ├─ chat-threads.js     # in-memory thread store (seed data)
         ├─ chat-animations.js  # dot <-> overlay animations
         ├─ chat-ui.css         # styling for fullscreen barrel UI
         └─ chat.html           # chat overlay markup template
```

The chat feature is intentionally modular: `scripts/features/chat/index.js` bootstraps `chat.html`, then imports `chat-cylinder.js`, `chat-screen.js`, etc.

## Quick Start (Developer)

Clone the repository:

```bash
git clone https://github.com/LPM131/THNAP-DOTS.git
cd THNAP-DOTS
```

Run a lightweight local server (recommended so `import.meta.url` and fetches behave like production):

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

Open the app in a modern browser (Chrome/Edge/Firefox). Use devtools to test mobile viewport.

## Development Notes & Best Practices

- Use vanilla JS modules (ESM). When importing files relative to a module, prefer:

  ```js
  const url = new URL('./chat-ui.css', import.meta.url).href;
  ```

  This guarantees the correct relative resolution whether files are loaded from the root, a nested path, or GitHub Pages.

- Keep feature code self-contained in `scripts/features/<feature>/`.
- Persist user-visible state in localStorage (or migrate to IndexedDB for larger datasets).
- Make animation loops passive-friendly and avoid heavy work on the main thread.

## Deploying (GitHub Pages)

Push `main` to GitHub.

In your repository settings → Pages:

- **Source**: Deploy from a branch → `main` → `root (/)`.

Save.

Wait a minute. Visit `https://<username>.github.io/<repo>/` or the custom domain you set.

## Troubleshooting — Common Issues (and Fixes)

### 1) `chat-ui.css` 404 in the console

**Causes & Fixes:**

- **Wrong href path**: Ensure `chat-cylinder.js` injects the stylesheet with a relative path resolved from that module:

  ```js
  // preferred in chat-cylinder.js
  const cssUrl = new URL('./chat-ui.css', import.meta.url).href;
  link.href = cssUrl;
  ```

- **File not committed / not in the repo location**: Confirm `scripts/features/chat/chat-ui.css` exists in GitHub and on your local branch.
- **Case sensitivity**: `chat-ui.css` vs `Chat-UI.css` — GitHub is case-sensitive. Make sure file name and path casing match.
- **GitHub Pages serving path**: Double-check the deployed URL. If you open the file in your browser via the GitHub UI and see plain text, that's normal — raw GitHub file views are not the same as the raw file URL used from the site. Use the site root (deployed GitHub Pages URL) to test.
- **Browser cache**: Do a hard refresh (Ctrl+F5) or open DevTools → Network → Disable cache while devtools open.

### 2) `SyntaxError: Unexpected end of input`

Usually caused by incomplete file uploads or trailing partial commits. Re-open the file in VS Code and ensure there's no corruption. Re-commit if needed.

### 3) Blank page / app not loading but repo shows changes

Ensure index.html references are correct, and you served with a static server (some imports require HTTP origin).

Check Console for the first error — subsequent errors may cascade.

### 4) Local VS Code file types showing as different icons (blue #, etc.)

That's visual only — confirm the file extension actually ends with `.css` and the file contents are valid CSS. Windows file properties confirmed earlier shows it's a CSS file — good.

## UX / Feature Requests (Ready Roadmap)

- Restore exact original barrel physics (you provided a standalone barrel UI that you prefer). I can:
  - Merge its rotation/momentum math into `chat-cylinder.js` while keeping modular APIs.
  - Keep the enhanced UI structure (header/back button/styling) from `chat-ui.css`.
  - Add more seeded messages per thread for realistic simulation.
  - Improve spin behavior so it rotates one circular direction only (no figure-8), and add a per-thread easing profile.

If you want, tell me which barrel file is canonical (paste it again or give the commit SHA) and I'll create a PR-ready patch that copies the original physics math into `chat-cylinder.js` and keeps the existing file layout.

## Contributing

- Keep changes modular and backwards-compatible.
- When adding feature files, place them under `scripts/features/<name>/`.
- Add tests or at least manual QA steps for UI (mobile + desktop).

## License

MIT — see LICENSE (or add one). Free to modify and redistribute.

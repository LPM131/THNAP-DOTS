// main.js — will import + initialize all modules
import { initViewportFix } from "./core/viewport.js";

// Feature imports (implementations coming soon)
import { initWordleFeature } from "./features/wordle/index.js";
import { initTextFeature } from "./features/chat/index.js";
import { initPokemonFeature } from "./features/pokemon/index.js";

export function initApp() {
  initViewportFix();
  initWordleFeature();
  initTextFeature();
  initPokemonFeature();
}

initApp();

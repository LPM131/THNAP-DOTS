// navigation.js — handles showing/hiding modals + screens
export function show(id) {
  document.getElementById(id).classList.remove("hidden");
}

export function hide(id) {
  document.getElementById(id).classList.add("hidden");
}

export function go(mainId, ...hideIds) {
  hideIds.forEach(h => hide(h));
  show(mainId);
}

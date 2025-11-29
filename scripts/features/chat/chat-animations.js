// chat-animations.js
(function(global){
  function fadeOut(el, duration=240){
    el.style.transition = `opacity ${duration}ms ease`;
    el.style.opacity = '0';
    return new Promise(resolve => setTimeout(()=>{ el.style.display='none'; resolve(); }, duration));
  }
  function fadeIn(el, duration=240, display='block'){
    el.style.display = display;
    el.style.opacity = '0';
    el.style.transition = `opacity ${duration}ms ease`;
    requestAnimationFrame(()=> el.style.opacity = '1');
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  global.DOTSChatAnimations = { fadeIn, fadeOut };
})(window);

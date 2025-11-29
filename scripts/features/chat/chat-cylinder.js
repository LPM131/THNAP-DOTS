// chat-cylinder.js — clean, modern, stable 3D message cylinder

(function(global){

  function Cylinder(rootEl, threadsApi, opts={}) {
    this.root = rootEl;
    this.api = threadsApi;
    this.cb = opts.onThreadOpen || (()=>{});

    this.container = rootEl.querySelector(".cylinder-container");
    this.cylinder = rootEl.querySelector("#cylinder");

    this.threads = [];
    this.angle = 0;
    this.radius = 300; 
    this.count = 0;

    this.dragging = false;
    this.startY = 0;
    this.startAngle = 0;

    this.init();
  }

  // ------------------------------
  // INIT
  // ------------------------------
  Cylinder.prototype.init = function(){
    this.threads = this.api.load();
    this.buildThreads();
    this.updateThreads();

    this.attachEvents();
  };

  // ------------------------------
  // BUILD THREAD DOM
  // ------------------------------
  Cylinder.prototype.buildThreads = function(){
    this.cylinder.innerHTML = "";

    this.threads = this.api.load();
    this.count = this.threads.length;

    this.threadEls = this.threads.map((t, i) => {
      const el = document.createElement("div");
      el.className = "thread";

      el.innerHTML = `
        <div class="dot" style="background:${t.color};"></div>
        <div class="meta">
          <div class="name">${t.name}</div>
          <div class="preview">${t.preview || ""}</div>
        </div>
      `;

      el.dataset.id = t.id;

      el.addEventListener("click", () => {
        this.cb(t.id);
      });

      this.cylinder.appendChild(el);
      return el;
    });
  };

  // ------------------------------
  // UPDATE POSITIONS
  // ------------------------------
  Cylinder.prototype.updateThreads = function(){
    if(!this.threadEls) return;

    const step = 360 / Math.max(1, this.count);

    this.threadEls.forEach((el, i) => {
      const ang = this.angle + i * step;
      const rad = ang * Math.PI / 180;

      const y = Math.sin(rad) * this.radius;
      const z = Math.cos(rad) * this.radius;

      const isFront = z > 0;

      el.style.transform = `
        translate3d(-50%, -50%, ${z}px)
        translateY(${y}px)
      `;

      el.style.opacity = isFront ? "1" : "0.14";
      el.style.pointerEvents = isFront ? "auto" : "none";

      el.classList.toggle("active", isFront);

      // unread bump
      const id = parseInt(el.dataset.id);
      const t = this.threads.find(x => x.id === id);
      if(t && t.hasUnread && isFront){
        el.classList.add("bounce");
        setTimeout(()=> el.classList.remove("bounce"), 900);
      }
    });
  };

  // ------------------------------
  // TOUCH + DRAG + SCROLL
  // ------------------------------
  Cylinder.prototype.attachEvents = function(){
    const cyl = this.cylinder;

    // TOUCH
    cyl.addEventListener("touchstart", e => {
      this.dragging = true;
      this.startY = e.touches[0].clientY;
      this.startAngle = this.angle;
    }, { passive:false });

    cyl.addEventListener("touchmove", e => {
      if(!this.dragging) return;
      const dy = e.touches[0].clientY - this.startY;
      this.angle = this.startAngle + (dy * 0.25);
      this.updateThreads();
      e.preventDefault();
    }, { passive:false });

    cyl.addEventListener("touchend", () => {
      this.dragging = false;
    });

    // MOUSE SCROLL
    cyl.addEventListener("wheel", e => {
      this.angle += e.deltaY * 0.2;
      this.updateThreads();
    }, { passive:true });
  };

  // ------------------------------
  // REFRESH (called by index.js)
  // ------------------------------
  Cylinder.prototype.refresh = function(){
    this.threads = this.api.load();
    this.buildThreads();
    this.updateThreads();
  };

  global.DOTSChatCylinder = {
    create: (root, api, opts) => new Cylinder(root, api, opts)
  };

})(window);

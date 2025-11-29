// chat-cylinder.js
(function(global){
  const RADIUS = 450;
  const ANGLE_STEP = 18;

  function Cylinder(rootEl, threadsApi, opts = {}){
    this.root = rootEl;
    this.cyl = rootEl.querySelector('#cylinder');
    this.backBtn = rootEl.querySelector('#cylinder-back');
    this.rotationX = 0;
    this.angleStep = ANGLE_STEP;
    this.radius = RADIUS;
    this.dragging = false;
    this.prevY = 0;
    this.velocity = 0;
    this.momentum = null;
    this.threadsApi = threadsApi;
    this.threads = threadsApi.load();
    this.onThreadOpen = opts.onThreadOpen || function(){};
    this.init();
  }

  Cylinder.prototype.init = function(){
    this.buildThreads();
    this.attachEvents();
    this.updateThreads();
    requestAnimationFrame(()=>this.loop());
  };

  Cylinder.prototype.buildThreads = function(){
    this.cyl.innerHTML = '';
    this.threads.forEach((t,i) => {
      const div = document.createElement('div');
      div.className = 'thread';
      div.dataset.index = i;
      div.dataset.id = t.id;

      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.style.background = t.color;
      dot.style.boxShadow = `0 0 12px ${t.color}`;

      const meta = document.createElement('div');
      meta.className = 'meta';

      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = t.name;

      const preview = document.createElement('div');
      preview.className = 'preview';
      preview.textContent = t.preview || '';

      meta.appendChild(name);
      meta.appendChild(preview);
      div.appendChild(dot);
      div.appendChild(meta);

      div.addEventListener('click', () => {
        // open thread
        this.onThreadOpen(t.id);
      });

      this.cyl.appendChild(div);
    });
  };

  Cylinder.prototype.attachEvents = function(){
    // pointer for better touch support
    this.cyl.addEventListener('pointerdown', (e)=>{
      e.preventDefault();
      this.dragging = true;
      this.prevY = e.clientY;
      this.velocity = 0;
      if(this.momentum) { clearInterval(this.momentum); this.momentum = null; }
      this.cyl.setPointerCapture && this.cyl.setPointerCapture(e.pointerId);
    });

    window.addEventListener('pointermove', (e)=>{
      if(!this.dragging) return;
      const dy = e.clientY - this.prevY;
      this.rotationX += dy*1.2;
      this.velocity = dy*1.2;
      this.prevY = e.clientY;
      this.updateThreads();
    });

    window.addEventListener('pointerup', (e)=>{
      if(!this.dragging) return;
      this.dragging = false;
      // momentum
      this.momentum = setInterval(()=>{
        this.velocity *= 0.92;
        this.rotationX += this.velocity;
        this.updateThreads();
        if(Math.abs(this.velocity) < 0.1){
          clearInterval(this.momentum);
          this.momentum = null;
          this.snapToNearest();
        }
      }, 16);
    });

    window.addEventListener('wheel', (e)=>{
      this.rotationX += (e.deltaY > 0) ? 15 : -15;
      this.updateThreads();
      this.snapToNearestDebounced();
    });

    this.backBtn.addEventListener('click', () => {
      // dispatch close event
      const ev = new CustomEvent('dots:cylinder:close');
      window.dispatchEvent(ev);
    });
  };

  Cylinder.prototype.updateThreads = function(){
    const threadsEls = Array.from(this.cyl.querySelectorAll('.thread'));
    const threadsData = this.threads;
    threadsEls.forEach((threadEl) => {
      const idx = Number(threadEl.dataset.index);
      const item = threadsData[idx];
      const angle = this.angleStep * idx + this.rotationX;
      const rad = angle * Math.PI/180;
      const z = this.radius * Math.cos(rad);
      const y = this.radius * Math.sin(rad);
      let scale = 0.5 + 0.5 * ((z + this.radius)/(2*this.radius));
      const opacity = 0.28 + 0.72 * ((z + this.radius)/(2*this.radius));
      const tilt = -y * 0.05;

      const dot = threadEl.querySelector('.dot');

      // sonar handling
      const existingSonar = threadEl.querySelector('.sonar');
      threadEl.classList.remove('bounce');
      if(item.hasUnread){
        if(item.justArrived && !existingSonar){
          const sonar = document.createElement('div');
          sonar.className = 'sonar';
          sonar.style.borderColor = item.color;
          dot.appendChild(sonar);
          // mark that animation was applied so we don't re-add it repeatedly
          item.justArrived = false;
          setTimeout(()=>{ threadEl.classList.add('bounce'); }, 1200);
        }
      } else {
        if(existingSonar) existingSonar.remove();
      }

      threadEl.style.transform = `translateY(${y}px) translateZ(${z}px) rotateX(${tilt}deg) scale(${scale})`;
      threadEl.style.opacity = opacity;
    });
    this.highlightActiveThread();
  };

  Cylinder.prototype.highlightActiveThread = function(){
    let closestIdx = 0;
    let minDiff = Infinity;
    const threadsEls = Array.from(this.cyl.querySelectorAll('.thread'));
    threadsEls.forEach(threadEl => {
      const idx = Number(threadEl.dataset.index);
      let threadAngle = this.angleStep * idx + this.rotationX;
      threadAngle = ((threadAngle % 360) + 360) % 360;
      const diff = Math.min(Math.abs(threadAngle), Math.abs(360 - threadAngle));
      if(diff < minDiff){ minDiff = diff; closestIdx = idx; }
    });
    threadsEls.forEach(t => t.classList.remove('active'));
    const active = this.cyl.querySelector(`.thread[data-index="${closestIdx}"]`);
    if(active) active.classList.add('active');
  };

  Cylinder.prototype.snapToNearest = function(){
    const target = Math.round(this.rotationX / this.angleStep) * this.angleStep;
    const start = this.rotationX;
    const diffTotal = target - start;
    const duration = 280;
    const startTime = performance.now();
    const step = () => {
      const now = performance.now();
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      this.rotationX = start + diffTotal * ease;
      this.updateThreads();
      if(t < 1) requestAnimationFrame(step);
      else {
        this.rotationX = target;
        this.updateThreads();
      }
    };
    requestAnimationFrame(step);
  };

  Cylinder.prototype.snapToNearestDebounced = function(){
    clearTimeout(this._snapT);
    this._snapT = setTimeout(()=> this.snapToNearest(), 120);
  };

  Cylinder.prototype.spinToUnread = function(){
    const unread = this.threads.filter(t=>t.hasUnread);
    if(!unread.length) return;
    const firstIdx = this.threads.indexOf(unread[0]);
    const targetAngle = -firstIdx * this.angleStep;
    const start = this.rotationX;
    const diff = targetAngle - start + 360*1;
    const duration = 880;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      this.rotationX = start + diff * ease;
      this.updateThreads();
      if(t < 1) requestAnimationFrame(animate);
      else {
        this.rotationX = targetAngle;
        this.updateThreads();
        // trigger sonar on unread items
        this.threads.forEach((item, idx) => {
          if(item.hasUnread){
            item.justArrived = true;
            // no immediate save — leave to threads API to persist when required
          }
        });
        // re-render to create sonar
        this.updateThreads();
      }
    };
    requestAnimationFrame(animate);
  };

  Cylinder.prototype.loop = function(){
    // If underlying thread data changed (external push), reload
    const latest = this.threadsApi.load();
    // shallow compare length or timestamps
    if(latest.length !== this.threads.length){
      this.threads = latest;
      this.buildThreads();
      this.updateThreads();
    } else {
      // update previews/unread flags
      let changed = false;
      for(let i=0;i<latest.length;i++){
        if(latest[i].preview !== this.threads[i].preview || latest[i].hasUnread !== this.threads[i].hasUnread){
          changed = true; break;
        }
      }
      if(changed){
        this.threads = latest;
        this.updateThreads();
      }
    }
    requestAnimationFrame(()=>this.loop());
  };

  // export factory
  global.DOTSChatCylinder = {
    create: (rootEl, threadsApi, opts) => new Cylinder(rootEl, threadsApi, opts)
  };
})(window);

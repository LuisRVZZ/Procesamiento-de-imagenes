// --- Rotación con dedo/mouse y pinch-zoom ---
AFRAME.registerComponent('drag-rotate-scale', {
  schema: {
    rotateSpeed: {type: 'number', default: 0.4},
    scaleMin:   {type: 'number', default: 0.005},
    scaleMax:   {type: 'number', default: 0.2},
    enableX:    {type: 'boolean', default: true},   // rotar en X
    enableY:    {type: 'boolean', default: true}    // rotar en Y
  },
  init: function () {
    this.dragging = false;
    this.lastX = 0; this.lastY = 0;
    this.startScale = this.el.object3D.scale.clone();
    this.startRot = this.el.object3D.rotation.clone();

    const scene = this.el.sceneEl;
    const canvas = scene.canvas || scene.renderer?.domElement;

    const onReady = () => {
      this.canvas = scene.canvas || scene.renderer?.domElement;
      this.addListeners();
    };

    if (canvas) onReady();
    else scene.addEventListener('render-target-loaded', onReady);
  },
  addListeners: function(){
    const c = this.canvas;

    // Rotación (un dedo / mouse)
    this._onDown = (e)=> {
      if (e.pointerType === 'touch' && e.isPrimary === false) return;
      this.dragging = true;
      this.lastX = e.clientX; this.lastY = e.clientY;
    };
    this._onMove = (e)=> {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      const rot = this.el.object3D.rotation;
      if (this.data.enableY) rot.y -= dx * 0.002 * this.data.rotateSpeed; // Yaw
      if (this.data.enableX) rot.x -= dy * 0.002 * this.data.rotateSpeed; // Pitch
      rot.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, rot.x)); // limitar inclinación
      this.lastX = e.clientX; this.lastY = e.clientY;
    };
    this._onUp = ()=> { this.dragging = false; };
    this._onDbl = ()=> {
      // Reset
      this.el.object3D.scale.copy(this.startScale);
      this.el.object3D.rotation.copy(this.startRot);
    };

    c.addEventListener('pointerdown', this._onDown, {passive:false});
    window.addEventListener('pointermove', this._onMove, {passive:false});
    window.addEventListener('pointerup',   this._onUp,   {passive:false});
    c.addEventListener('dblclick', this._onDbl);

    // Pinch zoom
    let pinchStart = 0, baseScale = null;
    const dist = (t0, t1)=> Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);

    c.addEventListener('touchstart', (e)=>{
      if (e.touches.length === 2){
        pinchStart = dist(e.touches[0], e.touches[1]);
        baseScale = this.el.object3D.scale.clone();
      }
    }, {passive:false});

    c.addEventListener('touchmove', (e)=>{
      if (e.touches.length === 2 && pinchStart > 0){
        e.preventDefault();
        const factor = dist(e.touches[0], e.touches[1]) / pinchStart;
        const s = Math.max(this.data.scaleMin, Math.min(this.data.scaleMax, baseScale.x * factor));
        this.el.object3D.scale.set(s, s, s);
      }
    }, {passive:false});

    c.addEventListener('touchend', ()=>{ pinchStart = 0; }, {passive:true});
  },
  remove: function(){
    const c = this.canvas; if(!c) return;
    c.removeEventListener('pointerdown', this._onDown);
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    c.removeEventListener('dblclick', this._onDbl);
  }
});

// --- Banner + rótulo "MÉXICO" (targetFound / targetLost) ---
window.addEventListener('load', () => {
  const status = document.getElementById('status');
  const anchor = document.getElementById('anchor');
  const label  = document.getElementById('labelGroup');

  if (status) status.style.display = 'block';
  if (!anchor) return;

  // Helper: animar escala (pop in/out)
  const animateScale = (el, to, dur=300) => {
    if (!el) return;
    el.setAttribute('animation__scale', {
      property: 'scale',
      to: `${to} ${to} ${to}`,
      dur: dur,
      easing: 'easeOutCubic'
    });
  };

  anchor.addEventListener('targetFound', () => {
    if (status) status.style.display = 'none';
    if (label) {
      label.setAttribute('visible', 'true');
      animateScale(label, 1, 280);
    }
  });

  anchor.addEventListener('targetLost', () => {
    if (status) {
      status.style.display = 'block';
      status.textContent = 'No veo el marcador. Vuelve a apuntar.';
    }
    if (label) {
      animateScale(label, 0, 220);
      setTimeout(() => label.setAttribute('visible', 'false'), 230);
    }
  });
});

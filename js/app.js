const scene   = document.getElementById('scene');
const status  = document.getElementById('status');
const root    = document.getElementById('anchors-root');
const btnAnim = document.getElementById('btnAnim');
const toolbar = document.getElementById('toolbar'); // opcional mostrar/ocultar

/* ===== Defaults globales ===== */
const DEFAULT_MODEL_SCALE = 0.10;
const DEFAULT_MODEL_POSX  = 0.73; // derecha
const DEFAULT_MODEL_POSY  = 0.01; // altura base
const DEFAULT_MODEL_POSZ  = 0.16; // al frente
const DEFAULT_MODEL_ROTY  = 0;

/* ===== Mapeo por país ===== */
const MAP = [
  { imgId:'flag0',  label:'ARABIA SAUDITA',  modelId:'mdlArabia',    tx:{ scale:0.02, posX:0.60, posY:0.03, posZ:0.07, rotY:0 } },
  { imgId:'flag1',  label:'ARGELIA',         modelId:'mdlCoffee',    tx:{ scale:0.15,               posY:0.04,               rotY:10 } },
  { imgId:'flag2',  label:'ARGENTINA',       modelId:'mdlArgentina', tx:{ scale:0.45,               posY:0.04,               rotY:-10 } },
  { imgId:'flag3',  label:'AUSTRALIA',       modelId:'mdlBalon',     tx:{ scale:0.13 } },
  { imgId:'flag4',  label:'BRASIL',          modelId:'mdlCopa',      tx:{ scale:0.57 } },
  { imgId:'flag5',  label:'CABO VERDE',      modelId:'mdlBote',      tx:{ scale:0.51 } },
  { imgId:'flag6',  label:'CANADÁ',          modelId:'mdlCanada',    tx:{ scale:0.23,               posY:0.05,               rotY:12 } },
  { imgId:'flag7',  label:'CATAR',           modelId:'mdlDonut',     tx:{ scale:0.15 } },
  { imgId:'flag8',  label:'COLOMBIA',        modelId:'mdlCoffee',    tx:{ scale:0.15 } },
  { imgId:'flag9',  label:'COREA DEL SUR',   modelId:'mdlCorea',     tx:{ scale:0.23,               posY:0.05 } },
  { imgId:'flag10', label:'COSTA DE MARFIL', modelId:'mdlBalon',     tx:{ scale:0.13 } },
  { imgId:'flag11', label:'ECUADOR',         modelId:'mdlCopa',      tx:{ scale:0.57 } },
  { imgId:'flag12', label:'ESTADOS UNIDOS',  modelId:'mdlUSA',       tx:{ scale:0.23,               posY:0.05 } },
  { imgId:'flag13', label:'INGLATERRA',      modelId:'mdlCoffee',    tx:{ scale:0.15 } },
  { imgId:'flag14', label:'IRÁN',            modelId:'mdlDonut',     tx:{ scale:0.15 } },
  { imgId:'flag15', label:'JAPÓN',           modelId:'mdlJapon',     tx:{ scale:0.22 } },
  { imgId:'flag16', label:'JORDANIA',        modelId:'mdlCheese',    tx:{ scale:0.12 } },
  { imgId:'flag17', label:'MÉXICO',          modelId:'mdlMexico',    tx:{ scale:0.009, posX:0.60, posY:0.04, posZ:0.07, rotY:18 } },
  { imgId:'flag18', label:'PARAGUAY',        modelId:'mdlBalon',     tx:{ scale:0.13 } },
  { imgId:'flag19', label:'SENEGAL',         modelId:'mdlBote',      tx:{ scale:0.51 } },
  { imgId:'flag20', label:'SUDÁFRICA',       modelId:'mdlBalon',     tx:{ scale:0.13 } },
  { imgId:'flag21', label:'URUGUAY',         modelId:'mdlCopa',      tx:{ scale:0.57 } }
];

/* ===== Listas para pausar/reanudar ===== */
const modelsList = []; // a-entity (modelos)
const flagsList  = []; // a-image (banderas)
let animationsPlaying = true;

/* ===== Helpers ===== */
const pop = (el, to, dur = 240) =>
  el?.setAttribute('animation__scale', { property:'scale', to:`${to} ${to} ${to}`, dur, easing:'easeOutCubic' });

function addImage(anchor, imgId) {
  if (!document.getElementById(imgId))
    console.warn(`⚠️ Falta <img id="${imgId}"> en <a-assets>.`);
  const img = document.createElement('a-image');
  img.setAttribute('src', `#${imgId}`);
  img.setAttribute('position', '0 0 0.12');
  img.setAttribute('width', '1');
  img.setAttribute('height', '0.6');
  img.setAttribute('material', 'side: double');
  // 🔁 Nombrada como animation__flag para poder pausar/reanudar
  img.setAttribute(
    'animation__flag',
    'property: position; to: 0 0.06 0.12; dur:1000; easing:easeInOutQuad; loop:true; dir:alternate'
  );
  anchor.appendChild(img);
  flagsList.push(img);
}

/* ===== Animaciones por tipo de modelo ===== */
function applyPresetAnimations(modelId, el, posX, posY, posZ, scale) {
  const bob = 0.08;
  const slow = 1600, fast = 700;

  if (modelId === 'mdlBalon') {
    el.setAttribute('animation__bounce',
      `property: position; to: ${posX} ${posY + 0.12} ${posZ}; dur:${fast}; easing:easeInOutCubic; loop:true; dir:alternate`);
    el.setAttribute('animation__spin',
      'property: rotation; to: 0 360 0; dur:4000; easing:linear; loop:true');
  }
  else if (modelId === 'mdlCopa') {
    el.setAttribute('animation__float',
      `property: position; to: ${posX} ${posY + bob/2} ${posZ}; dur:${slow}; easing:easeInOutSine; loop:true; dir:alternate`);
    el.setAttribute('animation__spin',
      'property: rotation; to: 0 360 0; dur:8000; easing:linear; loop:true');
  }
  else if (modelId === 'mdlBote') {
    el.setAttribute('animation__sway',
      'property: rotation; to: 0 0 8; dur:1800; easing:easeInOutSine; loop:true; dir:alternate');
    el.setAttribute('animation__float',
      `property: position; to: ${posX} ${posY + bob} ${posZ}; dur:1800; easing:easeInOutSine; loop:true; dir:alternate`);
  }
  else if (modelId === 'mdlDonut') {
    el.setAttribute('animation__spin',
      'property: rotation; to: 0 360 0; dur:5000; easing:linear; loop:true');
    el.setAttribute('animation__bob',
      `property: position; to: ${posX} ${posY + bob/2} ${posZ}; dur:${slow}; easing:easeInOutSine; loop:true; dir:alternate`);
  }
  else if (modelId === 'mdlCoffee') {
    el.setAttribute('animation__wobble',
      'property: rotation; to: 4 0 -4; dur:1200; easing:easeInOutSine; loop:true; dir:alternate');
    el.setAttribute('animation__bob',
      `property: position; to: ${posX} ${posY + bob/3} ${posZ}; dur:${slow}; easing:easeInOutSine; loop:true; dir:alternate`);
  }
  else if (/^mdl(Arabia|Argentina|USA|Canada|Corea|Japon|Mexico)$/.test(modelId)) {
    el.setAttribute('animation__hover',
      `property: position; to: ${posX} ${posY + bob/2} ${posZ}; dur:${slow}; easing:easeInOutSine; loop:true; dir:alternate`);
    el.setAttribute('animation__tilt',
      'property: rotation; to: 0 15 0; dur:1800; easing:easeInOutSine; loop:true; dir:alternate');
  } else {
    el.setAttribute('animation__bob',
      `property: position; to: ${posX} ${posY + bob/2} ${posZ}; dur:${slow}; easing:easeInOutSine; loop:true; dir:alternate`);
    el.setAttribute('animation__spin',
      'property: rotation; to: 0 360 0; dur:7000; easing:linear; loop:true');
  }
}

/* ===== Modelos + control Play/Pause ===== */
function addModel(anchor, modelId, tx = {}) {
  const asset = document.getElementById(modelId);
  if (!asset) { console.warn(`⚠️ Falta <a-asset-item id="${modelId}">`); return; }

  const scale = tx.scale ?? DEFAULT_MODEL_SCALE;
  const rotY  = tx.rotY  ?? DEFAULT_MODEL_ROTY;
  const posY  = tx.posY  ?? DEFAULT_MODEL_POSY;
  const posX  = tx.posX  ?? DEFAULT_MODEL_POSX;
  const posZ  = tx.posZ  ?? DEFAULT_MODEL_POSZ;

  const el = document.createElement('a-entity');
  el.classList.add('ar-model');
  el.setAttribute('gltf-model', `#${modelId}`);
  el.setAttribute('position', `${posX} ${posY} ${posZ}`);
  el.setAttribute('rotation', `0 ${rotY} 0`);
  el.setAttribute('scale', `${scale} ${scale} ${scale}`);

  // Clips internos del GLB (si existen)
  el.setAttribute('animation-mixer', 'timeScale: 1');

  // Preset de animaciones
  applyPresetAnimations(modelId, el, posX, posY, posZ, scale);

  anchor.appendChild(el);
  modelsList.push(el);
}

function setAnimationsPlaying(playing) {
  animationsPlaying = playing;

  // Modelos: pausar / reanudar animation__* y animation-mixer
  modelsList.forEach(m => {
    Object.keys(m.components).forEach(k => {
      if (k.startsWith('animation__')) {
        playing ? m.components[k].play() : m.components[k].pause();
      }
    });
    if (m.components['animation-mixer']) {
      m.setAttribute('animation-mixer', `timeScale: ${playing ? 1 : 0}`);
    }
  });

  // Banderas: pausar / reanudar animation__flag
  flagsList.forEach(img => {
    const comp = img.components['animation__flag'];
    if (comp) playing ? comp.play() : comp.pause();
  });

  if (btnAnim) btnAnim.textContent = playing ? '⏸️ Pausar animación' : '▶️ Reanudar animación';
}

/* ===== Construcción de anchors ===== */
function buildAnchors() {
  if (toolbar) toolbar.style.display = 'none'; // oculto hasta ver un target

  MAP.forEach((cfg, i) => {
    const anchor = document.createElement('a-entity');
    anchor.setAttribute('mindar-image-target', `targetIndex: ${i}`);

    if (cfg.imgId)   addImage(anchor, cfg.imgId);
    if (cfg.modelId) addModel(anchor, cfg.modelId, cfg.tx || {});

    // etiqueta
    const label = document.createElement('a-entity');
    label.setAttribute('id', `label-${i}`);
    label.setAttribute('position', '0 -0.55 0.12');
    label.setAttribute('visible', 'false');
    label.setAttribute('scale', '0 0 0');

    const plate = document.createElement('a-plane');
    plate.setAttribute('width', '0.9');
    plate.setAttribute('height', '0.18');
    plate.setAttribute('material', 'color:#111; opacity:0.65; transparent:true; side:double');
    label.appendChild(plate);

    const text = document.createElement('a-entity');
    text.setAttribute('text', `value:${cfg.label}; align:center; color:#fff; width:2.4`);
    text.setAttribute('position', '0 0 0.001');
    label.appendChild(text);

    anchor.appendChild(label);

    // eventos
    anchor.addEventListener('targetFound', () => {
      console.log(`✅ targetFound index=${i} (${cfg.label}) | modelId=${cfg.modelId}`);
      status.style.display = 'none';
      if (toolbar) toolbar.style.display = 'flex';
      label.setAttribute('visible', 'true');
      pop(label, 1, 220);
    });
    anchor.addEventListener('targetLost', () => {
      status.style.display = 'block';
      status.textContent = 'No veo el marcador. Vuelve a apuntar.';
      if (toolbar) toolbar.style.display = 'none';
      pop(label, 0, 180);
      setTimeout(() => label.setAttribute('visible', 'false'), 190);
    });

    root.appendChild(anchor);
  });
}

/* ===== Estado general ===== */
scene.addEventListener('arReady', () => {
  status.textContent = 'Listo. Apunta al marcador que quieras.';
});
scene.addEventListener('arError', () => {
  status.textContent = 'Error de cámara/HTTPS/privacidad.';
});
window.addEventListener('load', () => {
  status.style.display = 'block';
  buildAnchors();
  setAnimationsPlaying(true); // cambia a false si quieres iniciar pausado
});

/* ===== Botón Play/Pause ===== */
if (btnAnim) {
  btnAnim.addEventListener('click', () => setAnimationsPlaying(!animationsPlaying));
}

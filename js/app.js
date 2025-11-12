const scene  = document.getElementById('scene');
const status = document.getElementById('status');
const root   = document.getElementById('anchors-root');
const btnAnim = document.getElementById('btnAnim'); // si tienes el botón en el HTML

/* ===== Defaults globales ===== */
const DEFAULT_MODEL_SCALE = 0.10;
const DEFAULT_MODEL_POSX  = 0.73; // derecha
const DEFAULT_MODEL_POSY  = 0.01; // altura base
const DEFAULT_MODEL_POSZ  = 0.16; // al frente
const DEFAULT_MODEL_ROTY  = 0;

/* ===== Mapeo por país (usa tus mismos IDs) ===== */
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
  img.setAttribute('animation',
    'property: position; to: 0 0.06 0.12; dur:1000; easing:easeInOutQuad; loop:true; dir:alternate');
  anchor.appendChild(img);
}

/* ===== Animaciones por tipo de modelo =====
   Cada preset usa nombres de animación distintos (animation__xxx) para no chocar. */
function applyPresetAnimations(modelId, el, posX, posY, posZ, scale) {
  // utilidades
  const bob = 0.08;            // amplitud vertical
  const slow = 1600, fast = 700;

  if (modelId === 'mdlBalon') {
    // Balón: BOTE (arriba/abajo) + giro leve
    el.setAttribute('animation__bounce',
      `property: position; to: ${posX} ${posY + 0.12} ${posZ}; dur:${fast}; easing:easeInOutCubic; loop:true; dir:alternate`);
    el.setAttribute('animation__spin',
      'property: rotation; to: 0 360 0; dur:4000; easing:linear; loop:true');
  }
  else if (modelId === 'mdlCopa') {
    // Trofeo: giro lento + levitación sutil
    el.setAttribute('animation__float',
      `property: position; to: ${posX} ${posY + bob/2} ${posZ}; dur:${slow}; easing:easeInOutSine; loop:true; dir:alternate`);
    el.setAttribute('animation__spin',
      'property: rotation; to: 0 360 0; dur:8000; easing:linear; loop:true');
  }
  else if (modelId === 'mdlBote') {
    // Bote: mecerse (rot Z) + subir/bajar lento
    el.setAttribute('animation__sway',
      'property: rotation; to: 0 0 8; dur:1800; easing:easeInOutSine; loop:true; dir:alternate');
    el.setAttribute('animation__float',
      `property: position; to: ${posX} ${posY + bob} ${posZ}; dur:1800; easing:easeInOutSine; loop:true; dir:alternate`);
  }
  else if (modelId === 'mdlDonut') {
    // Donut: giro medio + bob corto
    el.setAttribute('animation__spin',
      'property: rotation; to: 0 360 0; dur:5000; easing:linear; loop:true');
    el.setAttribute('animation__bob',
      `property: position; to: ${posX} ${posY + bob/2} ${posZ}; dur:${slow}; easing:easeInOutSine; loop:true; dir:alternate`);
  }
  else if (modelId === 'mdlCoffee') {
    // Café: “temblor” leve (rot X/Z) + bob pequeño
    el.setAttribute('animation__wobble',
      'property: rotation; to: 4 0 -4; dur:1200; easing:easeInOutSine; loop:true; dir:alternate');
    el.setAttribute('animation__bob',
      `property: position; to: ${posX} ${posY + bob/3} ${posZ}; dur:${slow}; easing:easeInOutSine; loop:true; dir:alternate`);
  }
  else if (modelId === 'mdlCheese') {
    // Burger: “latido” (scale) + bob leve
    const s2 = (scale * 1.08).toFixed(4);
    el.setAttribute('animation__pulse',
      `property: scale; to: ${s2} ${s2} ${s2}; dur:900; easing:easeInOutSine; loop:true; dir:alternate`);
    el.setAttribute('animation__bob',
      `property: position; to: ${posX} ${posY + bob/3} ${posZ}; dur:${slow}; easing:easeInOutSine; loop:true; dir:alternate`);
  }
  else if (/^mdl(Arabia|Argentina|USA|Canada|Corea|Japon|Mexico)$/.test(modelId)) {
    // Modelos de país: hover + balanceo Y suave (no 360)
    el.setAttribute('animation__hover',
      `property: position; to: ${posX} ${posY + bob/2} ${posZ}; dur:${slow}; easing:easeInOutSine; loop:true; dir:alternate`);
    el.setAttribute('animation__tilt',
      'property: rotation; to: 0 15 0; dur:1800; easing:easeInOutSine; loop:true; dir:alternate');
  } else {
    // Genérico: bob + giro lento
    el.setAttribute('animation__bob',
      `property: position; to: ${posX} ${posY + bob/2} ${posZ}; dur:${slow}; easing:easeInOutSine; loop:true; dir:alternate`);
    el.setAttribute('animation__spin',
      'property: rotation; to: 0 360 0; dur:7000; easing:linear; loop:true');
  }
}

/* ===== Gestor de modelos para Play/Pause ===== */
const modelsList = [];
let animationsPlaying = true;

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

  // Si el GLB trae clips, arrancan (pausables luego)
  el.setAttribute('animation-mixer', 'timeScale: 1');

  // Aplica animación según el modelo
  applyPresetAnimations(modelId, el, posX, posY, posZ, scale);

  anchor.appendChild(el);
  modelsList.push(el);
}

function setAnimationsPlaying(playing) {
  animationsPlaying = playing;
  modelsList.forEach(m => {
    // pausar/reanudar todas las animation__*
    Object.keys(m.components).forEach(k => {
      if (k.startsWith('animation__')) {
        playing ? m.components[k].play() : m.components[k].pause();
      }
    });
    // y los clips internos del GLB (si existen)
    if (m.components['animation-mixer']) {
      m.setAttribute('animation-mixer', `timeScale: ${playing ? 1 : 0}`);
    }
  });
  if (btnAnim) btnAnim.textContent = playing ? '⏸️ Pausar animación' : '▶️ Reanudar animación';
}

/* ===== Scene build ===== */
function buildAnchors() {
  MAP.forEach((cfg, i) => {
    const anchor = document.createElement('a-entity');
    anchor.setAttribute('mindar-image-target', `targetIndex: ${i}`);

    if (cfg.imgId) addImage(anchor, cfg.imgId);
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

    anchor.addEventListener('targetFound', () => {
      console.log(`✅ targetFound index=${i} (${cfg.label}) | modelId=${cfg.modelId}`);
      status.style.display = 'none';
      label.setAttribute('visible', 'true');
      pop(label, 1, 220);
    });
    anchor.addEventListener('targetLost', () => {
      status.style.display = 'block';
      status.textContent = 'No veo el marcador. Vuelve a apuntar.';
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
  setAnimationsPlaying(true);
});

/* ===== Botón Play/Pause (si existe en tu HTML) ===== */
if (btnAnim) {
  btnAnim.addEventListener('click', () => setAnimationsPlaying(!animationsPlaying));
}

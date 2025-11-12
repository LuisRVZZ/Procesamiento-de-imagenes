const scene  = document.getElementById('scene');
const status = document.getElementById('status');
const root   = document.getElementById('anchors-root');

// ===== Defaults globales =====
const DEFAULT_MODEL_SCALE = 0.22;
const DEFAULT_MODEL_POSY  = 0.06;
const DEFAULT_MODEL_ROTY  = 0;
const DEFAULT_MODEL_POSX  = 0.25; // 👉 todos los modelos se moverán a la derecha

// ===== Mapeo por país =====
const MAP = [
  { imgId:'flag0',  label:'ARABIA SAUDITA',  modelId:'mdlArabia',  tx:{ scale:0.12, posY:0.04, posX:0.25, rotY:0 } }, // más chico
  { imgId:'flag1',  label:'ARGELIA',         modelId:'mdlCoffee',  tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:10 } },
  { imgId:'flag2',  label:'ARGENTINA',       modelId:'mdlArgentina',tx:{ scale:0.18, posY:0.05, posX:0.25, rotY:-15 } },
  { imgId:'flag3',  label:'AUSTRALIA',       modelId:'mdlBalon',    tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag4',  label:'BRASIL',          modelId:'mdlCopa',     tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag5',  label:'CABO VERDE',      modelId:'mdlBote',     tx:{ scale:0.15, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag6',  label:'CANADÁ',          modelId:'mdlCanada',   tx:{ scale:0.18, posY:0.05, posX:0.25, rotY:15 } },
  { imgId:'flag7',  label:'CATAR',           modelId:'mdlDonut',    tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag8',  label:'COLOMBIA',        modelId:'mdlCoffee',   tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag9',  label:'COREA DEL SUR',   modelId:'mdlCorea',    tx:{ scale:0.18, posY:0.05, posX:0.25, rotY:0 } },
  { imgId:'flag10', label:'COSTA DE MARFIL', modelId:'mdlBalon',    tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag11', label:'ECUADOR',         modelId:'mdlCopa',     tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag12', label:'ESTADOS UNIDOS',  modelId:'mdlCheese',   tx:{ scale:0.18, posY:0.05, posX:0.25, rotY:0 } },
  { imgId:'flag13', label:'INGLATERRA',      modelId:'mdlCoffee',   tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag14', label:'IRÁN',            modelId:'mdlDonut',    tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag15', label:'JAPÓN',           modelId:'mdlJapon',    tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag16', label:'JORDANIA',        modelId:'mdlCheese',   tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag17', label:'MÉXICO',          modelId:'mdlMexico',   tx:{ scale:0.18, posY:0.05, posX:0.25, rotY:20 } },
  { imgId:'flag18', label:'PARAGUAY',        modelId:'mdlBalon',    tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag19', label:'SENEGAL',         modelId:'mdlBote',     tx:{ scale:0.15, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag20', label:'SUDÁFRICA',       modelId:'mdlBalon',    tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } },
  { imgId:'flag21', label:'URUGUAY',         modelId:'mdlCopa',     tx:{ scale:0.16, posY:0.04, posX:0.25, rotY:0 } }
];

// ===== Helpers =====
const pop = (el, to, dur = 240) =>
  el?.setAttribute('animation__scale', {
    property:'scale', to:`${to} ${to} ${to}`, dur, easing:'easeOutCubic'
  });

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
    'property: position; to: 0 0.08 0.12; dur:1000; easing:easeInOutQuad; loop:true; dir:alternate');
  anchor.appendChild(img);
}

function addModel(anchor, modelId, tx = {}) {
  if (!document.getElementById(modelId)) {
    console.warn(`⚠️ Falta <a-asset-item id="${modelId}">`);
    return;
  }

  const scale = tx.scale ?? DEFAULT_MODEL_SCALE;
  const rotY  = tx.rotY  ?? DEFAULT_MODEL_ROTY;
  const posY  = tx.posY  ?? DEFAULT_MODEL_POSY;
  const posX  = tx.posX  ?? DEFAULT_MODEL_POSX;

  const model = document.createElement('a-entity');
  model.setAttribute('gltf-model', `#${modelId}`);
  model.setAttribute('position', `${posX} ${posY} 0.02`);
  model.setAttribute('rotation', `0 ${rotY} 0`);
  model.setAttribute('scale', `${scale} ${scale} ${scale}`);
  model.setAttribute('animation__float',
    'property: position; to: 0.25 0.12 0.02; dur:1200; easing:easeInOutSine; loop:true; dir:alternate');
  anchor.appendChild(model);
}

function buildAnchors() {
  MAP.forEach((cfg, i) => {
    const anchor = document.createElement('a-entity');
    anchor.setAttribute('mindar-image-target', `targetIndex: ${i}`);

    if (cfg.imgId) addImage(anchor, cfg.imgId);
    if (cfg.modelId) addModel(anchor, cfg.modelId, cfg.tx);

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

// ===== Estado general =====
scene.addEventListener('arReady', () => {
  status.textContent = 'Listo. Apunta al marcador que quieras.';
});
scene.addEventListener('arError', () => {
  status.textContent = 'Error de cámara/HTTPS/privacidad.';
});
window.addEventListener('load', () => {
  status.style.display = 'block';
  buildAnchors();
});

// ===== Debug rápido =====
window.addEventListener('keydown', (e)=>{
  if (e.key === 'y') { window.__gScale = (window.__gScale ?? DEFAULT_MODEL_SCALE) * 0.9;  console.log('scale', window.__gScale); }
  if (e.key === 'x') { window.__gScale = (window.__gScale ?? DEFAULT_MODEL_SCALE) / 0.9;  console.log('scale', window.__gScale); }
  if (e.key === 'ArrowDown') { window.__gPosY = (window.__gPosY ?? DEFAULT_MODEL_POSY) - 0.01; console.log('posY', window.__gPosY); }
  if (e.key === 'ArrowUp')   { window.__gPosY = (window.__gPosY ?? DEFAULT_MODEL_POSY) + 0.01; console.log('posY', window.__gPosY); }
});

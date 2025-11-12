const scene  = document.getElementById('scene');
const status = document.getElementById('status');
const root   = document.getElementById('anchors-root');

// ===== Defaults globales (puedes afinarlos) =====
const DEFAULT_MODEL_SCALE = 0.22;  // antes ~0.60
const DEFAULT_MODEL_POSY  = 0.06;  // antes ~0.18
const DEFAULT_MODEL_ROTY  = 0;
const RANDOM_PER_TARGET   = false; // aleatorio entre modelos candidatos

// ===== Mapeo por targetIndex (0..21) =====
// imgId: id de la bandera en <a-assets>
// label: texto
// models: candidatos por orden de preferencia (IDs de <a-asset-item>)
// tx: { scale, rotY, posY } si ese país requiere ajuste especial
const MAP = [
  { imgId: 'flag0',  label: 'ARABIA SAUDITA',  models: ['mdlArabia','mdlCopa','mdlBalon'], tx: { scale: 0.24, posY: 0.06 } },
  { imgId: 'flag1',  label: 'ARGELIA',         models: ['mdlBalon','mdlCopa','mdlDonut'] },
  { imgId: 'flag2',  label: 'ARGENTINA',       models: ['mdlArgentina','mdlBalon','mdlCopa'], tx: { scale: 0.24, rotY: -15 } },
  { imgId: 'flag3',  label: 'AUSTRALIA',       models: ['mdlBalon','mdlCopa','mdlDonut'] },
  { imgId: 'flag4',  label: 'BRASIL',          models: ['mdlBalon','mdlCopa'] },
  { imgId: 'flag5',  label: 'CABO VERDE',      models: ['mdlBalon','mdlBote'], tx: { scale: 0.20 } },
  { imgId: 'flag6',  label: 'CANADÁ',          models: ['mdlCanada','mdlCoffee','mdlBalon'], tx: { scale: 0.22, rotY: 15 } },
  { imgId: 'flag7',  label: 'CATAR',           models: ['mdlCopa','mdlBalon','mdlCoffee'] },
  { imgId: 'flag8',  label: 'COLOMBIA',        models: ['mdlBalon','mdlCopa'] },
  { imgId: 'flag9',  label: 'COREA DEL SUR',   models: ['mdlCorea','mdlCoffee','mdlBalon'] },
  { imgId: 'flag10', label: 'COSTA DE MARFIL', models: ['mdlBalon','mdlCopa'] },
  { imgId: 'flag11', label: 'ECUADOR',         models: ['mdlBalon','mdlCopa'] },
  { imgId: 'flag12', label: 'ESTADOS UNIDOS',  models: ['mdlUSA','mdlCheese','mdlCoffee'], tx: { scale: 0.23 } },
  { imgId: 'flag13', label: 'INGLATERRA',      models: ['mdlCoffee','mdlBalon','mdlCopa'] },
  { imgId: 'flag14', label: 'IRÁN',            models: ['mdlBalon','mdlCopa'] },
  { imgId: 'flag15', label: 'JAPÓN',           models: ['mdlJapon','mdlDonut','mdlCoffee'], tx: { scale: 0.20 } },
  { imgId: 'flag16', label: 'JORDANIA',        models: ['mdlBalon','mdlCopa'] },
  { imgId: 'flag17', label: 'MÉXICO',          models: ['mdlMexico','mdlCopa','mdlBalon'],  tx: { scale: 0.24, rotY: 20 } },
  { imgId: 'flag18', label: 'PARAGUAY',        models: ['mdlBalon','mdlCopa'] },
  { imgId: 'flag19', label: 'SENEGAL',         models: ['mdlBalon','mdlBote'],              tx: { scale: 0.20 } },
  { imgId: 'flag20', label: 'SUDÁFRICA',       models: ['mdlBalon','mdlCopa'] },
  { imgId: 'flag21', label: 'URUGUAY',         models: ['mdlBalon','mdlCopa'] },
];

// ===== Helpers =====
const pop = (el, to, dur = 240) =>
  el?.setAttribute('animation__scale', { property: 'scale', to: `${to} ${to} ${to}`, dur, easing: 'easeOutCubic' });

function addImage(anchor, imgId) {
  if (!document.getElementById(imgId)) console.warn(`⚠️ Falta <img id="${imgId}"> en <a-assets>.`);
  const img = document.createElement('a-image');
  img.setAttribute('src', `#${imgId}`);
  img.setAttribute('position', '0 0 0.12');  // separa del plano
  img.setAttribute('width', '1');
  img.setAttribute('height', '0.6');
  img.setAttribute('material', 'side: double');
  img.setAttribute('animation',
    'property: position; to: 0 0.08 0.12; dur:1000; easing:easeInOutQuad; loop:true; dir:alternate');
  anchor.appendChild(img);
}

function addModel(anchor, modelId, tx = {}) {
  if (!document.getElementById(modelId)) { console.warn(`⚠️ Falta <a-asset-item id="${modelId}">`); return; }

  const scale = (tx.scale ?? (window.__gScale ?? DEFAULT_MODEL_SCALE));
  const rotY  = (tx.rotY  ?? DEFAULT_MODEL_ROTY);
  const posY  = (tx.posY  ?? (window.__gPosY ?? DEFAULT_MODEL_POSY));

  const model = document.createElement('a-entity');
  // Si tu GLB usa DRACO, descomenta:
  // model.setAttribute('gltf-model', `#${modelId}; dracoDecoderPath: https://www.gstatic.com/draco/versioned/decoders/1.5.6/`);
  model.setAttribute('gltf-model', `#${modelId}`);
  model.setAttribute('position', `0 ${posY} 0.02`);
  model.setAttribute('rotation', `0 ${rotY} 0`);
  model.setAttribute('scale', `${scale} ${scale} ${scale}`);

  // Flotadito más corto (acorde al tamaño)
  model.setAttribute('animation__float',
    'property: position; to: 0 0.12 0.02; dur:1200; easing:easeInOutSine; loop:true; dir:alternate');

  // Si el GLB trae animaciones:
  // model.setAttribute('animation-mixer', '');

  anchor.appendChild(model);
}

function pickModelId(models) {
  if (!models || models.length === 0) return null;
  if (RANDOM_PER_TARGET) {
    const existing = models.filter(id => document.getElementById(id));
    if (!existing.length) return null;
    return existing[Math.floor(Math.random() * existing.length)];
  }
  for (const id of models) if (document.getElementById(id)) return id;
  return null;
}

function buildAnchors() {
  MAP.forEach((cfg, i) => {
    const anchor = document.createElement('a-entity');
    anchor.setAttribute('mindar-image-target', `targetIndex: ${i}`);

    if (cfg.imgId) addImage(anchor, cfg.imgId);
    const chosenModelId = pickModelId(cfg.models);
    if (chosenModelId) addModel(anchor, chosenModelId, cfg.tx);

    // Label
    const label = document.createElement('a-entity');
    label.setAttribute('id', `label-${i}`);
    label.setAttribute('position', '0 -0.55 0.12');
    label.setAttribute('visible', 'false');
    label.setAttribute('scale', '0 0 0');

    const plate = document.createElement('a-plane');
    plate.setAttribute('width', '0.9');
    plate.setAttribute('height', '0.18');
    plate.setAttribute('material', 'color: #111; opacity: 0.65; transparent: true; side: double');
    label.appendChild(plate);

    const text = document.createElement('a-entity');
    text.setAttribute('text', `value: ${cfg.label}; align: center; color: #fff; width: 2.4`);
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

// ===== Debug rápido en vivo (opcional) =====
// - y / x  : escala - / +
// - ↓ / ↑  : bajar / subir posY
window.addEventListener('keydown', (e)=>{
  if (e.key === 'y') { window.__gScale = (window.__gScale ?? DEFAULT_MODEL_SCALE) * 0.9;  console.log('scale', window.__gScale); }
  if (e.key === 'x') { window.__gScale = (window.__gScale ?? DEFAULT_MODEL_SCALE) / 0.9;  console.log('scale', window.__gScale); }
  if (e.key === 'ArrowDown') { window.__gPosY = (window.__gPosY ?? DEFAULT_MODEL_POSY) - 0.01; console.log('posY', window.__gPosY); }
  if (e.key === 'ArrowUp')   { window.__gPosY = (window.__gPosY ?? DEFAULT_MODEL_POSY) + 0.01; console.log('posY', window.__gPosY); }
});

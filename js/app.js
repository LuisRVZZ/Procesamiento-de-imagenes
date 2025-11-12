const scene  = document.getElementById('scene');
const status = document.getElementById('status');
const root   = document.getElementById('anchors-root');

// Si quieres elegir aleatorio entre los candidatos, pon true:
const RANDOM_PER_TARGET = false;

// Para cada targetIndex (0..21), definimos:
// - imgId: id de la bandera en <a-assets>
// - label: texto del rótulo
// - models: lista de modelos candidatos por orden de preferencia (IDs de <a-asset-item>)
// - tx: transform por si el modelo requiere ajustes (scale, rotY, posY)
const MAP = [
  { imgId: 'flag0',  label: 'ARABIA SAUDITA',  models: ['mdlArabia','mdlCopa','mdlBalon'], tx: { scale: 0.60, rotY:  0, posY: 0.16 } },
  { imgId: 'flag1',  label: 'ARGELIA',         models: ['mdlBalon','mdlCopa','mdlDonut'], tx: { scale: 0.65, rotY: 15, posY: 0.18 } },
  { imgId: 'flag2',  label: 'ARGENTINA',       models: ['mdlArgentina','mdlBalon','mdlCopa'], tx:{ scale: 0.65, rotY:-20, posY: 0.17 } },
  { imgId: 'flag3',  label: 'AUSTRALIA',       models: ['mdlBalon','mdlCopa','mdlDonut'], tx: { scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag4',  label: 'BRASIL',          models: ['mdlBalon','mdlCopa'],             tx: { scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag5',  label: 'CABO VERDE',      models: ['mdlBalon','mdlBote'],             tx: { scale: 0.55, rotY:  0, posY: 0.18 } },
  { imgId: 'flag6',  label: 'CANADÁ',          models: ['mdlCanada','mdlCoffee','mdlBalon'], tx:{ scale: 0.60, rotY: 15, posY: 0.18 } },
  { imgId: 'flag7',  label: 'CATAR',           models: ['mdlCopa','mdlBalon','mdlCoffee'], tx: { scale: 0.58, rotY:  0, posY: 0.18 } },
  { imgId: 'flag8',  label: 'COLOMBIA',        models: ['mdlBalon','mdlCopa'],             tx: { scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag9',  label: 'COREA DEL SUR',   models: ['mdlCorea','mdlCoffee','mdlBalon'], tx:{ scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag10', label: 'COSTA DE MARFIL', models: ['mdlBalon','mdlCopa'],             tx: { scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag11', label: 'ECUADOR',         models: ['mdlBalon','mdlCopa'],             tx: { scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag12', label: 'ESTADOS UNIDOS',  models: ['mdlUSA','mdlCheese','mdlCoffee'], tx: { scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag13', label: 'INGLATERRA',      models: ['mdlCoffee','mdlBalon','mdlCopa'], tx: { scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag14', label: 'IRÁN',            models: ['mdlBalon','mdlCopa'],             tx: { scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag15', label: 'JAPÓN',           models: ['mdlJapon','mdlDonut','mdlCoffee'], tx:{ scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag16', label: 'JORDANIA',        models: ['mdlBalon','mdlCopa'],             tx: { scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag17', label: 'MÉXICO',          models: ['mdlMexico','mdlCopa','mdlBalon'], tx:{ scale: 0.60, rotY: 25, posY: 0.18 } },
  { imgId: 'flag18', label: 'PARAGUAY',        models: ['mdlBalon','mdlCopa'],             tx: { scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag19', label: 'SENEGAL',         models: ['mdlBalon','mdlBote'],             tx: { scale: 0.55, rotY:  0, posY: 0.18 } },
  { imgId: 'flag20', label: 'SUDÁFRICA',       models: ['mdlBalon','mdlCopa'],             tx: { scale: 0.60, rotY:  0, posY: 0.18 } },
  { imgId: 'flag21', label: 'URUGUAY',         models: ['mdlBalon','mdlCopa'],             tx: { scale: 0.60, rotY:  0, posY: 0.18 } },
];

const pop = (el, to, dur = 240) =>
  el?.setAttribute('animation__scale', { property: 'scale', to: `${to} ${to} ${to}`, dur, easing: 'easeOutCubic' });

function addImage(anchor, imgId) {
  const ok = document.getElementById(imgId);
  if (!ok) console.warn(`⚠️ Falta <img id="${imgId}"> en <a-assets>.`);
  const img = document.createElement('a-image');
  img.setAttribute('src', `#${imgId}`);
  img.setAttribute('position', '0 0 0.12'); // separa del plano
  img.setAttribute('width', '1');
  img.setAttribute('height', '0.6');
  img.setAttribute('material', 'side: double');
  img.setAttribute('animation', 'property: position; to: 0 0.08 0.12; dur:1000; easing:easeInOutQuad; loop:true; dir:alternate');
  anchor.appendChild(img);
}

function addModel(anchor, modelId, tx = {}) {
  const ok = document.getElementById(modelId);
  if (!ok) { console.warn(`⚠️ Falta <a-asset-item id="${modelId}"> en <a-assets>.`); return; }

  const { scale = 0.6, rotY = 0, posY = 0.18 } = tx;
  const model = document.createElement('a-entity');

  // Si tu .glb usa DRACO, descomenta y deja el decoderPath:
  // model.setAttribute('gltf-model', `#${modelId}; dracoDecoderPath: https://www.gstatic.com/draco/versioned/decoders/1.5.6/`);
  model.setAttribute('gltf-model', `#${modelId}`);
  model.setAttribute('position', `0 ${posY} 0.02`);
  model.setAttribute('rotation', `0 ${rotY} 0`);
  model.setAttribute('scale', `${scale} ${scale} ${scale}`);

  // Flotadito
  model.setAttribute('animation__float', 'property: position; to: 0 0.24 0.02; dur:1200; easing:easeInOutSine; loop:true; dir:alternate');

  // Si el GLB trae animaciones:
  // model.setAttribute('animation-mixer', '');

  anchor.appendChild(model);
}

function pickModelId(models) {
  if (!models || models.length === 0) return null;
  if (RANDOM_PER_TARGET) {
    // aleatorio entre candidatos que existan
    const existing = models.filter(id => document.getElementById(id));
    if (!existing.length) return null;
    return existing[Math.floor(Math.random() * existing.length)];
  } else {
    // prioridad: el primero que exista
    for (const id of models) {
      if (document.getElementById(id)) return id;
    }
    return null;
  }
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

    // Eventos
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

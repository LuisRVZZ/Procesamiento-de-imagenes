// === Configuración: archivo .mind y los 2 targets en el orden del Creator ===
const MIND_FILE = './assets/targets/dosbanderas.mind';

// Orden EXACTO como los subiste (arriba→abajo) en MindAR Creator:
const TARGETS = [
  { name: 'Arabia Saudita', asset: '#foto-ArabiaSaudita', aspect: 0.6 }, // targetIndex: 0
  { name: 'Argelia',        asset: '#foto-Argelia',       aspect: 0.6 }  // targetIndex: 1
];

// === Parámetros visuales ===
const WIDTH = 1.0;      // ancho del a-image
const LABEL_H = 0.18;   // alto del rótulo
const DEBUG = true;

// === Utilidades ===
function popScale(el, to, dur = 260) {
  if (!el) return;
  el.setAttribute('animation__scale', {
    property: 'scale',
    to: `${to} ${to} ${to}`,
    dur,
    easing: 'easeOutCubic'
  });
}

function clearChildren(root) {
  while (root.firstChild) root.removeChild(root.firstChild);
}

// Crea un anchor (a-entity con mindar-image-target) para un targetIndex
function createAnchor(targetDef, index, statusEl) {
  const anchor = document.createElement('a-entity');
  anchor.setAttribute('mindar-image-target', `targetIndex: ${index}`);

  // Imagen encima del marcador (puedes cambiar a <a-gltf-model> si luego usas GLB)
  const img = document.createElement('a-image');
  img.setAttribute('src', targetDef.asset);
  img.setAttribute('position', '0 0 0.12');
  img.setAttribute('width', WIDTH);
  img.setAttribute('height', (WIDTH * (targetDef.aspect || 0.6)).toString());
  img.setAttribute('material', 'side:double');
  img.setAttribute(
    'animation',
    'property: position; to: 0 0.08 0.12; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate'
  );

  // Rótulo
  const labelGrp = document.createElement('a-entity');
  labelGrp.setAttribute('position', `0 ${-(WIDTH * 0.5 + 0.15)} 0.1`);
  labelGrp.setAttribute('visible', 'false');
  labelGrp.setAttribute('scale', '0 0 0');

  const labelBg = document.createElement('a-plane');
  labelBg.setAttribute('width', WIDTH * 0.9);
  labelBg.setAttribute('height', LABEL_H);
  labelBg.setAttribute('material', 'color:#111; opacity:0.65; transparent:true; side:double');

  const labelText = document.createElement('a-entity');
  labelText.setAttribute(
    'text',
    `value:${targetDef.name.toUpperCase()}; align:center; color:#fff; width:2.5; letterSpacing:1`
  );
  labelText.setAttribute('position', '0 0 0.001');

  labelGrp.appendChild(labelBg);
  labelGrp.appendChild(labelText);

  anchor.appendChild(img);
  anchor.appendChild(labelGrp);

  // Eventos de detección
  anchor.addEventListener('targetFound', () => {
    if (DEBUG) console.log(`🎯 targetFound idx=${index} → ${targetDef.name}`);
    if (statusEl) statusEl.style.display = 'none';
    labelGrp.setAttribute('visible', 'true');
    popScale(labelGrp, 1, 240);
  });

  anchor.addEventListener('targetLost', () => {
    if (DEBUG) console.log(`👋 targetLost  idx=${index} → ${targetDef.name}`);
    if (statusEl) {
      statusEl.style.display = 'block';
      statusEl.textContent = 'No veo el marcador. Vuelve a apuntar.';
    }
    popScale(labelGrp, 0, 200);
    setTimeout(() => labelGrp.setAttribute('visible', 'false'), 210);
  });

  return anchor;
}

// === Inicio ===
window.addEventListener('load', () => {
  const scene  = document.getElementById('scene');
  const status = document.getElementById('status');
  const root   = document.getElementById('anchors-root') || scene; // por si no usas anchors-root

  // 1) Asegura que la escena apunte al .mind correcto
  //    (Si ya lo pusiste en el HTML, esto es opcional; pero así lo garantizamos)
  scene.setAttribute(
    'mindar-image',
    `imageTargetSrc: ${MIND_FILE};`
    // Si hospedas MindAR local, añade:
    // + ` wasmPath: ./lib/mindar/mindar-image-worker.wasm; workerPath: ./lib/mindar/mindar-image-worker.js;`
  );

  // 2) Crea los 2 anchors (idx 0 y 1)
  clearChildren(root);
  TARGETS.forEach((def, idx) => {
    const anchor = createAnchor(def, idx, status);
    root.appendChild(anchor);
  });

  // 3) Eventos de estado del motor
  scene.addEventListener('arReady', () => {
    if (DEBUG) console.log('✅ arReady');
    if (status) { status.style.display = 'block'; status.textContent = 'Listo. Apunta a una bandera.'; }
  });

  scene.addEventListener('arError', (e) => {
    console.error('❌ arError', e);
    if (status) { status.style.display = 'block'; status.textContent = 'Error de cámara/HTTPS/privacidad.'; }
  });

  // Mensaje inicial
  if (status) status.style.display = 'block';
});

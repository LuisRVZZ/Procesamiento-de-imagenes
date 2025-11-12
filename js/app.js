// ===== 1) Archivos .mind por grupo =====
const MIND_FILE = {
  A: './assets/targets/grupoA.mind',
  B: './assets/targets/grupoB.mind'
};

// ===== 2) Mapeo de targetIndex -> (nombre, asset) =====
// IMPORTANTE: el orden de cada arreglo debe coincidir con el orden en que subiste
// las imágenes al MindAR Creator para ese .mind.
const GROUPS = {
  A: [
    { name: 'Arabia Saudita',   asset: '#foto-ArabiaSaudita',  aspect: 0.6 },
    { name: 'Argelia',          asset: '#foto-Argelia',        aspect: 0.6 },
    { name: 'Argentina',        asset: '#foto-argentina',      aspect: 0.6 },
    { name: 'Australia',        asset: '#foto-Australia',      aspect: 0.6 },
    { name: 'Brasil',           asset: '#foto-brasil',         aspect: 0.6 },
    { name: 'Cabo Verde',       asset: '#foto-CaboVerde',      aspect: 0.6 },
    { name: 'Canadá',           asset: '#foto-canada',         aspect: 0.6 },
    { name: 'Catar',            asset: '#foto-Catar',          aspect: 0.6 },
    { name: 'Colombia',         asset: '#foto-Colombia',       aspect: 0.6 },
    { name: 'Corea del Sur',    asset: '#foto-Coreadelsur',    aspect: 0.6 },
    { name: 'Costa de Marfil',  asset: '#foto-CostadeMarfil',  aspect: 0.6 },
    { name: 'Ecuador',          asset: '#foto-Ecuador',        aspect: 0.6 },
    // ...agrega aquí si tu grupo A tiene más índices
  ],
  B: [
    { name: 'Estados Unidos',   asset: '#foto-Estadosunidos',  aspect: 0.6 },
    { name: 'Inglaterra',       asset: '#foto-Inglaterra',     aspect: 0.6 },
    { name: 'Irán',             asset: '#foto-Iran',           aspect: 0.6 },
    { name: 'Japón',            asset: '#foto-japon',          aspect: 0.6 },
    { name: 'Jordania',         asset: '#foto-jordania',       aspect: 0.6 },
    { name: 'México',           asset: '#foto-mexico',         aspect: 0.6 },
    { name: 'Paraguay',         asset: '#foto-Paraguay',       aspect: 0.6 },
    { name: 'Sudáfrica',        asset: '#foto-sudafrica',      aspect: 0.6 },
    { name: 'Uruguay',          asset: '#foto-Uruguay',        aspect: 0.6 },
    // ...agrega aquí si tu grupo B tiene más índices
  ]
};

// ===== 3) Parámetros visuales =====
const WIDTH   = 1.0;   // ancho del plano de la foto
const LABEL_H = 0.18;

// ===== 4) DEBUG =====
const DEBUG = true;

// ===== 5) Utilidades =====
function clearAnchors(root) {
  while (root.firstChild) root.removeChild(root.firstChild);
}

function popScale(el, to, dur = 260) {
  if (!el) return;
  el.setAttribute('animation__scale', {
    property: 'scale',
    to: `${to} ${to} ${to}`,
    dur,
    easing: 'easeOutCubic'
  });
}

function attachAnchorHandlers(anchor, labelGrp, status, i, f, groupKey) {
  anchor.addEventListener('targetFound', () => {
    if (DEBUG && status) {
      status.style.display = 'block';
      status.textContent = `Encontrado: [${groupKey}] idx=${i} → ${f.name}`;
      setTimeout(() => { status.style.display = 'none'; }, 1200);
    } else if (status) {
      status.style.display = 'none';
    }
    labelGrp.setAttribute('visible', 'true');
    popScale(labelGrp, 1, 260);
    console.log(`targetFound -> grupo=${groupKey} idx=${i} name=${f.name}`);
  });

  anchor.addEventListener('targetLost', () => {
    if (status) {
      status.style.display = 'block';
      status.textContent = 'No veo el marcador. Vuelve a apuntar.';
    }
    popScale(labelGrp, 0, 200);
    setTimeout(() => labelGrp.setAttribute('visible', 'false'), 210);
    console.log(`targetLost  -> grupo=${groupKey} idx=${i} name=${f.name}`);
  });
}

// ===== 6) Construcción de anchors según grupo activo =====
function buildAnchorsForGroup(groupKey) {
  const root   = document.getElementById('anchors-root');
  const status = document.getElementById('status');
  const defs   = GROUPS[groupKey];

  clearAnchors(root);
  if (!defs || !defs.length) return;

  defs.forEach((f, i) => {
    const anchor = document.createElement('a-entity');
    anchor.setAttribute('id', `anchor-${groupKey}-${i}`);
    anchor.setAttribute('mindar-image-target', `targetIndex: ${i}`);

    // Contenido principal (foto). Si luego usas GLB, reemplaza por <a-gltf-model>.
    const img = document.createElement('a-image');
    img.setAttribute('src', f.asset);
    img.setAttribute('position', '0 0 0.12');
    img.setAttribute('width', WIDTH);
    img.setAttribute('height', (WIDTH * (f.aspect || 0.6)).toString());
    img.setAttribute('material', 'side:double');
    img.setAttribute(
      'animation',
      'property: position; to: 0 0.08 0.12; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate'
    );

    // Rótulo inferior
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
      `value:${f.name.toUpperCase()}; align:center; color:#fff; width:2.5; letterSpacing:1`
    );
    labelText.setAttribute('position', '0 0 0.001');

    labelGrp.appendChild(labelBg);
    labelGrp.appendChild(labelText);

    anchor.appendChild(img);
    anchor.appendChild(labelGrp);

    // Handlers (con debug opcional)
    attachAnchorHandlers(anchor, labelGrp, status, i, f, groupKey);

    root.appendChild(anchor);
  });
}

// ===== 7) Cambiar dinámicamente el archivo .mind (A/B) =====
function setMindFile(groupKey) {
  const scene = document.getElementById('scene');
  const file  = MIND_FILE[groupKey];
  if (!scene || !file) return;

  // Cambia el .mind activo
  scene.setAttribute('mindar-image', `imageTargetSrc: ${file};`);

  // Reconstruye anchors para que targetIndex 0..N coincida con el grupo
  buildAnchorsForGroup(groupKey);

  if (DEBUG) console.log(`Mind file activado: ${file} (grupo ${groupKey})`);
}

// ===== 8) Inicio =====
window.addEventListener('load', () => {
  // Grupo inicial (coincide con tu HTML)
  setMindFile('A');

  // Botones
  const btnA = document.getElementById('btnA');
  const btnB = document.getElementById('btnB');
  if (btnA) btnA.addEventListener('click', () => setMindFile('A'));
  if (btnB) btnB.addEventListener('click', () => setMindFile('B'));

  // Banner visible al inicio
  const status = document.getElementById('status');
  if (status) status.style.display = 'block';
});

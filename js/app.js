const scene  = document.getElementById('scene');
const status = document.getElementById('status');
const root   = document.getElementById('anchors-root');

// Etiquetas en el mismo orden que tus <img id="flag0"... "flag22">
const LABELS = [
  'ARABIA SAUDITA',   // flag0  -> targetIndex 0
  'ARGELIA',          // flag1  -> targetIndex 1
  'ARGENTINA',        // flag2  -> targetIndex 2
  'AUSTRALIA',        // flag3  -> targetIndex 3
  'BRASIL',           // flag4  -> targetIndex 4
  'CABO VERDE',       // flag5  -> targetIndex 5
  'CANADÁ',           // flag6  -> targetIndex 6
  'CATAR',            // flag7  -> targetIndex 7            
  'COLOMBIA',         // flag9  -> targetIndex 9
  'COREA DEL SUR',    // flag10 -> targetIndex 10
  'COSTA DE MARFIL',  // flag11 -> targetIndex 11
  'ECUADOR',          // flag12 -> targetIndex 12
  'ESTADOS UNIDOS',   // flag13 -> targetIndex 13
  'INGLATERRA',       // flag14 -> targetIndex 14
  'IRÁN',             // flag15 -> targetIndex 15
  'JAPÓN',            // flag16 -> targetIndex 16
  'JORDANIA',         // flag17 -> targetIndex 17
  'MÉXICO',           // flag18 -> targetIndex 18
  'PARAGUAY',         // flag19 -> targetIndex 19
  'SENEGAL',          // flag20 -> targetIndex 20
  'SUDÁFRICA',        // flag21 -> targetIndex 21
  'URUGUAY'           // flag22 -> targetIndex 22
];

// Animación “pop” para mostrar/ocultar el rótulo
const pop = (el, to, dur = 240) => el?.setAttribute('animation__scale', {
  property: 'scale',
  to: `${to} ${to} ${to}`,
  dur,
  easing: 'easeOutCubic'
});

// Crea un anchor para cada targetIndex
function buildAnchors() {
  for (let i = 0; i < LABELS.length; i++) {
    const assetId = `flag${i}`;
    const country = LABELS[i];

    const anchor = document.createElement('a-entity');
    anchor.setAttribute('mindar-image-target', `targetIndex: ${i}`);

    // Imagen (bandera) con “flotadito”
    const img = document.createElement('a-image');
    img.setAttribute('src', `#${assetId}`);
    img.setAttribute('position', '0 0 0.12'); // separa del plano para evitar z-fighting
    img.setAttribute('width', '1');
    img.setAttribute('height', '0.6');
    img.setAttribute('material', 'side: double');
    img.setAttribute(
      'animation',
      'property: position; to: 0 0.08 0.12; dur:1000; easing:easeInOutQuad; loop:true; dir:alternate'
    );
    anchor.appendChild(img);

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
    text.setAttribute('text', `value: ${country}; align: center; color: #fff; width: 2.4`);
    text.setAttribute('position', '0 0 0.001');
    label.appendChild(text);

    anchor.appendChild(label);

    // Eventos de tracking
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

    // Validación por consola: ¿existe el asset?
    if (!document.getElementById(assetId)) {
      console.warn(`⚠️ Falta <img id="${assetId}"> en <a-assets>. Revisa el ID o el archivo.`);
    }

    root.appendChild(anchor);
  }
}

// Mensajes de estado globales
scene.addEventListener('arReady', () => {
  status.textContent = 'Listo. Apunta a cualquiera de las 23 banderas.';
});

scene.addEventListener('arError', () => {
  status.textContent = 'Error de cámara/HTTPS/privacidad.';
});

// Inicializa
window.addEventListener('load', () => {
  status.style.display = 'block';
  buildAnchors();
});

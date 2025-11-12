const scene   = document.getElementById('scene');
const status  = document.getElementById('status');
const root    = document.getElementById('anchors-root');
const btnAnim = document.getElementById('btnAnim');
const toolbar = document.getElementById('toolbar');

const btnTrivia     = document.getElementById('btnTrivia');
const triviaModal   = document.getElementById('triviaModal');
const triviaClose   = document.getElementById('triviaClose');
const triviaCountry = document.getElementById('triviaCountry');
const triviaProgress= document.getElementById('triviaProgress');
const triviaQuestion= document.getElementById('triviaQuestion');
const triviaOptions = document.getElementById('triviaOptions');
const triviaNext    = document.getElementById('triviaNext');
const triviaFinish  = document.getElementById('triviaFinish');
const triviaResult  = document.getElementById('triviaResult');

/* === VIDEO (YouTube) === */
const btnVideo     = document.getElementById('btnVideo');
const videoModal   = document.getElementById('videoModal');
const videoClose   = document.getElementById('videoClose');
const videoCountry = document.getElementById('videoCountry');
const ytFrame      = document.getElementById('ytFrame');

/* === Filtros de video (select + slider) === */
const videoFilter           = document.getElementById('videoFilter');
const videoFilterAmount     = document.getElementById('videoFilterAmount');
const videoFilterAmountWrap = document.getElementById('videoFilterAmountWrap');

let currentTargetIndex = null;
let currentCountryLabel = null;

/* ===== Defaults globales ===== */
const DEFAULT_MODEL_SCALE = 0.10;
const DEFAULT_MODEL_POSX  = 0.73;
const DEFAULT_MODEL_POSY  = 0.01;
const DEFAULT_MODEL_POSZ  = 0.16;
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

/* ===== Banco de preguntas (1 por país, label EXACTO con MAP) ===== */
const QUESTION_BANK = {
  'ARABIA SAUDITA': { q:'Capital de Arabia Saudita:', options:['Riad','Jeddah','La Meca','Medina'], answer:0 },
  'ARGELIA': { q:'Continente al que pertenece Argelia:', options:['Asia','África','Europa','Oceanía'], answer:1 },
  'ARGENTINA': { q:'Colores de la bandera de Argentina:', options:['Rojo/Blanco','Celeste/Blanco','Verde/Blanco','Amarillo/Azul'], answer:1 },
  'AUSTRALIA': { q:'Animal símbolo frecuente de Australia:', options:['Búfalo','Canguro','Oso panda','Lobo'], answer:1 },
  'BRASIL': { q:'Idioma oficial de Brasil:', options:['Español','Portugués','Inglés','Francés'], answer:1 },
  'CABO VERDE': { q:'¿Qué es Cabo Verde?', options:['Archipiélago','Desierto','Cordillera','Lago'], answer:0 },
  'CANADÁ': { q:'Hoja en la bandera de Canadá:', options:['Roble','Arce','Olivo','Haya'], answer:1 },
  'CATAR': { q:'Catar fue sede del mundial en:', options:['2018','2022','2006','2014'], answer:1 },
  'COLOMBIA': { q:'Moneda de Colombia:', options:['Peso','Real','Sol','Dólar'], answer:0 },
  'COREA DEL SUR': { q:'Capital de Corea del Sur:', options:['Busan','Seúl','Incheon','Daegu'], answer:1 },
  'COSTA DE MARFIL': { q:'Colores de su bandera (asta→vuelo):', options:['Verde-Blanco-Naranja','Naranja-Blanco-Verde','Rojo-Blanco-Azul','Azul-Amarillo-Rojo'], answer:1 },
  'ECUADOR': { q:'La línea ecuatorial pasa por:', options:['Ecuador','Uruguay','Chile','Paraguay'], answer:0 },
  'ESTADOS UNIDOS': { q:'N.º de estrellas en la bandera:', options:['13','25','50','52'], answer:2 },
  'INGLATERRA': { q:'Cruz de la bandera de Inglaterra:', options:['San Jorge','San Patricio','San Andrés','San Benito'], answer:0 },
  'IRÁN': { q:'Capital de Irán:', options:['Isfahán','Shiraz','Teherán','Tabriz'], answer:2 },
  'JAPÓN': { q:'Símbolo central de la bandera japonesa:', options:['Sol rojo','Cerezo','Dragón','Monte Fuji'], answer:0 },
  'JORDANIA': { q:'Estrella en la bandera jordana:', options:['5 puntas','6 puntas','7 puntas','8 puntas'], answer:2 },
  'MÉXICO': { q:'Símbolo del escudo de México:', options:['Cóndor','Águila y serpiente','León','Quetzal'], answer:1 },
  'PARAGUAY': { q:'Particularidad de su bandera:', options:['Tres colores','Escudo distinto por lado','Es vertical','No tiene escudo'], answer:1 },
  'SENEGAL': { q:'Color de la estrella en su bandera:', options:['Roja','Azul','Amarilla','Verde'], answer:3 },
  'SUDÁFRICA': { q:'Rasgo de su bandera:', options:['Una franja','Y multicolor','Cruz nórdica','Dos estrellas'], answer:1 },
  'URUGUAY': { q:'Figura en su bandera:', options:['Sol','Luna','Águila','Flor'], answer:0 }
};

/* ===== YouTube por país (IDs) ===== */
const YT_BANK = {
  'MÉXICO':         '9mHyjCbsSN8',
  'ARGENTINA':      '1CLWRDi8uvk',
  'SENEGAL':        '-CitLr3iPvw',
  'ESTADOS UNIDOS': 'KafRmuuw6NE',
  'JAPÓN':          'WLIv7HnZ_fE',
  'INGLATERRA':     'ezrfJus7f3g',
  'CANADÁ':         'wlisSjsxXcQ',
  'COREA DEL SUR':  'zn5BlL-nN7M',
  'BRASIL':         'LWXMhpOkDVY',
  'ARABIA SAUDITA': 'R6D7jQI4BD0',
  'URUGUAY':        'quOuefqGn8g',
  'CATAR':          '4UmO1h8XBhw',
  'COLOMBIA':       'Kv98nRiRF74',
  'PARAGUAY':       '_GmQAkm4QP8',
  'IRÁN':           'HcmNJw9jbac',
  'COSTA DE MARFIL':'ZjGlnHnRBzw',
  'CABO VERDE':     'FnFBvLZTjFI',
  'JORDANIA':       'cq0Xryk2Qw4',
  'AUSTRALIA':      'iU7BITyUsv0',
  'ECUADOR':        'rIxZOPuHodM',
  'ARGELIA':        'ID_ARGELIA'
};

/* ===== Listas para pausar/reanudar ===== */
const modelsList = [];
const flagsList  = [];
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

/* ===== Trivia utils ===== */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function takeRandomUniqueKeys(keys, n, mustInclude = null) {
  let pool = keys.slice();
  if (mustInclude && pool.includes(mustInclude)) {
    pool = pool.filter(k => k !== mustInclude);
    const rest = shuffle(pool).slice(0, Math.max(0, n - 1));
    return [mustInclude, ...rest];
  }
  return shuffle(pool).slice(0, n);
}

/* ===== Estado de trivia ===== */
const TRIVIA_LEN = 5;
const trivia = {
  pool: [],   // [{ country, q, options, answer }]
  index: 0,
  score: 0,
  selected: null
};
function openModal() {
  triviaModal.classList.remove('hidden');
  triviaModal.setAttribute('aria-hidden', 'false');
}
function closeModal() {
  triviaModal.classList.add('hidden');
  triviaModal.setAttribute('aria-hidden', 'true');
}

/* Lanza trivia global (5 países aleatorios, incluyendo el detectado si existe) */
function startGlobalTrivia(includeCurrent = true) {
  const labels = Object.keys(QUESTION_BANK);
  if (labels.length === 0) {
    alert('Aún no hay preguntas cargadas.');
    return;
  }
  const must = includeCurrent ? currentCountryLabel : null;
  const chosenCountries = takeRandomUniqueKeys(labels, Math.min(TRIVIA_LEN, labels.length), must);

  trivia.pool = chosenCountries.map(country => {
    const item = QUESTION_BANK[country];
    return { country, q: item.q, options: item.options, answer: item.answer };
  });
  trivia.index = 0;
  trivia.score = 0;
  trivia.selected = null;

  renderTriviaQuestion();
  openModal();
}

function renderTriviaQuestion() {
  const total = trivia.pool.length;
  const i = trivia.index;
  const item = trivia.pool[i];

  triviaCountry.textContent  = `País: ${item.country}`;
  triviaProgress.textContent = `Pregunta ${i+1} de ${total}`;
  triviaQuestion.textContent = item.q;
  triviaResult.classList.add('hidden');
  triviaResult.textContent = '';
  triviaNext.disabled = true;
  triviaFinish.classList.add('hidden');

  triviaOptions.innerHTML = '';
  item.options.forEach((opt, idx) => {
    const li = document.createElement('li');
    li.textContent = opt;
    li.addEventListener('click', () => {
      [...triviaOptions.children].forEach(el => el.classList.remove('selected'));
      li.classList.add('selected');
      trivia.selected = idx;
      triviaNext.disabled = false;
    });
    triviaOptions.appendChild(li);
  });

  if (i === total - 1) {
    triviaNext.classList.add('hidden');
    triviaFinish.classList.remove('hidden');
  } else {
    triviaNext.classList.remove('hidden');
    triviaFinish.classList.add('hidden');
  }
}

function gradeCurrent() {
  const item = trivia.pool[trivia.index];
  if (trivia.selected === item.answer) trivia.score += 1;
}

/* ===== FILTROS DE VIDEO (CSS filter) ===== */
function buildCssFilter(type, amount) {
  // amount: 0–200 (100 neutro), salvo 'hue' (0–360) y 'blur' (0–10px)
  switch (type) {
    case 'none':       return 'none';
    case 'grayscale':  return `grayscale(${amount/100})`;
    case 'sepia':      return `sepia(${amount/100})`;
    case 'saturate':   return `saturate(${amount}%)`;
    case 'contrast':   return `contrast(${amount}%)`;
    case 'brightness': return `brightness(${amount}%)`;
    case 'invert':     return `invert(${amount/100})`;
    case 'hue':        return `hue-rotate(${amount}deg)`;
    case 'blur':       return `blur(${(amount/200)*10}px)`;
    default:           return 'none';
  }
}
function applyCurrentFilter() {
  if (!ytFrame) return;
  const type = videoFilter?.value || 'none';

  // Ajustar tope del slider por tipo
  if (type === 'hue') videoFilterAmount.max = 360;
  else                videoFilterAmount.max = 200;

  const amount = parseInt(videoFilterAmount?.value ?? '100', 10);
  const css = buildCssFilter(type, amount);

  ytFrame.style.filter = css;
  ytFrame.style.webkitFilter = css;
}
function resetVideoFilter() {
  if (!ytFrame) return;
  ytFrame.style.filter = 'none';
  ytFrame.style.webkitFilter = 'none';
  if (videoFilter) videoFilter.value = 'none';
  if (videoFilterAmount) {
    videoFilterAmount.max = 200;
    videoFilterAmount.value = 100;
  }
  if (videoFilterAmountWrap) videoFilterAmountWrap.style.display = 'none';
}

/* ===== VIDEO (YouTube) ===== */
function openYouTubeForCountry(countryLabel) {
  const id = YT_BANK[countryLabel];
  if (!id) { alert('Aún no hay video para este país.'); return; }

  resetVideoFilter(); // limpia filtros al abrir

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',          // autoplay en móviles
    playsinline: '1',   // evita fullscreen forzado en iOS
    rel: '0',
    modestbranding: '1',
    controls: '1'
  });

  ytFrame.src = `https://www.youtube.com/embed/${id}?${params.toString()}`;
  videoCountry.textContent = `País: ${countryLabel}`;

  videoModal.classList.remove('hidden');
  videoModal.setAttribute('aria-hidden', 'false');
}
function closeYouTubeModal() {
  videoModal.classList.add('hidden');
  videoModal.setAttribute('aria-hidden', 'true');
  ytFrame.src = ''; // detiene el video
  resetVideoFilter();
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
      // Guardar país activo y mostrar botones
      currentTargetIndex = i;
      currentCountryLabel = cfg.label;
      if (btnTrivia) btnTrivia.style.display = 'inline-block';
      if (btnVideo)  btnVideo.style.display  = 'inline-block';

      label.setAttribute('visible', 'true');
      pop(label, 1, 220);
    });

    anchor.addEventListener('targetLost', () => {
      status.style.display = 'block';
      status.textContent = 'No veo el marcador. Vuelve a apuntar.';
      if (toolbar) toolbar.style.display = 'none';

      // Limpiar país y ocultar botones
      currentTargetIndex = null;
      currentCountryLabel = null;
      if (btnTrivia) btnTrivia.style.display = 'none';
      if (btnVideo)  btnVideo.style.display  = 'none';

      // (Opcional) cerrar modales al perder target
      // closeModal();
      // closeYouTubeModal();

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

/* ===== Trivia: listeners ===== */
if (btnTrivia) {
  btnTrivia.addEventListener('click', () => {
    // true: garantiza incluir el país detectado dentro de las 5 preguntas (si hay uno)
    startGlobalTrivia(true);
  });
}
if (triviaClose) triviaClose.addEventListener('click', closeModal);
if (triviaModal) {
  triviaModal.addEventListener('click', (e) => {
    if (e.target.dataset.close === 'true') closeModal();
  });
}
if (triviaNext) {
  triviaNext.addEventListener('click', () => {
    if (trivia.selected == null) return;
    gradeCurrent();
    trivia.index += 1;
    trivia.selected = null;
    renderTriviaQuestion();
  });
}
if (triviaFinish) {
  triviaFinish.addEventListener('click', () => {
    if (trivia.selected != null) gradeCurrent();
    const total = trivia.pool.length;
    triviaOptions.innerHTML = '';
    triviaQuestion.textContent = '¡Trivia finalizada!';
    triviaProgress.textContent = '';
    triviaNext.classList.add('hidden');
    triviaFinish.classList.add('hidden');
    triviaResult.classList.remove('hidden');
    triviaResult.textContent = `Tu puntaje: ${trivia.score}/${total}`;
  });
}

/* ===== Video: listeners ===== */
if (btnVideo) {
  btnVideo.addEventListener('click', () => {
    if (!currentCountryLabel) {
      alert('Escanea una bandera para ver el video de ese país.');
      return;
    }
    openYouTubeForCountry(currentCountryLabel);
  });
}
if (videoClose) videoClose.addEventListener('click', closeYouTubeModal);
if (videoModal) {
  videoModal.addEventListener('click', (e) => {
    if (e.target.dataset.close === 'true') closeYouTubeModal();
  });
}

/* ===== Filtros: listeners ===== */
if (videoFilter) {
  videoFilter.addEventListener('change', () => {
    const t = videoFilter.value;

    // Mostrar/ocultar slider por tipo de filtro
    videoFilterAmountWrap.style.display = (t === 'none') ? 'none' : 'inline-flex';

    // Defaults útiles por filtro
    if (t === 'hue')        videoFilterAmount.value = 180; // medio tono
    else if (t === 'blur')  videoFilterAmount.value = 40;  // ~2px
    else                    videoFilterAmount.value = 100; // neutro

    applyCurrentFilter();
  });
}
if (videoFilterAmount) {
  videoFilterAmount.addEventListener('input', applyCurrentFilter);
}

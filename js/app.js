const logEl = document.getElementById('log');
const video = document.getElementById('preview');
const fsBtn = document.getElementById('fsBtn');
const switchBtn = document.getElementById('switchBtn');
const torchBtn = document.getElementById('torchBtn');

let currentStream = null;
let videoInputs = [];      // dispositivos de video
let currentDeviceId = null;
let torchOn = false;

function log(msg) {
  console.log(msg);
  if (!logEl) return;
  const txt = (typeof msg === 'string') ? msg : JSON.stringify(msg, null, 2);
  logEl.textContent = txt;
}

function stopStream() {
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
    currentStream = null;
  }
  video.srcObject = null;
}

async function goFullscreenIfPossible() {
  // Algunos navegadores requieren gesto; mostramos botón si falla
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    }
  } catch (e) {
    fsBtn.hidden = false; // mostrará botón para pedir fullscreen manualmente
  }
}

// Devuelve dispositivos videoinput
async function getVideoInputs() {
  const all = await navigator.mediaDevices.enumerateDevices();
  return all.filter(d => d.kind === 'videoinput');
}

// Intenta abrir cámara con constraints dados
async function startWith(constraints, tag='') {
  try {
    log(`getUserMedia ${tag}…`);
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    stopStream();
    currentStream = stream;
    video.srcObject = stream;
    await video.play();

    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    currentDeviceId = settings.deviceId || currentDeviceId;

    // Torch disponible?
    const caps = track.getCapabilities?.() || {};
    const canTorch = 'torch' in caps;
    torchBtn.hidden = !canTorch;
    torchOn = false;
    if (canTorch) torchBtn.textContent = '🔦';

    // Actualiza lista de cámaras (para switch)
    videoInputs = await getVideoInputs();
    switchBtn.hidden = videoInputs.length <= 1;

    log({ ok: true, tag, label: track.label, settings, canTorch });
    return true;
  } catch (e) {
    log(`Fallo (${tag}): ${e.name} - ${e.message}`);
    return false;
  }
}

// Preferir cámara trasera en móvil, con fallbacks
async function startAutoRear() {
  // 1) Intento directo con facingMode environment (el estándar)
  if (await startWith({ video: { facingMode: { exact: 'environment' } } }, 'env-exact')) return true;
  if (await startWith({ video: { facingMode: 'environment' } }, 'env-ideal')) return true;

  // 2) Pedir permiso mínimo para poder leer labels y elegir trasera por nombre
  // (algunos navegadores ocultan labels hasta que se obtiene un stream)
  if (!currentStream) {
    if (!(await startWith({ video: true }, 'default-temp'))) {
      // 3) Si ni default permite, ya no hay nada que hacer
      return false;
    }
  }

  // Ya tengo permisos: obtengo las cámaras con labels visibles
  videoInputs = await getVideoInputs();

  // Busco una que suene a trasera
  const candidates = videoInputs.filter(d =>
    /back|rear|environment|trase|atrás|trasera/i.test(d.label)
  );

  const pick = (candidates[0] || videoInputs.find(d => d.deviceId !== currentDeviceId) || videoInputs[0]);
  if (!pick) return true; // ya tenemos stream al menos

  // Cambiar a esa cámara explícitamente
  if (await startWith({ video: { deviceId: { exact: pick.deviceId } } }, 'deviceId-rear')) {
    return true;
  }

  return true; // al menos quedó la default
}

// Cambiar a la siguiente cámara
async function switchCamera() {
  if (!videoInputs.length) videoInputs = await getVideoInputs();
  if (!videoInputs.length) return;

  const idx = Math.max(0, videoInputs.findIndex(d => d.deviceId === currentDeviceId));
  const next = videoInputs[(idx + 1) % videoInputs.length];
  await startWith({ video: { deviceId: { exact: next.deviceId } } }, 'switch');
}

// Torch (si soporta)
async function toggleTorch() {
  if (!currentStream) return;
  const track = currentStream.getVideoTracks()[0];
  const caps = track.getCapabilities?.() || {};
  if (!('torch' in caps)) return;

  torchOn = !torchOn;
  try {
    await track.applyConstraints({ advanced: [{ torch: torchOn }] });
    torchBtn.textContent = torchOn ? '🔦 ON' : '🔦';
  } catch (e) {
    log('No se pudo activar torch: ' + e.message);
  }
}

// Eventos
switchBtn.addEventListener('click', switchCamera);
torchBtn.addEventListener('click', toggleTorch);
fsBtn.addEventListener('click', async () => {
  try {
    await document.documentElement.requestFullscreen?.();
    fsBtn.hidden = true;
  } catch {}
});

// Arranque
(async function init() {
  if (!navigator.mediaDevices?.getUserMedia) {
    log('Este navegador no soporta getUserMedia.');
    return;
  }

  // Intenta fullscreen (si falla, aparece el botón)
  await goFullscreenIfPossible();

  // Arranca tratando de usar la trasera
  const ok = await startAutoRear();
  if (!ok) {
    log('No se pudo iniciar cámara.\n• Asegura HTTPS/localhost\n• Da permisos\n• Cierra apps que usen la cámara (Zoom/WhatsApp/Teams).');
  }

  // Ajuste de orientación (best-effort)
  try { await screen.orientation?.lock?.('portrait'); } catch {}
})();

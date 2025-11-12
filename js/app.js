// Usa THREE desde el bundle de MindAR
const THREE = (window.MINDAR && window.MINDAR.IMAGE && window.MINDAR.IMAGE.THREE);

let mindarThree = null;
let renderer = null, scene = null, camera = null;
let started = false;

const startBtn = document.getElementById('start-btn');
const exitBtn  = document.getElementById('exit-btn');
const overlay  = document.getElementById('start-overlay');
const container = document.getElementById('mindar-container');

async function enterFullscreen(el) {
  try {
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen(); // Safari
    }
    if (screen.orientation && screen.orientation.lock) {
      try { await screen.orientation.lock('portrait'); } catch {}
    }
  } catch (e) {
    console.warn('[FS] No se pudo entrar a fullscreen:', e);
  }
}

async function startAR() {
  if (started) return;

  // Comprobaciones
  if (!window.MINDAR || !window.MINDAR.IMAGE) {
    alert('MindAR no está cargado (revisa el <script> del CDN).');
    return;
  }
  if (!THREE) {
    alert('THREE no está disponible desde el bundle de MindAR.');
    return;
  }

  await enterFullscreen(document.documentElement);

  try {
    console.log('[AR] Creando MindARThree…');
    mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container,
      imageTargetSrc: 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind',
      uiLoading: true,
      uiScanning: true,
      maxTrack: 1,
    });

    ({ renderer, scene, camera } = mindarThree);

    // Luz y cubo de prueba
    const light = new THREE.HemisphereLight(0xffffff, 0x222233, 1.0);
    scene.add(light);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshNormalMaterial()
    );

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(cube);

    console.log('[AR] Iniciando MindAR…');
    await mindarThree.start(); // si falla la cámara, salta al catch

    renderer.setAnimationLoop(() => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    });

    started = true;
    overlay.hidden = true;
    exitBtn.hidden = false;
    console.log('[AR] Iniciado OK');
  } catch (err) {
    console.error('[AR] Error al iniciar:', err);
    alert('No se pudo iniciar la cámara o MindAR.\n• Revisa permisos\n• Usa HTTPS o localhost\n• Cierra otras apps que usen la cámara');
  }
}

async function stopAR() {
  if (!started || !mindarThree) return;
  try {
    await mindarThree.stop();
    await mindarThree.renderer.setAnimationLoop(null);
  } catch (e) {
    console.warn('[AR] Error al detener:', e);
  }
  container.innerHTML = '';
  started = false;

  try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {}
  overlay.hidden = false;
  exitBtn.hidden = true;
}

startBtn.addEventListener('click', startAR);
exitBtn.addEventListener('click', stopAR);

window.addEventListener('pagehide', stopAR);
window.addEventListener('beforeunload', stopAR);

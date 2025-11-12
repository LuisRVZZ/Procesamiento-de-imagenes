document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-camera');
  const stopBtn = document.getElementById('stop-camera');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const placeholder = document.getElementById('camera-placeholder');
  const arView = document.querySelector('.ar-view');

  let mindarThree = null, renderer = null, scene = null, camera = null;
  let anchor = null, model = null, running = false;

  // Ajusta estas rutas EXACTAS
  const TARGET_MIND = '/assets/targets/flagMexico.mind';
  const MODEL_GLTF  = '/assets/models/Mexico.glb';

  // --- util: checa si el asset existe ---
  async function assertAsset(url) {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (!res.ok) throw new Error(`No se encontró: ${url} (HTTP ${res.status})`);
  }

  // --- util: “calienta” permisos de cámara (algunos navegadores lo requieren) ---
  async function warmUpCameraPermissions() {
    let tmp;
    try {
      tmp = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
    } finally {
      if (tmp) tmp.getTracks().forEach(t => t.stop());
    }
  }

  async function initMindAR() {
    if (mindarThree) return;

    // MUY IMPORTANTE: asegurar que la sección AR está visible
    // (si usas showSection, entra a #ar antes de darle Activar)
    const style = getComputedStyle(arView);
    if (style.display === 'none' || style.visibility === 'hidden') {
      console.warn('El contenedor .ar-view está oculto. Asegúrate de estar en la sección AR antes de iniciar.');
    }

    mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: arView,
      imageTargetSrc: TARGET_MIND,
      uiLoading: 'no', uiScanning: 'yes', uiError: 'yes',
      // Fuerza cámara trasera cuando exista:
      video: { facingMode: { ideal: 'environment' } }
    });

    ({ renderer, scene, camera } = mindarThree);

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    anchor = mindarThree.addAnchor(0);

    const loader = new THREE.GLTFLoader();
    loader.load(MODEL_GLTF, (gltf) => {
      model = gltf.scene;
      model.scale.set(0.15, 0.15, 0.15);
      model.position.set(0, 0, 0);
      model.rotation.set(0, Math.PI, 0);

      if (gltf.animations?.length) {
        const mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
        anchor.onRender = (dt) => mixer.update(dt);
      }
      anchor.group.add(model);
    }, undefined, (err) => {
      console.error('Error cargando GLB:', err);
    });

    anchor.onTargetFound = () => { placeholder.style.display = 'none'; };
    anchor.onTargetLost  = () => {};
  }

  async function startAR() {
    try {
      // 1) verifica assets (evita fallar luego por 404)
      await assertAsset(TARGET_MIND);
      await assertAsset(MODEL_GLTF);

      // 2) “calienta” permisos (ayuda en Safari/iOS y Android estrictos)
      await warmUpCameraPermissions();

      // 3) init + start
      await initMindAR();
      await mindarThree.start();

      running = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;
      placeholder.style.display = 'none';

      let last = performance.now();
      const loop = (now) => {
        if (!running) return;
        const dt = (now - last) / 1000; last = now;
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    } catch (e) {
      console.error('Fallo al iniciar AR:', e);

      // Diagnóstico más claro
      const msg = (e && e.message || '').toLowerCase();
      if (msg.includes('no se encontró') || msg.includes('404')) {
        alert('No se encontraron los assets (.mind o .glb). Revisa las rutas y nombres de archivo.');
      } else if (msg.includes('permission') || msg.includes('notallowederror') || msg.includes('denied')) {
        alert('Permiso de cámara denegado. Habilita el permiso en el navegador y vuelve a intentar.');
      } else if (msg.includes('notfounderror')) {
        alert('No se encontró ninguna cámara disponible.');
      } else if (msg.includes('notreadableerror') || msg.includes('trackstart')) {
        alert('La cámara está en uso por otra app/pestaña. Ciérralas e intenta de nuevo.');
      } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        alert('Debes usar HTTPS (Netlify lo tiene). Abre la versión segura del sitio.');
      } else {
        alert('No se pudo iniciar la cámara. Revisa permisos, HTTPS y que el dispositivo tenga cámara.');
      }
    }
  }

  async function stopAR() {
    if (!mindarThree) return;
    try {
      await mindarThree.stop();
    } catch {}
    try {
      mindarThree.renderer.domElement.remove();
    } catch {}
    mindarThree = renderer = scene = camera = anchor = model = null;
    running = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    placeholder.style.display = 'flex';
  }

  fullscreenBtn.addEventListener('click', () => {
    const fsIn  = arView.requestFullscreen || arView.webkitRequestFullscreen || arView.msRequestFullscreen;
    const fsOut = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (!document.fullscreenElement) fsIn?.call(arView); else fsOut?.call(document);
  });

  startBtn.addEventListener('click', startAR);
  stopBtn.addEventListener('click', stopAR);

  startBtn.disabled = false;
  stopBtn.disabled = true;
});

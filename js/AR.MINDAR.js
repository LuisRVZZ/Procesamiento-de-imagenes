document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-camera');
  const stopBtn = document.getElementById('stop-camera');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const placeholder = document.getElementById('camera-placeholder');
  const arView = document.querySelector('.ar-view');

  let mindarThree = null, renderer = null, scene = null, camera = null;
  let anchor = null, model = null, running = false;

  const TARGET_MIND = '/assets/targets/flagMexico.mind';
  const MODEL_GLTF  = '/assets/models/Mexico.glb';

  async function ensurePermissions() {
    console.log('[AR] solicitando permisos cámara…');
    let s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    s.getTracks().forEach(t => t.stop());
    console.log('[AR] permisos OK');
  }

  async function initMindAR() {
    if (mindarThree) return;

    mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: arView,
      imageTargetSrc: TARGET_MIND,
      uiLoading: 'no', uiScanning: 'yes', uiError: 'yes',
      video: { facingMode: { ideal: 'environment' } }
    });

    ({ renderer, scene, camera } = mindarThree);

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    anchor = mindarThree.addAnchor(0);

    anchor.onTargetFound = () => { placeholder.style.display = 'none'; };
    anchor.onTargetLost  = () => {};
  }

  function loadModelOnce() {
    if (model) return;
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
      console.log('[AR] GLB cargado:', MODEL_GLTF);
    }, undefined, (err) => {
      console.error('[AR] Error cargando GLB:', err);
      alert('El modelo GLB no pudo cargarse. Revisa la ruta/nombre y mira la consola.');
    });
  }

  async function startAR() {
    try {
      // 0) HTTPS
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        alert('Abre el sitio en HTTPS (Netlify)'); return;
      }

      // 1) Asegura que la sección AR esté visible y con tamaño
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById('ar').classList.add('active');
      console.log('[AR] ar-view size:', arView.clientWidth, arView.clientHeight);

      if (arView.clientHeight === 0 || arView.clientWidth === 0) {
        alert('El contenedor AR no tiene tamaño. Revisa el CSS de .ar-view.'); return;
      }

      // 2) Permisos primero (si falla, ya sabemos que es permisos)
      await ensurePermissions();

      // 3) Inicializa MindAR
      await initMindAR();
      console.log('[AR] iniciando MindAR…');
      await mindarThree.start();
      console.log('[AR] MindAR START OK');

      // 4) Carga el modelo
      loadModelOnce();

      // 5) UI y loop
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
      console.error('Fallo al iniciar AR:', e, 'name:', e.name, 'message:', e.message);
      const msg = (e && (e.name + ' ' + e.message)).toLowerCase();

      if (msg.includes('permission') || msg.includes('notallowederror') || msg.includes('denied')) {
        alert('Permiso de cámara denegado. Actívalo en el navegador (Configuración del sitio) y reintenta.');
      } else if (msg.includes('notfounderror')) {
        alert('No se encontró cámara en este dispositivo/navegador.');
      } else if (msg.includes('notreadableerror') || msg.includes('trackstart')) {
        alert('La cámara está en uso por otra app/pestaña. Ciérralas e intenta de nuevo.');
      } else {
        alert('No se pudo iniciar la cámara. Revisa permisos/HTTPS y que el dispositivo tenga cámara. Mira la consola.');
      }
    }
  }

  async function stopAR() {
    if (!mindarThree) return;
    try { await mindarThree.stop(); } catch {}
    try { mindarThree.renderer.domElement.remove(); } catch {}
    mindarThree = renderer = scene = camera = anchor = model = null;
    running = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    placeholder.style.display = 'flex';
    console.log('[AR] MindAR detenido');
  }

  fullscreenBtn.addEventListener('click', () => {
    const fsIn  = arView.requestFullscreen || arView.webkitRequestFullscreen || arView.msRequestFullscreen;
    const fsOut = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (!document.fullscreenElement) fsIn?.call(arView); else fsOut?.call(document);
  });

  // ¡Importante! usar nuestro start que fuerza visibilidad y chequeos
  startBtn.addEventListener('click', startAR);
  stopBtn.addEventListener('click', stopAR);

  startBtn.disabled = false;
  stopBtn.disabled = true;
});

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-camera');
  const stopBtn = document.getElementById('stop-camera');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const placeholder = document.getElementById('camera-placeholder');
  const arView = document.querySelector('.ar-view');

  let mindarThree = null, renderer = null, scene = null, camera = null;
  let anchor = null, model = null, running = false;

  // RUTAS (ajusta si cambian nombres/carpeta)
  const TARGET_MIND = '/assets/targets/flagMexico.mind';
  const MODEL_GLTF  = '/assets/models/Mexico.glb';

  // (Opcional) calentar permiso de cámara. Ayuda en iOS/Android estrictos.
  async function warmUpCameraPermissions() {
    let tmp;
    try {
      tmp = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
    } catch (e) {
      console.warn('Warm-up getUserMedia falló (continuamos):', e.name, e.message);
    } finally {
      if (tmp) tmp.getTracks().forEach(t => t.stop());
    }
  }

  async function initMindAR() {
    if (mindarThree) return;

    // Aviso si el contenedor está oculto (no debe estarlo)
    const style = getComputedStyle(arView);
    if (style.display === 'none' || style.visibility === 'hidden') {
      console.warn('El contenedor .ar-view está oculto. Asegura que #ar esté activo antes de iniciar.');
    }

    mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: arView,
      imageTargetSrc: TARGET_MIND,
      uiLoading: 'no', uiScanning: 'yes', uiError: 'yes',
      video: { facingMode: { ideal: 'environment' } } // trasera cuando exista
    });

    ({ renderer, scene, camera } = mindarThree);

    // Luz básica
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    // Anchor al primer target (índice 0)
    anchor = mindarThree.addAnchor(0);

    anchor.onTargetFound = () => { placeholder.style.display = 'none'; };
    anchor.onTargetLost  = () => {};
  }

  // Carga el modelo DESPUÉS de que MindAR ya inició
  function loadModelOnce() {
    if (model) return; // ya cargado
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
      console.log('GLB cargado OK:', MODEL_GLTF);
    }, undefined, (err) => {
      console.error('Error cargando GLB:', err);
      alert('El modelo GLB no pudo cargarse. Revisa ruta/nombre y consola.');
    });
  }

  async function startAR() {
    try {
      // Asegura HTTPS o localhost
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        alert('Abre la versión HTTPS del sitio (Netlify).');
        return;
      }

      // 0) Warm-up permisos (opcional pero recomendado)
      await warmUpCameraPermissions();

      // 1) Init MindAR
      await initMindAR();
      console.log('MindAR inicializado. Iniciando cámara...');
      await mindarThree.start(); // si falla permisos/cámara, cae al catch
      console.log('MindAR START OK');

      // 2) Ya que arrancó, carga el modelo
      loadModelOnce();

      // 3) Estado UI
      running = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;
      placeholder.style.display = 'none';

      // 4) Render loop
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

      if (msg.includes('notallowederror') || msg.includes('permission') || msg.includes('denied')) {
        alert('Permiso de cámara denegado. Actívalo en el navegador y vuelve a intentar.');
      } else if (msg.includes('notfounderror')) {
        alert('No se encontró ninguna cámara disponible.');
      } else if (msg.includes('notreadableerror') || msg.includes('trackstart')) {
        alert('La cámara está en uso por otra app/pestaña. Ciérralas e intenta de nuevo.');
      } else {
        alert('No se pudo iniciar la cámara. Revisa permisos/HTTPS y que el dispositivo tenga cámara.');
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
    console.log('MindAR detenido');
  }

  // FULLSCREEN
  fullscreenBtn.addEventListener('click', () => {
    const fsIn  = arView.requestFullscreen || arView.webkitRequestFullscreen || arView.msRequestFullscreen;
    const fsOut = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (!document.fullscreenElement) fsIn?.call(arView); else fsOut?.call(document);
  });

  // *** IMPORTANTE: forzar visibilidad de #ar antes de iniciar ***
  startBtn.addEventListener('click', async () => {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('ar').classList.add('active');
    console.log('ar-view size:', arView.clientWidth, arView.clientHeight);
    await startAR();
  });

  stopBtn.addEventListener('click', stopAR);

  // Estado inicial
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

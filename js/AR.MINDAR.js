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

  async function initMindAR() {
    if (mindarThree) return;

    mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: arView,
      imageTargetSrc: TARGET_MIND,
      uiLoading: 'no', uiScanning: 'yes', uiError: 'yes',
      // video: { facingMode: 'environment' } // opcional
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

      // Animaciones del GLB (si trae)
      if (gltf.animations?.length) {
        const mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
        anchor.onRender = (dt) => mixer.update(dt);
      }
      anchor.group.add(model);
    });

    anchor.onTargetFound = () => { placeholder.style.display = 'none'; };
    anchor.onTargetLost  = () => {};
  }

  async function startAR() {
    try {
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
      console.error(e);
      alert('No se pudo iniciar la cámara. Verifica permisos y HTTPS.');
    }
  }

  async function stopAR() {
    if (!mindarThree) return;
    await mindarThree.stop();
    mindarThree.renderer.domElement.remove();
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

  // Estado inicial
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

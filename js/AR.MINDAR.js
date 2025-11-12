import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-camera');
  const stopBtn = document.getElementById('stop-camera');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const placeholder = document.getElementById('camera-placeholder');
  const arView = document.querySelector('.ar-view');

  let mindarThree = null, renderer = null, scene = null, camera = null;
  let anchor = null, model = null, running = false, mixer = null;

  const TARGET_MIND = '/assets/targets/flagMexico.mind';
  const MODEL_GLTF  = '/assets/models/Mexico.glb';

  async function initMindAR() {
    if (mindarThree) return;
    mindarThree = new MindARThree({
      container: arView,
      imageTargetSrc: TARGET_MIND,
      uiLoading: 'no', uiScanning: 'yes', uiError: 'yes'
    });
    ({ renderer, scene, camera } = mindarThree);

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    anchor = mindarThree.addAnchor(0);
    anchor.onTargetFound = () => { placeholder.style.display = 'none'; };
  }

  function loadModelOnce() {
    if (model) return;
    const loader = new GLTFLoader();
    loader.load(MODEL_GLTF, (gltf) => {
      model = gltf.scene;
      model.scale.set(0.15, 0.15, 0.15);
      model.rotation.y = Math.PI;
      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
        anchor.onRender = (dt) => mixer?.update(dt);
      }
      anchor.group.add(model);
    }, undefined, (err) => {
      console.error('[AR] Error GLB:', err);
      alert('No se pudo cargar el .glb (ruta/CORS). Revisa la consola.');
    });
  }

  async function startAR() {
    try {
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        alert('Abre el sitio en HTTPS (Netlify).'); return;
      }
      // muestra la sección AR
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById('ar').classList.add('active');

      await initMindAR();
      await mindarThree.start();
      loadModelOnce();

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
      alert('No se pudo iniciar la cámara/AR. Revisa HTTPS, permisos y la consola.');
    }
  }

  async function stopAR() {
    if (!mindarThree) return;
    try { await mindarThree.stop(); } catch {}
    try { mindarThree.renderer.domElement.remove(); } catch {}
    mindarThree = renderer = scene = camera = anchor = model = mixer = null;
    running = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    placeholder.style.display = 'flex';
  }

  fullscreenBtn?.addEventListener('click', () => {
    const fsIn  = arView.requestFullscreen || arView.webkitRequestFullscreen || arView.msRequestFullscreen;
    const fsOut = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (!document.fullscreenElement) fsIn?.call(arView); else fsOut?.call(document);
  });

  startBtn.addEventListener('click', startAR);
  stopBtn .addEventListener('click', stopAR);
});

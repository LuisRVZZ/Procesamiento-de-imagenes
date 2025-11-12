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
  let anchor = null, model = null, mixer = null;
  let running = false;

  // Para animaciones con Three de forma estable
  const clock = new THREE.Clock();

  // Mantener handler nombrado para poder removerlo en stop
  const resizeHandler = () => {
    if (!renderer) return;
    const w = arView.clientWidth || 640;
    const h = arView.clientHeight || 360;
    renderer.setSize(w, h, false);
  };

  // Rutas RELATIVAS (Netlify/GitHub Pages)
  const TARGET_MIND = './assets/targets/flagMexico.mind';
  const MODEL_GLTF  = './assets/models/Mexico.glb';

  async function pickCameraDeviceId(){
    try{
      // Pre-solicita permiso para poder ver labels y elegir cámara trasera
      const tmp = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      tmp.getTracks().forEach(t => t.stop());
      const devs = await navigator.mediaDevices.enumerateDevices();
      const cams = devs.filter(d => d.kind === 'videoinput');
      const back = cams.find(d => /back|rear|environment/i.test(d.label));
      return (back || cams[0])?.deviceId || null;
    }catch{ 
      return null; 
    }
  }

  async function initMindAR(deviceId = null) {
    if (mindarThree) return;

    mindarThree = new MindARThree({
      container: arView,
      imageTargetSrc: TARGET_MIND,
      uiLoading: 'no', uiScanning: 'yes', uiError: 'yes',
      // Ayuda a elegir la cámara trasera en móvil/Edge
      videoConfig: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }
    });

    ({ renderer, scene, camera } = mindarThree);

    // three r160: color space
    if (renderer.outputColorSpace !== undefined) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    // Luz básica
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    // Anchor del target #0
    anchor = mindarThree.addAnchor(0);

    // Si quieres overlay cuando no hay target, vuelve a mostrar el placeholder aquí.
    // Para evitar "pantalla negra", lo dejamos SIEMPRE oculto tras iniciar.
    anchor.onTargetFound = () => {
      if (mixer) mixer.timeScale = 1;
    };
    anchor.onTargetLost = () => {
      if (mixer) mixer.timeScale = 0;
      // Si prefieres overlay sin target, descomenta:
      // placeholder.style.display = 'flex';
    };
  }

  function loadModelOnce() {
    if (model) return;
    const loader = new GLTFLoader();
    loader.load(MODEL_GLTF, (gltf) => {
      model = gltf.scene;
      model.scale.set(0.15, 0.15, 0.15);
      model.rotation.y = Math.PI;
      anchor.group.add(model);

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }
    }, undefined, (err) => {
      console.error('[AR] Error GLB:', err);
      alert('No se pudo cargar el .glb (ruta/CORS). Revisa la consola.');
    });
  }

  async function startAR() {
    try {
      // HTTPS requerido en móvil (excepto localhost)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        alert('Abre el sitio en HTTPS (Netlify).');
        return;
      }

      // Asegura que la sección AR esté visible
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById('ar').classList.add('active');

      const deviceId = await pickCameraDeviceId().catch(()=>null);
      await initMindAR(deviceId);

      // Inicia cámara/AR
      try { 
        await mindarThree.start(); 
      } catch(e){
        console.error('mindarThree.start() falló', e);
        if (e?.name === 'NotAllowedError') return alert('Permiso de cámara denegado.');
        if (e?.name === 'NotFoundError')  return alert('No se encontró cámara.');
        return alert('No se pudo iniciar la cámara. Revisa permisos o que no esté en uso por otra app.');
      }

      // Oculta overlay apenas arranca (clave para evitar “negro”)
      placeholder.style.display = 'none';

      // Ajusta tamaño cuando ya está montado
      resizeHandler();
      window.addEventListener('resize', resizeHandler);

      loadModelOnce();

      running = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;

      // Loop oficial: actualiza mixer y renderiza
      renderer.setAnimationLoop(() => {
        if (!running) return;
        const dt = clock.getDelta();
        if (mixer) mixer.update(dt);
        renderer.render(scene, camera);
      });

    } catch (e) {
      console.error('Fallo al iniciar AR:', e);
      alert('No se pudo iniciar la cámara/AR. Revisa HTTPS, permisos y la consola.');
    }
  }

  async function stopAR() {
    if (!mindarThree) return;

    // Corta el loop y limpia listeners
    running = false;
    renderer?.setAnimationLoop(null);
    window.removeEventListener('resize', resizeHandler);

    // Detén MindAR y quita canvas
    try { await mindarThree.stop(); } catch {}
    try { mindarThree.renderer.domElement.remove(); } catch {}

    // Limpieza de recursos Three
    try {
      scene?.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose?.();
        if (obj.material) {
          (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => {
            m.map?.dispose?.();
            m.dispose?.();
          });
        }
      });
      renderer?.dispose?.();
    } catch {}

    mindarThree = renderer = scene = camera = anchor = model = mixer = null;

    startBtn.disabled = false;
    stopBtn.disabled = true;
    // Si quieres volver a mostrar overlay al detener:
    placeholder.style.display = 'flex';
  }

  // Pantalla completa
  fullscreenBtn?.addEventListener('click', () => {
    const fsIn  = arView.requestFullscreen || arView.webkitRequestFullscreen || arView.msRequestFullscreen;
    const fsOut = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (!document.fullscreenElement) fsIn?.call(arView); else fsOut?.call(document);
  });

  startBtn.addEventListener('click', startAR);
  stopBtn .addEventListener('click', stopAR);
});

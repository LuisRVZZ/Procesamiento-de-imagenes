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

  // Usa rutas RELATIVAS para Netlify/GitHub Pages
  const TARGET_MIND = './assets/targets/flagMexico.mind';
  const MODEL_GLTF  = './assets/models/Mexico.glb';

  async function pickCameraDeviceId(){
    // Pre-solicita permiso para poder listar devices con label
    const tmp = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    tmp.getTracks().forEach(t => t.stop());
    const devs = await navigator.mediaDevices.enumerateDevices();
    const cams = devs.filter(d => d.kind === 'videoinput');
    const back = cams.find(d => /back|rear|environment/i.test(d.label));
    return (back || cams[0])?.deviceId || null;
  }

  async function initMindAR(deviceId = null) {
    if (mindarThree) return;

    mindarThree = new MindARThree({
      container: arView,
      imageTargetSrc: TARGET_MIND,
      uiLoading: 'no', uiScanning: 'yes', uiError: 'yes',
      // Ayuda en Edge/móvil a elegir la cámara correcta
      videoConfig: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }
    });

    ({ renderer, scene, camera } = mindarThree);

    // Three r160+: sustituye outputEncoding por outputColorSpace
    try { renderer.outputColorSpace = THREE.SRGBColorSpace; } catch {}

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    anchor = mindarThree.addAnchor(0);
    anchor.onTargetFound = () => { 
      placeholder.style.display = 'none'; 
      if (mixer) mixer.timeScale = 1; 
    };
    anchor.onTargetLost = () => { 
      placeholder.style.display = 'flex'; 
      if (mixer) mixer.timeScale = 0; 
    };
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
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
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
        alert('Abre el sitio en HTTPS (Netlify).'); 
        return;
      }

      // Muestra la sección AR
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById('ar').classList.add('active');

      // Selecciona dispositivo (mejora compatibilidad Edge/móvil)
      let deviceId = null;
      try { deviceId = await pickCameraDeviceId(); } catch {}

      await initMindAR(deviceId);

      // Inicia cámara y tracking
      try { 
        await mindarThree.start(); 
      } catch(e){
        console.error('mindarThree.start() falló', e);
        if (e?.name === 'NotAllowedError') return alert('Permiso de cámara denegado.');
        if (e?.name === 'NotFoundError')  return alert('No se encontró cámara.');
        return alert('No se pudo iniciar la cámara. Revisa permisos o que no esté en uso por otra app.');
      }

      // Forzar tamaño del renderer tras montar el canvas
      const resize = ()=>{
        const w = arView.clientWidth || 640;
        const h = arView.clientHeight || 360;
        renderer.setSize(w, h, false);
      };
      resize();
      window.addEventListener('resize', resize);

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

    // Limpieza opcional de recursos
    try {
      scene?.traverse(obj=>{
        if (obj.geometry) obj.geometry.dispose?.();
        if (obj.material) {
          (Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>{
            m.map?.dispose?.(); m.dispose?.();
          });
        }
      });
      renderer?.dispose?.();
    } catch {}

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

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MindARThree } from "mindar-image-three";

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-camera");
  const stopBtn  = document.getElementById("stop-camera");
  const placeholder = document.getElementById("camera-placeholder");
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  const container = document.getElementById("ar-view");

  // Instancia MindAR apuntando a tu target
  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: "./assets/targets/flagMexico.mind", // <-- TU TARGET
    uiScanning: true,
    uiLoading: true,
  });

  const { renderer, scene, camera } = mindarThree;

  // Luz básica
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.2));
  const dir = new THREE.DirectionalLight(0xffffff, 0.7);
  dir.position.set(0, 2, 1);
  scene.add(dir);

  // Anchor para el primer (y único) target del .mind
  const anchor = mindarThree.addAnchor(0);

  // Cargar tu modelo GLB
  const loader = new GLTFLoader();
  let model = null;

  loader.load(
    "./assets/models/Mexico.glb", // <-- TU MODELO
    (gltf) => {
      model = gltf.scene;
      // Ajusta escala/rotación/posición según necesites:
      model.scale.set(0.3, 0.3, 0.3);         // prueba: 30% del tamaño original
      model.rotation.set(0, Math.PI, 0);      // voltear si sale al revés
      model.position.set(0, 0, 0);            // centrado sobre el target

      // arranca oculto hasta que el target se detecte
      model.visible = false;

      anchor.group.add(model);
    },
    undefined,
    (err) => console.error("Error cargando Mexico.glb:", err)
  );

  // Mostrar/Ocultar al encontrar o perder el target
  anchor.onTargetFound = () => { if (model) model.visible = true; };
  anchor.onTargetLost  = () => { if (model) model.visible = false; };

  // Animación opcional: giro suave cuando el target está a la vista
  const clock = new THREE.Clock();
  const loop = () => {
    const dt = clock.getDelta();
    if (model && model.visible) model.rotation.y += dt * 0.8;
    renderer.render(scene, camera);
  };

  // Fullscreen
  fullscreenBtn?.addEventListener("click", () => {
    if (!document.fullscreenElement) container.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  // Start
  startBtn.addEventListener("click", async () => {
    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      alert("La cámara requiere HTTPS o localhost.");
      return;
    }
    placeholder.style.display = "none";
    startBtn.disabled = true;
    stopBtn.disabled = false;

    await mindarThree.start();
    renderer.setAnimationLoop(loop);
  });

  // Stop
  stopBtn.addEventListener("click", async () => {
    await mindarThree.stop();
    renderer.setAnimationLoop(null);

    placeholder.style.display = "flex";
    startBtn.disabled = false;
    stopBtn.disabled = true;
  });
});

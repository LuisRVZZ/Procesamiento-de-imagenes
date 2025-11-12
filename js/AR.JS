document.addEventListener('DOMContentLoaded', function() {
  const startButton = document.getElementById('start-camera');
  const stopButton = document.getElementById('stop-camera');
  const video = document.getElementById('ar-video');
  const canvas = document.getElementById('ar-canvas');
  const ctx = canvas.getContext('2d');
  const placeholder = document.getElementById('camera-placeholder');
  const featureButtons = document.querySelectorAll('.feature-btn');
  const startAnimationBtn = featureButtons[0]; // Activar animación
  const stopAnimationBtn = featureButtons[1];  // Detener animación
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  let stream = null;
  let animationFrameId = null;

  // Variables para animación
  let x = 0, y = 0, dx = 3, dy = 2, size = 100, angle = 0;

  function drawAR() {
    if (!video.videoWidth) {
      animationFrameId = requestAnimationFrame(drawAR);
      return;
    }

    // Ajustar canvas al tamaño del video
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar cuadrado animado
    ctx.save();
    ctx.translate(x + size/2, y + size/2);
    ctx.rotate(angle);

    const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255,0,0,1)');
    gradient.addColorStop(1, 'rgba(150,0,0,0.5)');
    ctx.fillStyle = gradient;

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 8;

    ctx.fillRect(-size/2, -size/2, size, size);
    ctx.restore();

    x += dx;
    y += dy;
    if (x + size > canvas.width || x < 0) dx = -dx;
    if (y + size > canvas.height || y < 0) dy = -dy;

    angle += 0.05;
    animationFrameId = requestAnimationFrame(drawAR);
  }

  // Activar cámara
  startButton.addEventListener('click', async function() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      video.srcObject = stream;
      video.style.display = 'block';
      canvas.style.display = 'block';
      placeholder.style.display = 'none';
      
      startButton.disabled = true;
      stopButton.disabled = false;
      featureButtons.forEach(btn => btn.disabled = false);

      console.log('Cámara activada.');
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara. Asegúrate de dar los permisos necesarios.');
    }
  });

  // Botón de iniciar animación
  startAnimationBtn.addEventListener('click', () => {
    if (!animationFrameId) {
      drawAR();
      console.log('Animación AR iniciada.');
    }
  });

  // Botón de detener animación
  stopAnimationBtn.addEventListener('click', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      console.log('Animación AR detenida.');
    }
  });

  // Botón de pantalla completa
 fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement) {
    // Entrar en pantalla completa
    const arView = document.querySelector('.ar-view');
    if (arView.requestFullscreen) {
      arView.requestFullscreen();
    } else if (arView.webkitRequestFullscreen) { // Safari
      arView.webkitRequestFullscreen();
    } else if (arView.msRequestFullscreen) { // IE/Edge
      arView.msRequestFullscreen();
    }
  } else {
    // Salir de pantalla completa
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { // Safari
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
      document.msExitFullscreen();
    }
  }
});


  // Detener cámara y animación
  stopButton.addEventListener('click', function() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.style.display = 'none';
      canvas.style.display = 'none';
      placeholder.style.display = 'block';
      
      startButton.disabled = false;
      stopButton.disabled = true;
      featureButtons.forEach(btn => btn.disabled = true);

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      console.log('Cámara y animación AR detenidas.');
    }
  });
});

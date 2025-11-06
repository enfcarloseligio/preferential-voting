<script>
  document.addEventListener('DOMContentLoaded', () => {
    const boton = document.getElementById('pv-limpiar-opciones');
    if (!boton) return;

    console.log('JS de prueba ejecutado ✅');

    // Alterna opacidad para simular parpadeo
    setInterval(() => {
      boton.style.opacity = boton.style.opacity === '0.4' ? '1' : '0.4';
    }, 500);
  });
</script>

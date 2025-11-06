document.addEventListener('DOMContentLoaded', () => {
  const boton = document.getElementById('pv-limpiar-opciones');
  if (!boton) {
    console.log('No encontré el botón pv-limpiar-opciones 😢');
    return;
  }

  console.log('JS de prueba ejecutado ✅');

  setInterval(() => {
    boton.style.opacity = boton.style.opacity === '0.4' ? '1' : '0.4';
  }, 500);
});

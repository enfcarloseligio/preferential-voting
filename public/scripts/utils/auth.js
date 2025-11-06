// public/scripts/utils/auth.js

const authItems = document.querySelectorAll('.solo-autenticado');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');

// revisar si ya había login guardado
const yaLogueado = localStorage.getItem('pv_auth') === '1';
if (yaLogueado) {
  mostrarOpciones(true);
}

if (btnLogin) {
  btnLogin.addEventListener('click', (e) => {
    e.preventDefault();
    const pass = prompt('Clave de facilitador:');
    // aquí pon la que tú quieras
    if (pass === 'fac2025') {
      localStorage.setItem('pv_auth', '1');
      mostrarOpciones(true);
    } else {
      alert('Clave incorrecta');
    }
  });
}

if (btnLogout) {
  btnLogout.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('pv_auth');
    mostrarOpciones(false);
  });
}

function mostrarOpciones(mostrar) {
  authItems.forEach((el) => {
    if (mostrar) {
      el.classList.add('mostrar');
    } else {
      el.classList.remove('mostrar');
    }
  });
}

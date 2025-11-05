// scripts/encuesta-global.js
// ========================================
// Lógica de la página de encuesta (participantes)
// Página objetivo: pages/global/encuesta.html
// Lee las opciones que definió el facilitador y permite
// que el participante las ordene y envíe.
// Ahora: NO permite guardar si no se llenaron todas las posiciones requeridas.
// ========================================
(function () {
  const KEY_OPCIONES = 'pv_global_opciones';
  const KEY_RESPUESTAS = 'pv_global_respuestas';

  const URL_OPCIONES_JSON = '../../data/opciones-global.json';
  const URL_GUARDAR_RESPUESTA = '../../data/guardar-respuesta.php';

  const contOpciones = document.getElementById('pv-opciones-lista');
  const slots = document.querySelectorAll('.pv-slot');
  const inputNombre = document.getElementById('pv-nombre');
  const btnGuardar = document.getElementById('pv-guardar-voto');

  // guardamos aquí cuántas opciones hay para validar después
  let totalOpcionesDisponibles = 0;

  // cargar opciones (servidor -> localStorage -> fallback 5 vacíos)
  cargarOpciones().then(opciones => {
    totalOpcionesDisponibles = opciones.filter(Boolean).length;
    renderizarOpciones(opciones);
  });

  // click en guardar
  if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
      const nombre = (inputNombre?.value || '').trim();
      const prioridades = leerPrioridades();

      if (!nombre) {
        alert('Por favor escribe tu nombre.');
        return;
      }

      // cuántas posiciones debemos exigir
      // si el facilitador definió 5 o menos, pedimos esas;
      // si definió más, pedimos hasta el número de slots visibles
      const posicionesRequeridas = Math.min(totalOpcionesDisponibles || 0, slots.length);

      if (prioridades.length < posicionesRequeridas) {
        alert('Debes priorizar las ' + posicionesRequeridas + ' opciones antes de guardar.');
        return;
      }

      const registro = {
        nombre,
        prioridades
      };

      // guardar local
      guardarRespuestaLocal(registro);

      // mandar al servidor (si está el PHP)
      fetch(URL_GUARDAR_RESPUESTA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registro)
      }).catch(err => {
        console.warn('No se pudo enviar la respuesta al servidor, pero sí se guardó localmente', err);
      });

      // limpiar UI
      limpiarSlots();
      if (inputNombre) inputNombre.value = '';
      alert('Respuesta guardada.');
    });
  }

  // ========================================
  // Funciones
  // ========================================

  function cargarOpciones() {
    // intentamos primero al servidor
    return fetch(URL_OPCIONES_JSON + '?t=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('sin servidor');
        return res.json();
      })
      .then(lista => {
        // también las guardamos local para que quede espejo
        localStorage.setItem(KEY_OPCIONES, JSON.stringify(lista));
        return lista;
      })
      .catch(() => {
        // si no hay servidor, usamos localStorage
        const local = localStorage.getItem(KEY_OPCIONES);
        if (local) {
          return JSON.parse(local);
        }
        // última opción: 5 vacíos
        return ['', '', '', '', ''];
      });
  }

  function renderizarOpciones(opciones) {
    if (!contOpciones) return;
    contOpciones.innerHTML = '';
    opciones.forEach((opcion) => {
      if (!opcion) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'button pv-chip-opcion';
      btn.textContent = opcion;
      btn.dataset.valor = opcion;
      btn.addEventListener('click', function () {
        colocarEnSiguienteSlot(opcion, btn);
      });
      contOpciones.appendChild(btn);
    });
  }

  function colocarEnSiguienteSlot(valor, boton) {
    // buscar el primer slot vacío
    const slotLibre = Array.from(slots).find(s => !s.textContent.trim());
    if (!slotLibre) {
      alert('Ya llenaste todas las posiciones. Si quieres cambiar una, haz clic sobre ella para liberarla.');
      return;
    }
    slotLibre.textContent = valor;
    slotLibre.classList.add('pv-slot-lleno');

    // desactivar botón para no repetir
    if (boton) {
      boton.disabled = true;
      boton.classList.add('pv-chip-desactivado');
    }

    // permitir limpiar ese slot con clic
    slotLibre.addEventListener('click', function limpiarSlot() {
      const texto = slotLibre.textContent.trim();
      slotLibre.textContent = '';
      slotLibre.classList.remove('pv-slot-lleno');

      // reactivar el botón de esa opción
      reactivarBoton(texto);

      // quitar este listener
      slotLibre.removeEventListener('click', limpiarSlot);
    });
  }

  function reactivarBoton(texto) {
    if (!contOpciones) return;
    const btn = Array.from(contOpciones.querySelectorAll('.pv-chip-opcion'))
      .find(b => b.dataset.valor === texto);
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('pv-chip-desactivado');
    }
  }

  function leerPrioridades() {
    return Array.from(slots)
      .map(s => s.textContent.trim())
      .filter(t => t !== '');
  }

  function limpiarSlots() {
    // limpiar posiciones
    slots.forEach(s => {
      s.textContent = '';
      s.classList.remove('pv-slot-lleno');
    });

    // reactivar todos los botones
    if (contOpciones) {
      contOpciones.querySelectorAll('.pv-chip-opcion').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('pv-chip-desactivado');
      });
    }
  }

  function guardarRespuestaLocal(registro) {
    let actuales = [];
    try {
      const raw = localStorage.getItem(KEY_RESPUESTAS);
      actuales = raw ? JSON.parse(raw) : [];
    } catch (err) {
      actuales = [];
    }
    actuales.push(registro);
    localStorage.setItem(KEY_RESPUESTAS, JSON.stringify(actuales));
  }

})();

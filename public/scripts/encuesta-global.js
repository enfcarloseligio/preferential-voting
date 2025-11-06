// scripts/encuesta-global.js
// ========================================
// Página: pages/global/encuesta.html
// Fuente de verdad: /data/opciones-global.json
// Guardado: /data/guardar-respuesta.php
// localStorage solo como espejo / respaldo
// ========================================
(function () {
  const KEY_OPCIONES = 'pv_global_opciones';
  const KEY_RESPUESTAS = 'pv_global_respuestas';

  // rutas a nuestros JSON / PHP
  const URL_OPCIONES_JSON = '../../data/opciones-global.json';
  const URL_GUARDAR_RESPUESTA = '../../data/guardar-respuesta.php';

  const contOpciones = document.getElementById('pv-opciones-lista');
  const slots = document.querySelectorAll('.pv-slot');
  const inputNombre = document.getElementById('pv-nombre');
  const btnGuardar = document.getElementById('pv-guardar-voto');

  // cuántas debe llenar el participante
  let totalOpcionesDisponibles = 0;

  // 1) leemos SIEMPRE del archivo de /data/
  cargarOpcionesServidor().then(opciones => {
    totalOpcionesDisponibles = opciones.filter(Boolean).length;
    renderizarOpciones(opciones);
    // espejo local por si se cae el server
    guardarOpcionesLocal(opciones);
  }).catch(() => {
    // si por algo no se pudo leer el JSON (ej. estás en live server sin PHP),
    // tratamos de no romper y usamos lo local
    const locales = leerOpcionesLocal();
    totalOpcionesDisponibles = locales.filter(Boolean).length;
    renderizarOpciones(locales);
  });

  // guardar respuesta
  if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
      const nombre = (inputNombre?.value || '').trim();
      const prioridades = leerPrioridades();

      if (!nombre) {
        alert('Por favor escribe tu nombre.');
        return;
      }

      // el participante debe llenar todas las que definió el facilitador,
      // pero no más de las que hay en pantalla (slots)
      const posicionesRequeridas = Math.min(totalOpcionesDisponibles || 0, slots.length);

      if (prioridades.length < posicionesRequeridas) {
        alert('Debes priorizar las ' + posicionesRequeridas + ' opciones antes de guardar.');
        return;
      }

      const registro = { nombre, prioridades };

      // 1) guardamos localmente para verlos en este navegador
      guardarRespuestaLocal(registro);

      // 2) mandamos al servidor para que se agregue a data/respuestas-global.json
      fetch(URL_GUARDAR_RESPUESTA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registro)
      })
        .then(r => r.json())
        .then(json => {
          if (!json.ok) {
            console.warn('El servidor respondió pero no confirmó el guardado.');
          }
        })
        .catch(err => {
          console.warn('No se pudo enviar la respuesta al servidor. Quedó en localStorage.', err);
        });

      // limpiar UI
      limpiarSlots();
      if (inputNombre) inputNombre.value = '';
      alert('Respuesta guardada.');
    });
  }

  // ========================================
  // funciones de carga
  // ========================================
  function cargarOpcionesServidor() {
    // le agregamos ?t= para evitar cache
    return fetch(URL_OPCIONES_JSON + '?t=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('No se pudo leer opciones del servidor');
        return res.json();
      });
  }

  function leerOpcionesLocal() {
    try {
      const raw = localStorage.getItem(KEY_OPCIONES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function guardarOpcionesLocal(lista) {
    localStorage.setItem(KEY_OPCIONES, JSON.stringify(lista));
  }

  // ========================================
  // render de opciones
  // ========================================
  function renderizarOpciones(opciones) {
    if (!contOpciones) return;
    contOpciones.innerHTML = '';

    opciones.forEach(opcion => {
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
    const slotLibre = Array.from(slots).find(s => !s.textContent.trim());
    if (!slotLibre) {
      alert('Ya llenaste todas las posiciones. Haz clic en una posición para liberarla.');
      return;
    }
    slotLibre.textContent = valor;
    slotLibre.classList.add('pv-slot-lleno');

    if (boton) {
      boton.disabled = true;
      boton.classList.add('pv-chip-desactivado');
    }

    // permitir limpiar
    slotLibre.addEventListener('click', function limpiarSlot() {
      const texto = slotLibre.textContent.trim();
      slotLibre.textContent = '';
      slotLibre.classList.remove('pv-slot-lleno');
      reactivarBoton(texto);
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
      .filter(Boolean);
  }

  function limpiarSlots() {
    slots.forEach(s => {
      s.textContent = '';
      s.classList.remove('pv-slot-lleno');
    });
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

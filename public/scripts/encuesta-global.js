// public/scripts/encuesta-global.js
// ========================================
// Página: public/pages/global/encuesta.html
// Lee las opciones definidas por el facilitador
// Envía las respuestas a Netlify (prod) o PHP (local)
// ========================================
(function () {
  const API_BASE = '/.netlify/functions';
  const LOCAL_OPCIONES_JSON = '../../data/opciones-global.json';
  const LOCAL_GUARDAR_RESPUESTA = '../../data/guardar-respuesta.php';

  const contOpciones = document.getElementById('pv-opciones-lista');
  const slots = document.querySelectorAll('.pv-slot');
  const inputNombre = document.getElementById('pv-nombre');
  const btnGuardar = document.getElementById('pv-guardar-voto');

  let opcionesDisponibles = [];

  // init
  cargarOpciones();

  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarRespuesta);
  }

  // ========================================
  // Cargar opciones
  // ========================================
  async function cargarOpciones() {
    let opciones = [];
    // 1. intentar Netlify
    try {
      const res = await fetch(`${API_BASE}/obtener-opciones`);
      if (res.ok) {
        opciones = await res.json();
      }
    } catch (e) {
      // pasamos a local
    }

    // 2. intentar local
    if (!opciones || !opciones.length) {
      try {
        const res = await fetch(LOCAL_OPCIONES_JSON + '?t=' + Date.now());
        if (res.ok) {
          opciones = await res.json();
        }
      } catch (e) {
        console.warn('No se pudieron cargar las opciones ni de Netlify ni de local.');
      }
    }

    opcionesDisponibles = Array.isArray(opciones) ? opciones : [];

    pintarOpciones(opcionesDisponibles);
  }

  function pintarOpciones(lista) {
    if (!contOpciones) return;
    contOpciones.innerHTML = '';

    lista.forEach((texto, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'button pv-chip-opcion';
      btn.textContent = texto;
      btn.dataset.valor = texto;
      btn.addEventListener('click', () => colocarEnSlotDisponible(texto));
      contOpciones.appendChild(btn);
    });
  }

  function colocarEnSlotDisponible(valor) {
    // buscar primer slot vacío
    for (const slot of slots) {
      if (!slot.textContent.trim()) {
        slot.textContent = valor;
        slot.classList.add('pv-slot-ocupado');
        return;
      }
    }
    alert('Ya usaste todas las posiciones.');
  }

  // ========================================
  // Guardar
  // ========================================
  async function guardarRespuesta() {
    const nombre = (inputNombre?.value || '').trim();
    if (!nombre) {
      alert('Escribe tu nombre.');
      return;
    }

    // prioridades según orden de slots
    const prioridades = Array.from(slots)
      .map(s => s.textContent.trim())
      .filter(Boolean);

    // cuántas debo tener?
    const posicionesRequeridas = Math.min(
      opcionesDisponibles.length || 0,
      slots.length
    );

    if (prioridades.length < posicionesRequeridas) {
      alert('Debes priorizar todas las opciones disponibles.');
      return;
    }

    const payload = {
      nombre,
      prioridades
    };

    let guardado = false;

    // 1. intentar Netlify
    try {
      const res = await fetch(`${API_BASE}/guardar-respuesta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        guardado = true;
      }
    } catch (e) {
      // sigue local
    }

    // 2. intentar local (php) si estamos en dev
    if (!guardado) {
      try {
        const res = await fetch(LOCAL_GUARDAR_RESPUESTA, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          guardado = true;
        }
      } catch (e) {
        console.warn('No se pudo guardar en local.', e);
      }
    }

    // 3. espejo en localStorage
    guardarEnLocalStorage(payload);

    if (guardado) {
      alert('Respuesta guardada.');
      limpiarSlots();
    } else {
      alert('No se pudo guardar, pero se dejó una copia local.');
    }
  }

  function guardarEnLocalStorage(payload) {
    try {
      const llave = 'pv-respuestas-global';
      const actuales = JSON.parse(localStorage.getItem(llave) || '[]');
      actuales.push(payload);
      localStorage.setItem(llave, JSON.stringify(actuales));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage.');
    }
  }

  function limpiarSlots() {
    slots.forEach(s => {
      s.textContent = '';
      s.classList.remove('pv-slot-ocupado');
    });
  }
})();

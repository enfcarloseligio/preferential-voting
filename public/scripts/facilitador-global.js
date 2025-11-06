// public/scripts/facilitador-global.js
// ========================================
// Página: public/pages/global/facilitador.html
// Origen de datos (prod): /.netlify/functions/*
// Origen de datos (local): ../../data/*.json y ../../data/*.php
// ========================================
(function () {
  const API_BASE = '/.netlify/functions';
  const LOCAL_OPCIONES_JSON = '../../data/opciones-global.json';
  const LOCAL_RESPUESTAS_JSON = '../../data/respuestas-global.json';
  const LOCAL_GUARDAR_OPCIONES = '../../data/guardar-opciones.php';

  const contLista = document.getElementById('pv-editor-lista');
  const btnGuardar = document.getElementById('pv-guardar-opciones');
  const btnLimpiar = document.getElementById('pv-limpiar-opciones');

  const inputBuscar = document.getElementById('pv-buscar');
  const btnLimpiarBusqueda = document.getElementById('pv-limpiar-busqueda');
  const btnDescargar = document.getElementById('pv-descargar-excel');
  const contTabla = document.getElementById('pv-tabla-resultados');

  // ============================
  // Inicialización
  // ============================
  cargarOpciones();
  cargarRespuestas();

  // botón + dentro del primer bloque
  if (contLista) {
    contLista.addEventListener('click', function (ev) {
      if (ev.target.classList.contains('pv-agregar-opcion')) {
        agregarInputOpcion();
      }
    });
  }

  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarOpciones);
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', limpiarInputs);
  }

  if (btnLimpiarBusqueda) {
    btnLimpiarBusqueda.addEventListener('click', function () {
      if (inputBuscar) {
        inputBuscar.value = '';
      }
      cargarRespuestas();
    });
  }

  if (inputBuscar) {
    inputBuscar.addEventListener('input', function () {
      cargarRespuestas(inputBuscar.value.trim());
    });
  }

  if (btnDescargar) {
    btnDescargar.addEventListener('click', descargarComoCSV);
  }

  // ============================
  // Funciones de carga
  // ============================
  async function cargarOpciones() {
    let opciones = [];
    // 1. intentar Netlify
    try {
      const res = await fetch(`${API_BASE}/obtener-opciones`);
      if (res.ok) {
        opciones = await res.json();
      }
    } catch (e) {
      // ignoramos, probamos local
    }

    // 2. si no hay opciones, intentar local (solo en dev con php -S)
    if (!opciones || !opciones.length) {
      try {
        const res = await fetch(LOCAL_OPCIONES_JSON + '?t=' + Date.now());
        if (res.ok) {
          opciones = await res.json();
        }
      } catch (e) {
        console.warn('No se pudieron cargar opciones ni de Netlify ni de local.');
      }
    }

    // pintar
    if (opciones && opciones.length) {
      pintarOpciones(opciones);
    }
  }

  async function cargarRespuestas(filtroNombre = '') {
    let respuestas = [];
    // 1. intentar Netlify
    try {
      const res = await fetch(`${API_BASE}/obtener-respuestas`);
      if (res.ok) {
        respuestas = await res.json();
      }
    } catch (e) {
      // pasar a local
    }

    // 2. local
    if (!respuestas || !Array.isArray(respuestas) || !respuestas.length) {
      try {
        const res = await fetch(LOCAL_RESPUESTAS_JSON + '?t=' + Date.now());
        if (res.ok) {
          respuestas = await res.json();
        }
      } catch (e) {
        console.warn('No se pudieron cargar respuestas ni de Netlify ni de local.');
      }
    }

    if (filtroNombre) {
      respuestas = respuestas.filter(r =>
        (r.nombre || '').toLowerCase().includes(filtroNombre.toLowerCase())
      );
    }

    pintarTabla(respuestas);
  }

  // ============================
  // Guardar opciones
  // ============================
  async function guardarOpciones() {
    const opciones = leerOpcionesDesdeInputs();
    if (!opciones.length) {
      alert('Agrega al menos una opción.');
      return;
    }

    // 1. intentar Netlify
    let guardado = false;
    try {
      const res = await fetch(`${API_BASE}/guardar-opciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opciones),
      });
      if (res.ok) guardado = true;
    } catch (e) {
      // seguimos con local
    }

    // 2. intentar local (solo si estás corriendo php -S)
    if (!guardado) {
      try {
        const res = await fetch(LOCAL_GUARDAR_OPCIONES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opciones),
        });
        if (res.ok) guardado = true;
      } catch (e) {
        console.warn('No se pudo guardar en local.', e);
      }
    }

    if (guardado) {
      alert('Opciones guardadas.');
      // recargar para tener la versión del servidor
      cargarOpciones();
    } else {
      alert('No se pudieron guardar las opciones.');
    }
  }

  // ============================
  // Utilidades de la UI
  // ============================
  function pintarOpciones(opciones) {
    if (!contLista) return;
    contLista.innerHTML = '';
    opciones.forEach((op, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'pv-editor-item';

      const label = document.createElement('label');
      label.textContent = `Opción ${idx + 1}`;

      const input = document.createElement('input');
      input.type = 'text';
      input.value = op;
      input.placeholder = `Escribe la opción ${idx + 1}`;

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      contLista.appendChild(wrapper);
    });

    // botón + al final
    const btnMas = document.createElement('button');
    btnMas.type = 'button';
    btnMas.className = 'button pv-agregar-opcion';
    btnMas.textContent = '+';
    contLista.appendChild(btnMas);
  }

  function agregarInputOpcion() {
    if (!contLista) return;
    const count = contLista.querySelectorAll('input[type="text"]').length + 1;

    const wrapper = document.createElement('div');
    wrapper.className = 'pv-editor-item';

    const label = document.createElement('label');
    label.textContent = `Opción ${count}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Escribe la opción ${count}`;

    wrapper.appendChild(label);
    wrapper.appendChild(input);

    // insertar antes del botón +
    const btnMas = contLista.querySelector('.pv-agregar-opcion');
    if (btnMas) {
      contLista.insertBefore(wrapper, btnMas);
    } else {
      contLista.appendChild(wrapper);
    }
  }

  function leerOpcionesDesdeInputs() {
    if (!contLista) return [];
    const inputs = contLista.querySelectorAll('input[type="text"]');
    return Array.from(inputs)
      .map(i => i.value.trim())
      .filter(Boolean);
  }

  function limpiarInputs() {
    if (!contLista) return;
    contLista.querySelectorAll('input[type="text"]').forEach(inp => (inp.value = ''));
  }

  function pintarTabla(registros) {
    if (!contTabla) return;
    // si no hay d3, pintamos una tabla simple
    if (typeof d3 === 'undefined') {
      contTabla.innerHTML = '<p>No se pudo cargar d3.js para la tabla.</p>';
      return;
    }

    // limpiar
    contTabla.innerHTML = '';

    const table = d3.select(contTabla).append('table');
    const thead = table.append('thead').append('tr');
    thead.append('th').text('Nombre');

    // determinar el máximo de prioridades
    const maxP = d3.max(registros, r => (r.prioridades ? r.prioridades.length : 0)) || 0;
    for (let i = 1; i <= maxP; i++) {
      thead.append('th').text('P' + i);
    }

    const tbody = table.append('tbody');
    registros.forEach(r => {
      const tr = tbody.append('tr');
      tr.append('td').text(r.nombre || '(sin nombre)');
      if (r.prioridades && r.prioridades.length) {
        r.prioridades.forEach(p => tr.append('td').text(p));
      }
    });
  }

  function descargarComoCSV() {
    // esto lo puedes detallar después
    alert('Descarga de Excel/CSV pendiente de implementar.');
  }
})();

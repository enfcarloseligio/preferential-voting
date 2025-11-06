// public/scripts/facilitador-global.js
(function () {
  const API_BASE = '/.netlify/functions';
  const LOCAL_OPCIONES_JSON = '../../data/opciones-global.json';
  const LOCAL_RESPUESTAS_JSON = '../../data/respuestas-global.json';
  const LOCAL_GUARDAR_OPCIONES = '../../data/guardar-opciones.php';

  const contLista = document.getElementById('pv-editor-lista');
  const btnGuardar = document.getElementById('pv-guardar-opciones');
  const btnLimpiar = document.getElementById('pv-limpiar-opciones');

  const tabla = document.querySelector('#pv-tabla-resultados tbody');
  const inputBuscar = document.getElementById('pv-buscar');
  const btnLimpiarBusqueda = document.getElementById('pv-limpiar-busqueda');
  const btnDescargar = document.getElementById('pv-descargar-excel');

  // 1) pinta algo de arranque, aunque no haya fetch todavía
  pintarOpciones(['']);

  // 2) después intenta cargar de backend
  init();

  async function init() {
    await cargarOpciones();
    await cargarRespuestas();
  }

  // ============================
  // Eventos
  // ============================
  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarOpciones);
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => pintarOpciones(['']));
  }

  if (inputBuscar) {
    inputBuscar.addEventListener('input', () =>
      cargarRespuestas(inputBuscar.value.trim())
    );
  }

  if (btnLimpiarBusqueda) {
    btnLimpiarBusqueda.addEventListener('click', () => {
      inputBuscar.value = '';
      cargarRespuestas();
    });
  }

  if (btnDescargar) {
    btnDescargar.addEventListener('click', descargarComoCSV);
  }

  // ============================
  // Cargar OPCIONES
  // ============================
  async function cargarOpciones() {
    let opciones = [];

    // 1. intentar Netlify
    try {
      const res = await fetch(`${API_BASE}/obtener-opciones?t=${Date.now()}`);
      if (res.ok) {
        opciones = await res.json();
      }
    } catch (e) {
      // si falla seguimos al local
    }

    // 2. intentar local
    if (!opciones || !opciones.length) {
      try {
        const res = await fetch(LOCAL_OPCIONES_JSON + '?t=' + Date.now());
        if (res.ok) {
          opciones = await res.json();
        }
      } catch (e) {
        // nada
      }
    }

    // 3. si sigue vacío, al menos uno
    if (!opciones || !opciones.length) {
      opciones = [''];
    }

    pintarOpciones(opciones);
  }

  // ============================
  // Cargar RESPUESTAS
  // ============================
  async function cargarRespuestas(filtroNombre = '') {
    let respuestas = [];

    // 1. Netlify
    try {
      const res = await fetch(`${API_BASE}/obtener-respuestas?t=${Date.now()}`);
      if (res.ok) {
        respuestas = await res.json();
      }
    } catch (e) {}

    // 2. Local
    if (!respuestas || !respuestas.length) {
      try {
        const res = await fetch(LOCAL_RESPUESTAS_JSON + '?t=' + Date.now());
        if (res.ok) {
          respuestas = await res.json();
        }
      } catch (e) {}
    }

    // filtro
    if (filtroNombre) {
      respuestas = respuestas.filter((r) =>
        (r.nombre || '').toLowerCase().includes(filtroNombre.toLowerCase())
      );
    }

    pintarTabla(respuestas);
  }

  // ============================
  // Guardar OPCIONES
  // ============================
  async function guardarOpciones() {
    const opciones = leerOpcionesDesdeInputs();
    if (!opciones.length) {
      alert('Agrega al menos una opción.');
      return;
    }

    let guardado = false;

    // 1. Netlify
    try {
      const res = await fetch(`${API_BASE}/guardar-opciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opciones }),
      });
      if (res.ok) {
        guardado = true;
      }
    } catch (e) {}

    // 2. local php
    if (!guardado) {
      try {
        const res = await fetch(LOCAL_GUARDAR_OPCIONES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opciones }),
        });
        if (res.ok) {
          guardado = true;
        }
      } catch (e) {}
    }

    if (guardado) {
      alert('Opciones guardadas.');
      cargarOpciones();
    } else {
      alert('No se pudieron guardar las opciones.');
    }
  }

  // ============================
  // Helpers de UI
  // ============================
  function pintarOpciones(opciones) {
    if (!contLista) return;
    contLista.innerHTML = '';

    opciones.forEach((op, idx) => {
      const div = document.createElement('div');
      div.className = 'pv-editor-item';

      const label = document.createElement('label');
      label.textContent = `Opción ${idx + 1}`;

      const input = document.createElement('input');
      input.type = 'text';
      input.value = op || '';
      input.placeholder = `Escribe la opción ${idx + 1}`;

      div.appendChild(label);
      div.appendChild(input);

      // botón + solo en el último
      if (idx === opciones.length - 1) {
        const btnMas = document.createElement('button');
        btnMas.type = 'button';
        btnMas.textContent = '+';
        btnMas.className = 'button pv-agregar-opcion';
        btnMas.addEventListener('click', () => {
          opciones.push('');
          pintarOpciones(opciones);
        });
        div.appendChild(btnMas);
      }

      contLista.appendChild(div);
    });
  }

  function leerOpcionesDesdeInputs() {
    if (!contLista) return [];
    return Array.from(contLista.querySelectorAll('input[type="text"]'))
      .map((i) => i.value.trim())
      .filter((v) => v !== '');
  }

  function pintarTabla(respuestas) {
    if (!tabla) return;
    tabla.innerHTML = '';

    respuestas.forEach((r) => {
      const tr = document.createElement('tr');

      const tdNombre = document.createElement('td');
      tdNombre.textContent = r.nombre || '(sin nombre)';
      tr.appendChild(tdNombre);

      for (let i = 0; i < 5; i++) {
        const td = document.createElement('td');
        td.textContent =
          r.prioridades && r.prioridades[i] ? r.prioridades[i] : '';
        tr.appendChild(td);
      }

      tabla.appendChild(tr);
    });
  }

  function descargarComoCSV() {
    if (!tabla) return;
    const filas = Array.from(tabla.parentElement.querySelectorAll('tr'));
    const lineas = filas.map((tr) => {
      return Array.from(tr.children)
        .map((td) => `"${(td.textContent || '').replace(/"/g, '""')}"`)
        .join(',');
    });
    const blob = new Blob([lineas.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'respuestas-global.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
})();

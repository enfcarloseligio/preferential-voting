// scripts/facilitador-global.js
// ========================================
// Lógica del Facilitador (captura de opciones y vista de resultados)
// Para pages/global/facilitador.html
// Usa localStorage como “data” local del navegador
// ========================================
(function () {
  const KEY_OPCIONES = 'pv_global_opciones';
  const KEY_RESPUESTAS = 'pv_global_respuestas';

  const contenedorEditor = document.getElementById('pv-editor-lista');
  const btnGuardar = document.getElementById('pv-guardar-opciones');
  const btnLimpiar = document.getElementById('pv-limpiar-opciones');

  const tablaResultados = document.getElementById('pv-tabla-resultados');
  const inputBuscar = document.getElementById('pv-buscar');
  const btnLimpiarBusqueda = document.getElementById('pv-limpiar-busqueda');
  const btnDescargarExcel = document.getElementById('pv-descargar-excel');

  // ----------------------------------------
  // Inicializar editor con mínimo 5 campos
  // ----------------------------------------
  const opcionesGuardadas = cargarOpciones();
  renderizarInputs(opcionesGuardadas.length ? opcionesGuardadas : ['', '', '', '', '']);

  // ----------------------------------------
  // Eventos
  // ----------------------------------------
  if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
      const valores = leerInputs()
        .map(v => v.trim())
        .filter(v => v !== '');
      guardarOpciones(valores);
      renderizarTabla(cargarRespuestas());
    });
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', function () {
      renderizarInputs(['', '', '', '', '']);
      // Si después de esto da guardar, se borran de la “base” porque guarda arreglo vacío
    });
  }

  if (inputBuscar && btnLimpiarBusqueda) {
    btnLimpiarBusqueda.addEventListener('click', function () {
      inputBuscar.value = '';
      renderizarTabla(cargarRespuestas());
    });

    inputBuscar.addEventListener('input', function () {
      const todas = cargarRespuestas();
      const q = inputBuscar.value.toLowerCase();
      const filtradas = todas.filter(r => (r.nombre || '').toLowerCase().includes(q));
      renderizarTabla(filtradas);
    });
  }

  if (btnDescargarExcel) {
    btnDescargarExcel.addEventListener('click', function () {
      const datos = cargarRespuestas();
      exportarCSV(datos);
    });
  }

  // Pintar tabla al inicio
  renderizarTabla(cargarRespuestas());

  // ========================================
  // Funciones de opciones
  // ========================================
  function cargarOpciones() {
    try {
      const raw = localStorage.getItem(KEY_OPCIONES);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('No se pudieron cargar las opciones', err);
      return [];
    }
  }

  function guardarOpciones(lista) {
    localStorage.setItem(KEY_OPCIONES, JSON.stringify(lista));
  }

  function renderizarInputs(valores) {
    if (!contenedorEditor) return;
    contenedorEditor.innerHTML = '';

    valores.forEach(function (valor, idx) {
      const label = document.createElement('label');
      label.textContent = 'Opción ' + (idx + 1);

      const input = document.createElement('input');
      input.type = 'text';
      input.value = valor;
      input.placeholder = 'Escribe la opción ' + (idx + 1);
      input.classList.add('pv-input-opcion');

      contenedorEditor.appendChild(label);
      contenedorEditor.appendChild(input);
    });

    // Botón +
    const btnMas = document.createElement('button');
    btnMas.type = 'button';
    btnMas.textContent = '+';
    btnMas.className = 'button pv-agregar-opcion';
    btnMas.addEventListener('click', function () {
      const current = leerInputs();
      current.push('');
      renderizarInputs(current);
    });
    contenedorEditor.appendChild(btnMas);
  }

  function leerInputs() {
    if (!contenedorEditor) return [];
    return Array.from(contenedorEditor.querySelectorAll('.pv-input-opcion')).map(inp => inp.value);
  }

  // ========================================
  // Funciones de tabla (usa d3 si está disponible)
  // Estructura de respuesta esperada:
  // [{ nombre: 'Ana', prioridades: ['Opción 3','Opción 1', ...] }]
  // ========================================
  function cargarRespuestas() {
    try {
      const raw = localStorage.getItem(KEY_RESPUESTAS);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('No se pudieron cargar las respuestas', err);
      return [];
    }
  }

  function renderizarTabla(respuestas) {
    if (!tablaResultados) return;

    tablaResultados.innerHTML = '';

    if (typeof d3 === 'undefined') {
      tablaResultados.textContent = 'No se pudo cargar d3.js';
      return;
    }

    const maxPos = d3.max(respuestas, d => (d.prioridades ? d.prioridades.length : 0)) || 0;

    const table = d3.select(tablaResultados)
      .append('table')
      .attr('class', 'pv-tabla');

    const thead = table.append('thead');
    const tbody = table.append('tbody');

    const headers = ['Nombre'];
    for (let i = 1; i <= maxPos; i++) headers.push('P ' + i);

    thead.append('tr')
      .selectAll('th')
      .data(headers)
      .enter()
      .append('th')
      .text(d => d);

    const rows = tbody.selectAll('tr')
      .data(respuestas)
      .enter()
      .append('tr');

    rows.append('td').text(d => d.nombre || '');

    for (let i = 0; i < maxPos; i++) {
      rows.append('td').text(d => (d.prioridades && d.prioridades[i]) ? d.prioridades[i] : '');
    }

    if (!respuestas.length) {
      const tr = tbody.append('tr');
      tr.append('td')
        .attr('colspan', headers.length)
        .text('Aún no hay respuestas capturadas.');
    }
  }

  // ========================================
  // Exportar CSV rápido
  // ========================================
  function exportarCSV(respuestas) {
    if (!respuestas || !respuestas.length) return;

    const maxPos = d3.max(respuestas, d => (d.prioridades ? d.prioridades.length : 0)) || 0;
    const encabezados = ['nombre'];
    for (let i = 1; i <= maxPos; i++) encabezados.push('p' + i);

    const filas = respuestas.map(r => {
      const base = { nombre: r.nombre || '' };
      for (let i = 0; i < maxPos; i++) {
        base['p' + (i + 1)] = (r.prioridades && r.prioridades[i]) ? r.prioridades[i] : '';
      }
      return encabezados.map(h => base[h] || '');
    });

    let csv = encabezados.join(',') + '\n';
    filas.forEach(f => {
      csv += f.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resultados-consenso.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

})();

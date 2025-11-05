// scripts/facilitador-global.js
// ========================================
// Lógica del Facilitador (captura de opciones y vista de resultados)
// Página objetivo: pages/global/facilitador.html
// Guarda en 3 niveles:
// 1) localStorage (siempre)
// 2) intenta leer/escribir en JSON del servidor (data/*.json vía PHP)
// 3) si el servidor no responde, trabaja solo con localStorage
// ========================================
(function () {
  // claves locales
  const KEY_OPCIONES = 'pv_global_opciones';
  const KEY_RESPUESTAS = 'pv_global_respuestas';

  // rutas remotas (desde pages/global/... el ../../ ya nos deja en raíz del proyecto)
  const URL_OPCIONES_JSON = '../../data/opciones-global.json';
  const URL_RESPUESTAS_JSON = '../../data/respuestas-global.json';
  const URL_GUARDAR_OPCIONES = '../../data/guardar-opciones.php';

  const contenedorEditor = document.getElementById('pv-editor-lista');
  const btnGuardar = document.getElementById('pv-guardar-opciones');
  const btnLimpiar = document.getElementById('pv-limpiar-opciones');

  const tablaResultados = document.getElementById('pv-tabla-resultados');
  const inputBuscar = document.getElementById('pv-buscar');
  const btnLimpiarBusqueda = document.getElementById('pv-limpiar-busqueda');
  const btnDescargarExcel = document.getElementById('pv-descargar-excel');

  // Vamos a cargar primero las opciones del servidor; si falla, usamos localStorage.
  Promise.all([
    cargarOpcionesServidor(),
    cargarRespuestasServidor()
  ]).then(([opcionesSrv, respuestasSrv]) => {
    const opcionesIniciales = opcionesSrv && opcionesSrv.length
      ? opcionesSrv
      : (cargarOpcionesLocal().length ? cargarOpcionesLocal() : ['', '', '', '', '']);

    renderizarInputs(opcionesIniciales);

    // guardamos también localmente lo que venga del servidor para que quede sincronizado
    guardarOpcionesLocal(opcionesIniciales);

    // pintar tabla con lo que haya
    renderizarTabla(respuestasSrv.length ? respuestasSrv : cargarRespuestasLocal());
  }).catch(() => {
    // si algo falla, modo solo local
    const opcionesIniciales = cargarOpcionesLocal().length ? cargarOpcionesLocal() : ['', '', '', '', ''];
    renderizarInputs(opcionesIniciales);
    renderizarTabla(cargarRespuestasLocal());
  });

  // ----------------------------------------
  // Eventos
  // ----------------------------------------
  if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
      const valores = leerInputs()
        .map(v => v.trim())
        .filter(v => v !== '');

      // guardar local
      guardarOpcionesLocal(valores);

      // intentar guardar en servidor
      guardarOpcionesServidor(valores);

      // refrescar tabla por si algo depende de las opciones
      renderizarTabla(cargarRespuestasLocal());
    });
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', function () {
      // solo limpiamos la vista; si después da guardar, sí se limpia en local/servidor
      renderizarInputs(['', '', '', '', '']);
    });
  }

  if (inputBuscar && btnLimpiarBusqueda) {
    btnLimpiarBusqueda.addEventListener('click', function () {
      inputBuscar.value = '';
      // preferimos lo remoto si está
      cargarRespuestasServidor()
        .then(renderizarTabla)
        .catch(() => renderizarTabla(cargarRespuestasLocal()));
    });

    inputBuscar.addEventListener('input', function () {
      const query = inputBuscar.value.toLowerCase();
      // filtramos sobre lo que tengamos local
      const base = cargarRespuestasLocal();
      const filtradas = base.filter(r => (r.nombre || '').toLowerCase().includes(query));
      renderizarTabla(filtradas);
    });
  }

  if (btnDescargarExcel) {
    btnDescargarExcel.addEventListener('click', function () {
      // tomamos lo que haya en local (puede que aún no se haya sincronizado)
      const datos = cargarRespuestasLocal();
      exportarCSV(datos);
    });
  }

  // ========================================
  // Carga/guardado de OPCIONES
  // ========================================
  function cargarOpcionesLocal() {
    try {
      const raw = localStorage.getItem(KEY_OPCIONES);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('No se pudieron cargar las opciones locales', err);
      return [];
    }
  }

  function guardarOpcionesLocal(lista) {
    localStorage.setItem(KEY_OPCIONES, JSON.stringify(lista));
  }

  function cargarOpcionesServidor() {
    return fetch(URL_OPCIONES_JSON + '?t=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('No se pudo leer opciones del servidor');
        return res.json();
      })
      .catch(err => {
        console.warn('Fallo al leer opciones del servidor, se usará localStorage', err);
        return [];
      });
  }

  function guardarOpcionesServidor(lista) {
    // requiere que exista data/guardar-opciones.php del lado del servidor
    fetch(URL_GUARDAR_OPCIONES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lista)
    })
      .then(res => res.json())
      .then(json => {
        if (!json.ok) {
          console.warn('El servidor respondió pero no confirmó el guardado de opciones');
        }
      })
      .catch(err => {
        console.warn('No se pudieron guardar las opciones en el servidor', err);
      });
  }

  // ========================================
  // Carga de RESPUESTAS
  // (aquí solo leemos; escribirán la encuesta y el PHP)
  // ========================================
  function cargarRespuestasLocal() {
    try {
      const raw = localStorage.getItem(KEY_RESPUESTAS);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('No se pudieron cargar las respuestas locales', err);
      return [];
    }
  }

  function cargarRespuestasServidor() {
    return fetch(URL_RESPUESTAS_JSON + '?t=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('No se pudo leer respuestas del servidor');
        return res.json();
      })
      .then(lista => {
        // las copiamos a local para tener espejo
        localStorage.setItem(KEY_RESPUESTAS, JSON.stringify(lista));
        return lista;
      })
      .catch(err => {
        console.warn('Fallo al leer respuestas del servidor, se usará localStorage', err);
        return [];
      });
  }

  // ========================================
  // Render de inputs (parte superior)
  // ========================================
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

    // botón +
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
  // Render de tabla de resultados (usa d3 si está disponible)
  // Estructura esperada:
  // [{ nombre: 'Ana', prioridades: ['Opción 3','Opción 1', ...], ts: '2025-11-05T...' }]
  // ========================================
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

    const maxPos = respuestas.reduce((max, r) => {
      const len = r.prioridades ? r.prioridades.length : 0;
      return len > max ? len : max;
    }, 0);

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

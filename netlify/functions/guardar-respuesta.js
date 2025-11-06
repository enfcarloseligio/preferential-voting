// netlify/functions/guardar-respuesta.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const store = getStore('preferential-voting');

    let nueva = {};
    if (event.body) {
      try {
        nueva = JSON.parse(event.body);
      } catch (e) {
        nueva = {};
      }
    }

    // leemos lo que ya hay
    const actuales = (await store.getJSON('respuestas-global.json')) || [];

    // metemos la nueva al final
    actuales.push({
      nombre: nueva.nombre || '(sin nombre)',
      prioridades: Array.isArray(nueva.prioridades) ? nueva.prioridades : [],
      ts: Date.now(),
    });

    // guardamos
    await store.setJSON('respuestas-global.json', actuales);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Error al guardar respuesta:', err);
    return {
      statusCode: 500,
      body: 'Error al guardar respuesta',
    };
  }
};

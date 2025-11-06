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
    const body = JSON.parse(event.body || '{}'); // { nombre, prioridades: [...] }

    const store = getStore('preferential-voting');

    // leemos lo que ya hay
    const existentes = (await store.getJSON('respuestas-global.json')) || [];

    // metemos la nueva al final
    existentes.push({
      nombre: body.nombre || 'Sin nombre',
      prioridades: Array.isArray(body.prioridades) ? body.prioridades : [],
      ts: Date.now(),
    });

    // guardamos todo
    await store.setJSON('respuestas-global.json', existentes);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Error al guardar respuesta:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Error al guardar respuesta' }),
    };
  }
};

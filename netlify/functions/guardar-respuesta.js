// netlify/functions/guardar-respuesta.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { nombre, prioridades } = body;

    const store = getStore('preferential-voting');
    const data = (await store.getJSON('respuestas-global.json')) || {};
    const respuestas = Array.isArray(data.respuestas) ? data.respuestas : [];

    respuestas.push({
      nombre: nombre || '(sin nombre)',
      prioridades: Array.isArray(prioridades) ? prioridades : []
    });

    await store.setJSON('respuestas-global.json', { respuestas });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error('Error al guardar respuesta:', err);
    return {
      statusCode: 500,
      body: 'Error al guardar respuesta'
    };
  }
};

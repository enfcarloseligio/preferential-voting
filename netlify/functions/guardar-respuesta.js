// netlify/functions/guardar-respuesta.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  try {
    const payload = JSON.parse(event.body || '{}');

    if (!payload.nombre || !Array.isArray(payload.prioridades)) {
      return { statusCode: 400, body: 'Faltan campos' };
    }

    const store = getStore('preferential-voting');
    const actuales = (await store.getJSON('respuestas-global.json')) || [];

    payload.ts = new Date().toISOString();
    actuales.push(payload);

    await store.setJSON('respuestas-global.json', actuales);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error('Error al guardar respuesta:', err);
    return { statusCode: 500, body: 'Error al guardar respuesta' };
  }
};

// netlify/functions/guardar-opciones.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  // solo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    // el frontend ya manda { opciones: [...] }
    const opciones = Array.isArray(body.opciones) ? body.opciones : [];

    const store = getStore('preferential-voting');
    await store.setJSON('opciones-global.json', opciones);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Error al guardar opciones:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Error al guardar opciones' }),
    };
  }
};

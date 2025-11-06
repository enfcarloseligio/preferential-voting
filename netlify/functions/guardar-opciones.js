// netlify/functions/guardar-opciones.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  try {
    const opciones = JSON.parse(event.body || '[]');

    if (!Array.isArray(opciones)) {
      return { statusCode: 400, body: 'Se esperaba un arreglo de opciones' };
    }

    const store = getStore('preferential-voting');
    await store.setJSON('opciones-global.json', opciones);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error('Error al guardar opciones:', err);
    return { statusCode: 500, body: 'Error interno al guardar opciones' };
  }
};

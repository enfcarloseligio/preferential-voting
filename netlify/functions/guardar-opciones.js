// netlify/functions/guardar-opciones.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  // 👉 si no es POST, 405 (esto es lo que ves en el navegador)
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    // tu front manda { opciones: [...] }
    const opciones = Array.isArray(body.opciones) ? body.opciones : [];

    const store = getStore('preferential-voting');

    // guardamos SIEMPRE como { opciones: [...] }
    await store.setJSON('opciones-global.json', { opciones });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error('Error al guardar opciones:', err);
    return {
      statusCode: 500,
      body: 'Error al guardar opciones'
    };
  }
};

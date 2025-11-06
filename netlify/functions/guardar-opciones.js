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
    const store = getStore('preferential-voting');

    // el front te está mandando un array de strings
    let data = [];
    if (event.body) {
      try {
        data = JSON.parse(event.body);
      } catch (e) {
        data = [];
      }
    }

    // normalizamos: si viene objeto, lo convertimos a array
    if (!Array.isArray(data)) {
      data = [];
    }

    // guardamos
    await store.setJSON('opciones-global.json', data);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Error al guardar opciones:', err);
    return {
      statusCode: 500,
      body: 'Error al guardar opciones',
    };
  }
};

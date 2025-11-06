// netlify/functions/obtener-opciones.js
const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  try {
    const store = getStore('preferential-voting');
    const opciones = (await store.getJSON('opciones-global.json')) || [];

    return {
      statusCode: 200,
      headers: {
        // que Netlify/edge no lo deje cacheado
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
      body: JSON.stringify(opciones),
    };
  } catch (err) {
    console.error('Error al leer opciones:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      },
      body: 'Error al leer opciones',
    };
  }
};

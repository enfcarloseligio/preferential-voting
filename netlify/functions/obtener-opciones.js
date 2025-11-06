// netlify/functions/obtener-opciones.js
const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  try {
    const store = getStore('preferential-voting');
    // guardamos siempre en la misma clave
    const data = (await store.getJSON('opciones-global.json')) || {};
    const opciones = Array.isArray(data.opciones) ? data.opciones : [];

    return {
      statusCode: 200,
      body: JSON.stringify(opciones),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (err) {
    console.error('Error al leer opciones:', err);
    return {
      statusCode: 500,
      body: 'Error al leer opciones'
    };
  }
};

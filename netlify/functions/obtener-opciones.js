// netlify/functions/obtener-opciones.js
const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  try {
    const store = getStore('preferential-voting');
    const opciones = (await store.getJSON('opciones-global.json')) || [];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opciones),
    };
  } catch (err) {
    console.error('Error al leer opciones:', err);
    return {
      statusCode: 500,
      body: 'Error al leer opciones',
    };
  }
};

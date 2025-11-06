// netlify/functions/obtener-respuestas.js
const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  try {
    const store = getStore('preferential-voting');
    const respuestas = (await store.getJSON('respuestas-global.json')) || [];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(respuestas),
    };
  } catch (err) {
    console.error('Error al leer respuestas:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Error al leer respuestas' }),
    };
  }
};

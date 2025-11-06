// netlify/functions/obtener-respuestas.js
const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  try {
    const store = getStore('preferential-voting');
    const data = (await store.getJSON('respuestas-global.json')) || {};
    const respuestas = Array.isArray(data.respuestas) ? data.respuestas : [];

    return {
      statusCode: 200,
      body: JSON.stringify(respuestas),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (err) {
    console.error('Error al leer respuestas:', err);
    return {
      statusCode: 500,
      body: 'Error al leer respuestas'
    };
  }
};

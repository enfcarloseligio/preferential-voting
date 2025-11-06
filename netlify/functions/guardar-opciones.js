// netlify/functions/guardar-opciones.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: 'OK',
    };
  }

  // Solo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: 'Method Not Allowed',
    };
  }

  try {
    const store = getStore('preferential-voting');
    const body = JSON.parse(event.body || '{}');
    const opciones = Array.isArray(body.opciones) ? body.opciones : [];

    await store.setJSON('opciones-global.json', opciones);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ ok: true, message: 'Opciones guardadas.' }),
    };
  } catch (err) {
    console.error('Error al guardar opciones:', err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ ok: false, message: err.message }),
    };
  }
};

// netlify/functions/guardar-opciones.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const siteID = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN;

    const store = getStore('preferential-voting', {
      siteID,
      token,
    });

    const body = JSON.parse(event.body || '{}');
    // el front nos manda { opciones: [...] }
    const opciones = Array.isArray(body.opciones) ? body.opciones : [];

    await store.setJSON('opciones-global.json', opciones);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (err) {
    console.error('Error al guardar opciones:', err);
    return {
      statusCode: 500,
      body: 'Error al guardar opciones',
    };
  }
};

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
    const token = process.env.NETLIFY_AUTH_TOKEN;

    const store = getStore(
      {
        name: 'preferential-voting',
        siteID,
        token,
      },
      'preferential-voting'
    );

    const body = JSON.parse(event.body || '{}');
    const opciones = Array.isArray(body.opciones) ? body.opciones : [];

    await store.setJSON('opciones-global.json', opciones);

    return {
      statusCode: 200,
      body: 'ok',
    };
  } catch (err) {
    console.error('Error al guardar opciones:', err);
    return {
      statusCode: 500,
      body: 'Error al guardar opciones',
    };
  }
};

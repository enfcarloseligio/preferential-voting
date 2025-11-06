// netlify/functions/obtener-opciones.js
const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
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

    const opciones = (await store.getJSON('opciones-global.json')) || [];

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
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

// netlify/functions/obtener-opciones.js
const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  try {
    const siteID = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN;

    // forzamos las credenciales
    const store = getStore('preferential-voting', {
      siteID,
      token,
    });

    const opciones = (await store.getJSON('opciones-global.json')) || [];

    return {
      statusCode: 200,
      body: JSON.stringify(opciones),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (err) {
    console.error('Error al leer opciones:', err);
    return {
      statusCode: 500,
      body: 'Error al leer opciones',
    };
  }
};

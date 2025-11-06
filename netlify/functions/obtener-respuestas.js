// netlify/functions/obtener-respuestas.js
const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  try {
    const siteID = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN;

    const store = getStore('preferential-voting', {
      siteID,
      token,
    });

    const respuestas =
      (await store.getJSON('respuestas-global.json')) || [];

    return {
      statusCode: 200,
      body: JSON.stringify(respuestas),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (err) {
    console.error('Error al leer respuestas:', err);
    return {
      statusCode: 500,
      body: 'Error al leer respuestas',
    };
  }
};

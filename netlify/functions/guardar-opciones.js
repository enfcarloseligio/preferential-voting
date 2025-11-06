// netlify/functions/guardar-opciones.js
const { getStore } = require('@netlify/blobs');

function makeStore() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  const name = 'preferential-voting';
  return getStore({ name, siteID, token });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    // en el front ya mandamos { opciones: [...] }
    const opciones = Array.isArray(body.opciones) ? body.opciones : [];

    const store = makeStore();
    await store.setJSON('opciones-global.json', opciones);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Error al guardar opciones:', err);
    return {
      statusCode: 500,
      body: 'Error al guardar opciones',
    };
  }
};

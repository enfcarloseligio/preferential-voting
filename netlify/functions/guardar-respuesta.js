// netlify/functions/guardar-respuesta.js
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
    const nueva = JSON.parse(event.body || '{}');

    const store = makeStore();
    const actuales = (await store.getJSON('respuestas-global.json')) || [];
    actuales.push(nueva);

    await store.setJSON('respuestas-global.json', actuales);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Error al guardar respuesta:', err);
    return {
      statusCode: 500,
      body: 'Error al guardar respuesta',
    };
  }
};

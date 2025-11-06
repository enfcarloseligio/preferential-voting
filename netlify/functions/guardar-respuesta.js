const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const siteID = process.env.NETLIFY_SITE_ID;
  const token =
    process.env.NETLIFY_BLOBS_TOKEN ||
    process.env.NETLIFY_AUTH_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    '';

  try {
    const nueva = JSON.parse(event.body || '{}');

    let store;
    if (siteID && token) {
      store = getStore('preferential-voting', { siteID, token });
    } else {
      store = getStore('preferential-voting');
    }

    const actuales =
      (await store.getJSON('respuestas-global.json')) || [];

    actuales.push({
      ...nueva,
      fecha: new Date().toISOString(),
    });

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

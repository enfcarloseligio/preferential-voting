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
    const body = JSON.parse(event.body || '{}');
    const opciones = Array.isArray(body.opciones) ? body.opciones : [];

    let store;
    if (siteID && token) {
      store = getStore('preferential-voting', { siteID, token });
    } else {
      store = getStore('preferential-voting');
    }

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

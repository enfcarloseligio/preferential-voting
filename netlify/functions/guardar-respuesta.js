const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
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

    const todas = (await store.getJSON('respuestas-global.json')) || [];
    todas.push(body);

    await store.setJSON('respuestas-global.json', todas);

    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('Error al guardar respuesta:', err);
    return { statusCode: 500, body: 'Error al guardar respuesta' };
  }
};

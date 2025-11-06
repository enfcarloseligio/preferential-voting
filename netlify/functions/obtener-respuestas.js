const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token =
    process.env.NETLIFY_BLOBS_TOKEN ||
    process.env.NETLIFY_AUTH_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    '';

  try {
    let store;
    if (siteID && token) {
      store = getStore('preferential-voting', { siteID, token });
    } else {
      store = getStore('preferential-voting');
    }

    const respuestas =
      (await store.getJSON('respuestas-global.json')) || [];

    return {
      statusCode: 200,
      body: JSON.stringify(respuestas),
    };
  } catch (err) {
    console.error('Error al leer respuestas:', err);
    return {
      statusCode: 500,
      body: 'Error al leer respuestas',
    };
  }
};

const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  // orden de búsqueda de token: BLOBS → AUTH → API
  const siteID = process.env.NETLIFY_SITE_ID;
  const token =
    process.env.NETLIFY_BLOBS_TOKEN ||
    process.env.NETLIFY_AUTH_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    '';

  try {
    let store;
    if (siteID && token) {
      // modo “forzado”, con las credenciales
      store = getStore('preferential-voting', { siteID, token });
    } else {
      // modo que ya te funcionaba antes
      store = getStore('preferential-voting');
    }

    const opciones = (await store.getJSON('opciones-global.json')) || [];
    return {
      statusCode: 200,
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

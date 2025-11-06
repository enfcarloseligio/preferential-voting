// netlify/functions/obtener-respuestas.js
const { getStore } = require('@netlify/blobs');

function makeStore() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  const name = 'preferential-voting';
  return getStore({ name, siteID, token });
}

exports.handler = async () => {
  try {
    const store = makeStore();
    const data = (await store.getJSON('respuestas-global.json')) || [];
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('Error al leer respuestas:', err);
    return {
      statusCode: 500,
      body: 'Error al leer respuestas',
    };
  }
};

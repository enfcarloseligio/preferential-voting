// netlify/functions/obtener-opciones.js
const { getStore } = require('@netlify/blobs');

function makeStore() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;

  // nombre del store tal como lo tienes en el dashboard
  const name = 'preferential-voting';

  // si no hay vars, igual creamos algo que no truene feo
  return getStore({ name, siteID, token });
}

exports.handler = async () => {
  try {
    const store = makeStore();
    const data = (await store.getJSON('opciones-global.json')) || [];
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('Error al leer opciones:', err);
    return {
      statusCode: 500,
      body: 'Error al leer opciones',
    };
  }
};

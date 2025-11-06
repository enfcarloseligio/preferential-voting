// netlify/functions/guardar-respuesta.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const siteID = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN;

    const store = getStore('preferential-voting', {
      siteID,
      token,
    });

    const body = JSON.parse(event.body || '{}');
    const nombre = body.nombre || '';
    const prioridades = Array.isArray(body.prioridades)
      ? body.prioridades
      : [];

    // leemos lo que ya haya
    const actuales =
      (await store.getJSON('respuestas-global.json')) || [];

    // agregamos la nueva
    actuales.push({
      nombre,
      prioridades,
      fecha: new Date().toISOString(),
    });

    // guardamos
    await store.setJSON('respuestas-global.json', actuales);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (err) {
    console.error('Error al guardar respuesta:', err);
    return {
      statusCode: 500,
      body: 'Error al guardar respuesta',
    };
  }
};

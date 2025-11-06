// netlify/functions/guardar-respuesta.js
import { getStore } from '@netlify/blobs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  try {
    const payload = JSON.parse(event.body);

    if (!payload || !payload.nombre || !Array.isArray(payload.prioridades)) {
      return { statusCode: 400, body: 'Faltan campos' };
    }

    const store = getStore('preferential-voting');

    // leemos las que ya existen
    const actuales = (await store.getJSON('respuestas-global.json')) || [];

    // agregamos timestamp igual que en PHP
    payload.ts = new Date().toISOString();
    actuales.push(payload);

    // guardamos de nuevo
    await store.setJSON('respuestas-global.json', actuales);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error('Error al guardar respuesta:', err);
    return { statusCode: 500, body: 'Error al guardar respuesta' };
  }
}

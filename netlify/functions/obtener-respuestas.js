// netlify/functions/obtener-respuestas.js
import { getStore } from '@netlify/blobs';

export async function handler() {
  try {
    const store = getStore('preferential-voting');
    const respuestas = (await store.getJSON('respuestas-global.json')) || [];
    return {
      statusCode: 200,
      body: JSON.stringify(respuestas)
    };
  } catch (err) {
    console.error('Error al leer respuestas:', err);
    return { statusCode: 500, body: 'Error al leer respuestas' };
  }
}

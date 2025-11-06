// netlify/functions/obtener-opciones.js
import { getStore } from '@netlify/blobs';

export async function handler() {
  try {
    const store = getStore('preferential-voting');
    const opciones = (await store.getJSON('opciones-global.json')) || [];
    return {
      statusCode: 200,
      body: JSON.stringify(opciones)
    };
  } catch (err) {
    console.error('Error al leer opciones:', err);
    return { statusCode: 500, body: 'Error al leer opciones' };
  }
}

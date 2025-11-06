// netlify/functions/obtener-opciones.js
import { getStore } from '@netlify/blobs';

export default async (request, context) => {
  try {
    // el nombre lo eliges tú; debe ser el mismo que uses en guardar
    const store = getStore({ name: 'preferential-voting' });

    // si no existe, get() con { type: 'json' } devuelve null
    const opciones = await store.get('opciones-global.json', { type: 'json' });

    return new Response(JSON.stringify(opciones ?? []), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    // mientras depuramos, mandamos el error completo
    return new Response(
      JSON.stringify({
        message: 'Error al leer opciones',
        error: err.message,
        stack: err.stack
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    );
  }
};

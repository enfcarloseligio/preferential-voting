// netlify/functions/guardar-opciones.js
import { getStore } from '@netlify/blobs';

export default async (request, context) => {
  try {
    if (request.method !== 'POST') {
      return new Response('Método no permitido', { status: 405 });
    }

    const body = await request.json();
    // esperamos algo como { opciones: [...] }
    const { opciones = [] } = body;

    const store = getStore({ name: 'preferential-voting' });

    // guardamos como JSON
    await store.setJSON('opciones-global.json', opciones);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: 'Error al guardar opciones',
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

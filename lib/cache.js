/**
 * Caché en memoria del proceso (Hobby / serverless).
 * TTL diario: 24 h. El botón Refrescar pide refresh=1 y la invalida.
 *
 * En Vercel cada instancia tiene su propia memoria; por eso también
 * se envían cabeceras Cache-Control para el edge/CDN.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

let store = {
  payload: null,
  expiresAt: 0,
  generatedAt: null,
};

export function leerCache() {
  if (!store.payload) return null;
  if (Date.now() > store.expiresAt) {
    store = { payload: null, expiresAt: 0, generatedAt: null };
    return null;
  }
  return store;
}

export function guardarCache(payload) {
  store = {
    payload,
    expiresAt: Date.now() + DAY_MS,
    generatedAt: new Date().toISOString(),
  };
  return store;
}

export function invalidarCache() {
  store = { payload: null, expiresAt: 0, generatedAt: null };
}

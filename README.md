# Promociones y Descuentos (Promos MX)

PWA Next.js con ofertas **solo vigentes**, pestañas, búsqueda, fichas completas y botón **Refrescar** que vuelve a consultar fuentes y filtra lo caducado.

## Qué hay en pantalla

- Pestañas de categoría
- Búsqueda
- Botón Refrescar (invalida caché de 24 h y pide de nuevo las APIs)
- Fichas: % descuento, vigencia, MSI (meses sin intereses), banco o bancos, cupón, código, categoría, fecha/hora
- Layout a pantalla completa según el dispositivo (no queda encajonado a 480 px)

## Datos y APIs

- Catálogo local MX (`lib/ofertas-locales.js`)
- APIs públicas **sin key ni registro** (se mantienen; no hay keys que quitar):
  - CheapShark `https://www.cheapshark.com/api/1.0/deals`
  - DummyJSON `https://dummyjson.com/products`
  - FakeStoreAPI `https://fakestoreapi.com/products` — repo [keikaavousi/fake-store-api](https://github.com/keikaavousi/fake-store-api)
  - Frankfurter `https://api.frankfurter.app/latest` (USD→MXN)
- Si una fuente falla, las demás siguen. No se inventan cupones, bancos ni MSI.

## Caché

- Memoria del servidor: 24 horas
- `Cache-Control` en `/api/ofertas`
- Service Worker: red primero en `/api/*`, shell offline para la UI
- Refrescar manda `?refresh=1` y borra el caché del proceso

## Índices

Con decenas o cientos de fichas **no conviene** montar Postgres/SQLite solo para un B-tree: el costo y las credenciales no se justifican en Hobby.

Se construyen índices en memoria (`lib/indexes.js`) por `id`, `categoria`, `tienda` y `activa`. Si el catálogo crece a decenas de miles de filas o hay escrituras concurrentes, ahí sí pasa a SQL con índices en `(categoria)`, `(vigencia_fin)` y `(tienda)`.

## Privacidad y seguridad

- `/privacidad` y `/terminos`
- Sin cuentas, sin cookies de tracking
- Cabeceras: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`
- Rate limit simple en `/api/ofertas`
- Timeouts en fetch externos
- `.env*` fuera de git; esta versión no necesita secretos

## Subir a Vercel

1. Descomprime este zip. La **raíz** del proyecto es la carpeta que contiene `package.json`.
2. [vercel.com/new](https://vercel.com/new) → Importa el repo privado `promocionesydescuentos` **o** arrastra la carpeta.
3. Framework: Next.js (se detecta). Root Directory: `.`
4. Deploy. No hace falta ninguna Environment Variable.

Instalar en el teléfono: menú del navegador → Agregar a pantalla de inicio. El manifiesto pide `display: fullscreen`.

## Desarrollo local

```bash
npm install
npm run dev
```

/**
 * Índices en memoria.
 *
 * ¿Conviene una base SQL con índices B-tree?
 * No a esta escala (~decenas/cientos de fichas). Un archivo JSON +
 * Map/Set cubre filtros por categoría, tienda y vigencia en O(1)/O(k).
 * Los índices SQL sí convienen si el catálogo pasa de ~10k filas o
 * si hay escrituras concurrentes (Postgres/SQLite).
 *
 * Aquí se construyen índices equivalentes:
 *  - por id
 *  - por categoría
 *  - por tienda normalizada
 *  - por activas (vigencia)
 */

import { estaActiva } from "./vigencia.js";

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function construirIndices(ofertas) {
  const byId = new Map();
  const byCategoria = new Map();
  const byTienda = new Map();
  const activas = [];

  for (const o of ofertas) {
    byId.set(o.id, o);

    const cat = o.categoria || "Otros";
    if (!byCategoria.has(cat)) byCategoria.set(cat, []);
    byCategoria.get(cat).push(o);

    const t = norm(o.tienda);
    if (!byTienda.has(t)) byTienda.set(t, []);
    byTienda.get(t).push(o);

    if (estaActiva(o)) activas.push(o);
  }

  return { byId, byCategoria, byTienda, activas };
}

export function filtrarConIndices(indices, { categoria, q } = {}) {
  let base;
  if (categoria && categoria !== "Todas") {
    base = indices.byCategoria.get(categoria) || [];
  } else {
    base = indices.activas;
  }

  const query = norm(q);
  const result = [];
  for (const o of base) {
    if (!estaActiva(o)) continue;
    if (query) {
      const blob = norm(
        `${o.tienda} ${o.titulo} ${o.descripcion} ${o.cupon} ${o.codigo} ${o.banco} ${o.categoria}`
      );
      if (!blob.includes(query)) continue;
    }
    result.push(o);
  }
  return result;
}

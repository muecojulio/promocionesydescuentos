/** Fechas en YYYY-MM-DD, comparadas en zona America/Mexico_City. */

export function hoyISO(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

export function estaActiva(oferta, hoy = hoyISO()) {
  if (!oferta) return false;
  const inicio = oferta.vigenciaInicio || "0000-01-01";
  const fin = oferta.vigenciaFin || "9999-12-31";
  return inicio <= hoy && hoy <= fin;
}

export function formatearFechaHora(date = new Date()) {
  return date.toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "short",
    timeStyle: "short",
  });
}

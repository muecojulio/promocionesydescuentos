import { OFERTAS_LOCALES, CATEGORIAS } from "../../../lib/ofertas-locales.js";
import { fusionarFuentesPublicas } from "../../../lib/fuentes-publicas.js";
import { construirIndices, filtrarConIndices } from "../../../lib/indexes.js";
import { leerCache, guardarCache, invalidarCache } from "../../../lib/cache.js";
import { estaActiva, formatearFechaHora, hoyISO } from "../../../lib/vigencia.js";

export const dynamic = "force-dynamic";

const RATE = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;

function rateOk(ip) {
  const now = Date.now();
  const rec = RATE.get(ip) || { n: 0, t: now };
  if (now - rec.t > RATE_WINDOW_MS) {
    RATE.set(ip, { n: 1, t: now });
    return true;
  }
  if (rec.n >= RATE_MAX) return false;
  rec.n += 1;
  RATE.set(ip, rec);
  return true;
}

export async function GET(request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateOk(ip)) {
    return Response.json(
      { error: "Demasiadas solicitudes. Espera un minuto." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get("refresh") === "1";
  const categoria = searchParams.get("categoria") || "Todas";
  const q = searchParams.get("q") || "";

  if (refresh) invalidarCache();

  let bundle = leerCache();
  if (!bundle) {
    const publicas = await fusionarFuentesPublicas();
    const mezcladas = [...OFERTAS_LOCALES, ...publicas.extra];
    const payload = {
      todas: mezcladas,
      publicas: {
        fuentes: publicas.fuentes,
        errores: publicas.errores,
        usdMxn: publicas.usdMxn,
      },
    };
    bundle = guardarCache(payload);
  }

  const indices = construirIndices(bundle.payload.todas);
  const activasFiltradas = filtrarConIndices(indices, { categoria, q });
  const consulta = formatearFechaHora();

  const ofertas = activasFiltradas.map((o) => ({
    ...o,
    activa: estaActiva(o),
    fechaConsulta: consulta,
    msiTexto:
      o.msi > 0 ? `${o.msi} meses sin intereses` : "Sin meses sin intereses",
  }));

  return Response.json(
    {
      hoy: hoyISO(),
      consulta,
      cache: {
        hit: !refresh && Boolean(leerCache()),
        generatedAt: bundle.generatedAt,
        ttlHoras: 24,
      },
      categorias: CATEGORIAS,
      totalActivas: indices.activas.length,
      totalMostradas: ofertas.length,
      indices: {
        usados: ["id", "categoria", "tienda", "activa"],
        motivo:
          "Catálogo pequeño: índices en memoria. SQL no aporta a esta escala.",
      },
      publicas: bundle.payload.publicas,
      ofertas,
    },
    {
      headers: {
        "Cache-Control": refresh
          ? "no-store"
          : "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}

/**
 * Fusión de APIs públicas SIN key ni registro.
 */
const UA = "promocionesydescuentos/2.0 (app personal; vercel)";

async function getJson(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": UA },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function hoyMas(dias) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function mapCheapShark(deals, usdMxn) {
  if (!Array.isArray(deals)) return [];
  return deals.slice(0, 12).map((d) => {
    const savings = Number.parseFloat(d.savings);
    const descuento = Number.isFinite(savings) ? Math.round(savings) : 0;
    const sale = d.salePrice != null ? String(d.salePrice) : null;
    const mxn =
      sale && usdMxn
        ? `≈ $${Math.round(Number(sale) * usdMxn)} MXN`
        : sale
          ? `USD ${sale}`
          : null;
    return {
      id: `cs-${d.dealID || d.gameID || d.title}`,
      tienda: d.storeName || "Tienda PC (CheapShark)",
      titulo: d.title || "Oferta de juego",
      descuento,
      vigenciaInicio: hoyMas(-1),
      vigenciaFin: hoyMas(7),
      msi: 0,
      banco: "N/A",
      cupon: "N/A",
      codigo: d.dealID ? String(d.dealID).slice(0, 12) : "N/A",
      categoria: "Gaming",
      descripcion: [
        d.normalPrice ? `Precio normal USD ${d.normalPrice}` : null,
        sale ? `Precio oferta USD ${sale}` : null,
        mxn,
        "Fuente: CheapShark. Confirma en el enlace oficial.",
      ]
        .filter(Boolean)
        .join(" · "),
      fuente: "cheapshark",
      url: d.dealID
        ? `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(d.dealID)}`
        : "https://www.cheapshark.com",
    };
  });
}

function mapDummy(products) {
  const list = Array.isArray(products) ? products : products?.products;
  if (!Array.isArray(list)) return [];
  return list
    .filter((p) => p && (p.discountPercentage > 0 || p.price > 0))
    .slice(0, 10)
    .map((p) => {
      const descuento = Math.round(Number(p.discountPercentage) || 0);
      return {
        id: `dj-${p.id}`,
        tienda: p.brand || "DummyJSON",
        titulo: p.title || "Producto",
        descuento,
        vigenciaInicio: hoyMas(-2),
        vigenciaFin: hoyMas(14),
        msi: 0,
        banco: "N/A",
        cupon: "N/A",
        codigo: p.sku ? String(p.sku) : `DJ-${p.id}`,
        categoria: "Tecnología",
        descripcion: [
          p.description || null,
          p.price != null ? `Precio ref. ${p.price}` : null,
          "Fuente DummyJSON (catálogo de ejemplo, no es tienda MX).",
        ]
          .filter(Boolean)
          .join(" · "),
        fuente: "dummyjson",
        url: "https://dummyjson.com",
      };
    });
}

function mapFakeStore(products) {
  if (!Array.isArray(products)) return [];
  return products.slice(0, 8).map((p) => {
    return {
      id: `fs-${p.id}`,
      tienda: "FakeStoreAPI",
      titulo: p.title || "Producto",
      descuento: 15,
      vigenciaInicio: hoyMas(-3),
      vigenciaFin: hoyMas(10),
      msi: 0,
      banco: "N/A",
      cupon: "N/A",
      codigo: `FS-${p.id}`,
      categoria: mapFakeCat(p.category),
      descripcion: [
        p.description || null,
        p.price != null ? `Precio ref. USD ${p.price}` : null,
        "Repo público: github.com/keikaavousi/fake-store-api",
      ]
        .filter(Boolean)
        .join(" · "),
      fuente: "fakestore",
      url: "https://fakestoreapi.com",
    };
  });
}

function mapFakeCat(cat) {
  const c = String(cat || "").toLowerCase();
  if (c.includes("cloth")) return "Ropa";
  if (c.includes("jewel")) return "Zapatos y Joyería";
  if (c.includes("electronic")) return "Tecnología";
  return "Belleza y Otros";
}

export async function fusionarFuentesPublicas() {
  const errores = [];
  let usdMxn = null;
  const jobs = [
    getJson("https://www.cheapshark.com/api/1.0/deals?onSale=1&pageSize=12&sortBy=Savings").catch((e) => {
      errores.push(`cheapshark: ${e.message}`);
      return null;
    }),
    getJson("https://dummyjson.com/products?limit=10").catch((e) => {
      errores.push(`dummyjson: ${e.message}`);
      return null;
    }),
    getJson("https://fakestoreapi.com/products?limit=8").catch((e) => {
      errores.push(`fakestore: ${e.message}`);
      return null;
    }),
    getJson("https://api.frankfurter.app/latest?from=USD&to=MXN").catch((e) => {
      errores.push(`frankfurter: ${e.message}`);
      return null;
    }),
  ];
  const [deals, dummy, fake, fx] = await Promise.all(jobs);
  if (fx && fx.rates && typeof fx.rates.MXN === "number") usdMxn = fx.rates.MXN;
  const extra = [...mapCheapShark(deals, usdMxn), ...mapDummy(dummy), ...mapFakeStore(fake)];
  return {
    extra,
    errores,
    usdMxn,
    fuentes: {
      cheapshark: Boolean(deals),
      dummyjson: Boolean(dummy),
      fakestore: Boolean(fake),
      frankfurter: Boolean(usdMxn),
    },
  };
}

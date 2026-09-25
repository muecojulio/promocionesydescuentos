"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const CATS_FALLBACK = [
  "Todas",
  "Supermercados",
  "Ropa",
  "Zapatos y Joyería",
  "Cine",
  "Viajes",
  "Belleza y Otros",
  "Tecnología",
  "Gaming",
];

export default function Home() {
  const [categoria, setCategoria] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState(CATS_FALLBACK);
  const [consulta, setConsulta] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async (forzar) => {
    setError("");
    if (forzar) setRefrescando(true);
    else setCargando(true);
    try {
      const params = new URLSearchParams();
      if (forzar) params.set("refresh", "1");
      const res = await fetch(`/api/ofertas?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOfertas(Array.isArray(data.ofertas) ? data.ofertas : []);
      if (Array.isArray(data.categorias) && data.categorias.length) setCategorias(data.categorias);
      setConsulta(data.consulta || "");
    } catch (e) {
      setError("No se pudieron cargar las ofertas. Revisa la conexión.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => { cargar(false); }, [cargar]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ofertas.filter((o) => {
      if (categoria !== "Todas" && o.categoria !== categoria) return false;
      if (!q) return true;
      const texto = `${o.tienda} ${o.titulo} ${o.descripcion} ${o.cupon} ${o.codigo} ${o.banco}`.toLowerCase();
      return texto.includes(q);
    });
  }, [ofertas, categoria, busqueda]);

  const handleRefresh = useCallback(() => {
    setBusqueda("");
    setCategoria("Todas");
    window.scrollTo({ top: 0, behavior: "smooth" });
    cargar(true);
  }, [cargar]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1><span aria-hidden="true">🏷️</span> Promos MX</h1>
          <button type="button" className={`btn-refresh ${refrescando ? "is-busy" : ""}`} onClick={handleRefresh} aria-label="Refrescar ofertas activas" disabled={refrescando}>
            <span className="refresh-icon" aria-hidden="true">🔄</span>
            {refrescando ? "Actualizando" : "Refrescar"}
          </button>
        </div>
        <p>Solo promociones vigentes · actualización diaria al refrescar</p>
        <div className="search-box">
          <label className="sr-only" htmlFor="q">Buscar</label>
          <input id="q" type="search" placeholder="Buscar tienda, cupón, banco o producto…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} autoComplete="off" enterKeyHint="search" />
        </div>
      </header>

      <nav className="tabs" aria-label="Categorías">
        {categorias.map((cat) => (
          <button key={cat} type="button" className={`tab ${categoria === cat ? "is-active" : ""}`} onClick={() => setCategoria(cat)} aria-pressed={categoria === cat}>
            {cat}
          </button>
        ))}
      </nav>

      <main className="content">
        {error ? <div className="banner-error">{error}</div> : null}
        <div className="results-info">
          {cargando ? "Cargando ofertas activas…" : `${visibles.length} oferta${visibles.length !== 1 ? "s" : ""} activa${visibles.length !== 1 ? "s" : ""}${categoria !== "Todas" ? ` en ${categoria}` : ""}`}
          {consulta ? ` · Consulta ${consulta}` : ""}
        </div>

        {cargando ? (
          <div className="empty"><div className="empty-icon">⏳</div><p>Obteniendo promociones vigentes…</p></div>
        ) : visibles.length === 0 ? (
          <div className="empty"><div className="empty-icon">😕</div><p>No hay ofertas activas con esos filtros.</p><p className="hint">Prueba otra pestaña, borra la búsqueda o pulsa Refrescar.</p></div>
        ) : (
          <div className="grid">
            {visibles.map((o) => (
              <article key={o.id} className="card">
                <div className="card-header">
                  <div className="tienda">{o.tienda}</div>
                  <div className="badges">
                    {o.descuento > 0 ? <span className="badge">-{o.descuento}%</span> : <span className="badge badge-msi">MSI</span>}
                    {o.msi > 0 ? <span className="badge badge-meses">{o.msi} MSI</span> : null}
                  </div>
                </div>
                <h2 className="titulo">{o.titulo}</h2>
                {o.msi > 0 ? <div className="msi-badge">💳 {o.msi} meses sin intereses</div> : <div className="msi-badge msi-off">Sin MSI</div>}
                <div className="ficha">
                  <div className="ficha-item"><span>% Descuento</span><strong>{o.descuento > 0 ? `${o.descuento}%` : "Solo MSI"}</strong></div>
                  <div className="ficha-item"><span>Vigencia</span><strong>{o.vigenciaInicio} → {o.vigenciaFin}</strong></div>
                  <div className="ficha-item"><span>MSI</span><strong>{o.msi > 0 ? `${o.msi} meses sin intereses` : "No aplica"}</strong></div>
                  <div className="ficha-item"><span>Banco o bancos</span><strong>{o.banco || "N/A"}</strong></div>
                  <div className="ficha-item"><span>Cupón</span><strong>{o.cupon || "N/A"}</strong></div>
                  <div className="ficha-item"><span>Código</span><strong>{o.codigo || "N/A"}</strong></div>
                  <div className="ficha-item"><span>Categoría</span><strong>{o.categoria}</strong></div>
                  <div className="ficha-item"><span>Fecha/hora</span><strong>{o.fechaConsulta || consulta || "—"}</strong></div>
                </div>
                {o.descripcion ? <p className="descripcion">{o.descripcion}</p> : null}
                {o.url ? <a className="card-link" href={o.url} target="_blank" rel="noopener noreferrer">Ver fuente</a> : null}
              </article>
            ))}
          </div>
        )}

        <p className="footer-note">
          Confirma siempre en la tienda oficial antes de comprar.
          <br />
          <Link href="/privacidad">Política de privacidad</Link>
          {" · "}
          <Link href="/terminos">Términos</Link>
        </p>
      </main>

      <nav className="bottom-nav" aria-label="Accesos rápidos">
        <button type="button" className={`nav-item ${categoria === "Todas" ? "is-active" : ""}`} onClick={() => { setCategoria("Todas"); setBusqueda(""); }}><span aria-hidden="true">🏠</span>Inicio</button>
        <button type="button" className={`nav-item ${categoria === "Supermercados" ? "is-active" : ""}`} onClick={() => setCategoria("Supermercados")}><span aria-hidden="true">🛒</span>Súper</button>
        <button type="button" className={`nav-item ${categoria === "Ropa" ? "is-active" : ""}`} onClick={() => setCategoria("Ropa")}><span aria-hidden="true">👗</span>Ropa</button>
        <button type="button" className={`nav-item ${categoria === "Cine" ? "is-active" : ""}`} onClick={() => setCategoria("Cine")}><span aria-hidden="true">🎬</span>Cine</button>
        <button type="button" className={`nav-item ${categoria === "Viajes" ? "is-active" : ""}`} onClick={() => setCategoria("Viajes")}><span aria-hidden="true">✈️</span>Viajes</button>
      </nav>
    </div>
  );
}

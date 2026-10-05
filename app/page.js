"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  Accordion,
  Button,
  Chip,
  HorizontalRail,
  OfferCard,
  OfferCarousel,
  SearchCombobox,
  StatusLive,
  Switch,
  TabList,
  TabPanel,
  normalizeText,
  tabIdFor,
  usePrefersReducedMotion,
} from "./ui";

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
  const tabsBase = useId();
  const panelId = `${tabsBase}-panel`;
  const reduced = usePrefersReducedMotion();
  const [categoria, setCategoria] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState(CATS_FALLBACK);
  const [consulta, setConsulta] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [refreshState, setRefreshState] = useState("idle");
  const [soloMsi, setSoloMsi] = useState(false);
  const [soloCupon, setSoloCupon] = useState(false);
  const [soloAlto, setSoloAlto] = useState(false);
  const [compact, setCompact] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  const cargar = useCallback(async (forzar) => {
    setError("");
    if (forzar) setRefreshState("loading");
    else setCargando(true);
    try {
      const url = forzar ? "/api/ofertas?refresh=1" : "/api/ofertas";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOfertas(Array.isArray(data.ofertas) ? data.ofertas : []);
      if (Array.isArray(data.categorias) && data.categorias.length) setCategorias(data.categorias);
      setConsulta(data.consulta || "");
      if (forzar) {
        setRefreshState("success");
        setLiveMessage("Ofertas actualizadas");
        window.setTimeout(() => setRefreshState("idle"), 1600);
      }
    } catch {
      setError("No se pudieron cargar las ofertas. Revisa la conexión.");
      setLiveMessage("No se pudieron cargar las ofertas. Revisa la conexión.");
      if (forzar) {
        setRefreshState("error");
        window.setTimeout(() => setRefreshState("idle"), 2200);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar(false);
  }, [cargar]);

  const visibles = useMemo(() => {
    const q = normalizeText(busqueda).trim();
    return ofertas.filter((o) => {
      if (categoria !== "Todas" && o.categoria !== categoria) return false;
      if (soloMsi && !(o.msi > 0)) return false;
      if (soloCupon && !String(o.cupon || "").trim()) return false;
      if (soloCupon && String(o.cupon).trim() === "N/A") return false;
      if (soloAlto && !(o.descuento >= 20)) return false;
      if (!q) return true;
      const texto = normalizeText(
        `${o.tienda || ""} ${o.titulo || ""} ${o.descripcion || ""} ${o.cupon || ""} ${o.codigo || ""} ${o.banco || ""} ${o.categoria || ""}`,
      );
      return texto.includes(q);
    });
  }, [ofertas, categoria, busqueda, soloMsi, soloCupon, soloAlto]);

  const destacadas = useMemo(() => {
    if (visibles.length < 2) return [];
    return [...visibles]
      .sort((a, b) => (b.descuento || 0) - (a.descuento || 0) || (b.msi || 0) - (a.msi || 0))
      .slice(0, 6);
  }, [visibles]);

  const sugerencias = useMemo(() => {
    const seen = new Set();
    const out = [];
    const add = (group, value, label) => {
      const v = String(value || "").trim();
      if (!v || v === "N/A") return;
      const key = `${group}:${normalizeText(v)}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ id: key, group, value: v, label: label || v });
    };
    for (const cat of categorias) {
      if (cat !== "Todas") add("Categorías", cat);
    }
    for (const o of ofertas) {
      add("Tiendas", o.tienda);
      add("Cupones", o.cupon, o.cupon && o.tienda ? `${o.cupon} · ${o.tienda}` : o.cupon);
      add("Códigos", o.codigo, o.codigo && o.tienda ? `${o.codigo} · ${o.tienda}` : o.codigo);
    }
    return out;
  }, [ofertas, categorias]);

  const handleRefresh = useCallback(() => {
    setBusqueda("");
    setCategoria("Todas");
    setSoloMsi(false);
    setSoloCupon(false);
    setSoloAlto(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }
    setLiveMessage("Actualizando ofertas");
    cargar(true);
  }, [cargar, reduced]);

  const onSelectSuggestion = (opt) => {
    if (opt.group === "Categorías") {
      setCategoria(opt.value);
      setBusqueda("");
      setLiveMessage(`Categoría ${opt.value}`);
      return;
    }
    setBusqueda(opt.value);
  };

  const tabIndex = Math.max(0, categorias.indexOf(categoria));
  const labelledBy = tabIdFor(tabsBase, tabIndex);

  const announce = useCallback((msg) => setLiveMessage(msg), []);

  useEffect(() => {
    if (cargando) return;
    const n = visibles.length;
    setLiveMessage(
      n === 0
        ? "No hay ofertas activas con esos filtros."
        : `${n} oferta${n !== 1 ? "s" : ""} activa${n !== 1 ? "s" : ""}${categoria !== "Todas" ? ` en ${categoria}` : ""}`,
    );
  }, [categoria, soloMsi, soloCupon, soloAlto, cargando, visibles.length]);

  return (
    <div className="app">
      <StatusLive message={liveMessage} />
      <header className="header">
        <div className="header-top">
          <h1>
            <span aria-hidden="true">🏷️</span> Promos MX
          </h1>
          <Button
            variant="on-primary"
            className="btn-refresh"
            state={refreshState}
            idleLabel={
              <>
                <span className="refresh-icon" aria-hidden="true">
                  🔄
                </span>
                Refrescar
              </>
            }
            loadingLabel="Actualizando"
            successLabel="Actualizado"
            errorLabel="Reintentar"
            aria-label="Refrescar ofertas activas"
            onClick={handleRefresh}
          />
        </div>
        <p>Solo promociones vigentes · actualización diaria al refrescar</p>
        <SearchCombobox
          id="q"
          label="Buscar tienda, cupón, banco o producto"
          placeholder="Buscar tienda, cupón, banco o producto…"
          value={busqueda}
          onChange={setBusqueda}
          options={sugerencias}
          onSelect={onSelectSuggestion}
          emptyMessage="Sin coincidencias. Prueba otra tienda, cupón o categoría."
        />
      </header>

      <TabList
        items={categorias}
        value={categoria}
        onChange={setCategoria}
        ariaLabel="Categorías"
        idBase={tabsBase}
        panelId={panelId}
      />

      <TabPanel
        as="main"
        id={panelId}
        labelledBy={labelledBy}
        activeIndex={tabIndex}
        itemCount={categorias.length}
        onIndexChange={(i) => setCategoria(categorias[i])}
        className="content"
      >
        <div className="filters-block">
          <HorizontalRail snap="proximity" recenterKey={`${soloMsi}-${soloCupon}-${soloAlto}`}>
            <div className="ui-chip-row" role="group" aria-label="Filtros">
              <Chip pressed={soloMsi} onClick={() => setSoloMsi((v) => !v)}>
                Con MSI
              </Chip>
              <Chip pressed={soloCupon} onClick={() => setSoloCupon((v) => !v)}>
                Con cupón
              </Chip>
              <Chip pressed={soloAlto} onClick={() => setSoloAlto((v) => !v)}>
                20% o más
              </Chip>
            </div>
          </HorizontalRail>
          <div className="filters-row">
            <Switch label="Vista compacta" checked={compact} onChange={setCompact} />
            <Accordion title="Cómo confirmar una promo" defaultOpen={false} className="filters-help">
              <p className="hint">
                El cupón y el código se copian al portapapeles. En el teléfono también puedes deslizar
                la ficha hacia la izquierda o pulsar Acciones. Confirma siempre vigencia y MSI en la
                tienda oficial.
              </p>
            </Accordion>
          </div>
        </div>

        {error ? (
          <div className="banner-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="view-row">
          <div className="results-info">
            {cargando
              ? "Cargando ofertas activas…"
              : `${visibles.length} oferta${visibles.length !== 1 ? "s" : ""} activa${visibles.length !== 1 ? "s" : ""}${categoria !== "Todas" ? ` en ${categoria}` : ""}`}
            {consulta ? ` · Consulta ${consulta}` : ""}
          </div>
        </div>

        {cargando ? (
          <div className="empty">
            <div className="empty-icon" aria-hidden="true">
              ⏳
            </div>
            <p>Obteniendo promociones vigentes…</p>
          </div>
        ) : visibles.length === 0 ? (
          <div className="empty">
            <div className="empty-icon" aria-hidden="true">
              😕
            </div>
            <p>No hay ofertas activas con esos filtros.</p>
            <p className="hint">Prueba otra pestaña, borra la búsqueda o pulsa Refrescar.</p>
          </div>
        ) : (
          <>
            {destacadas.length >= 2 ? (
              <OfferCarousel
                title="Destacadas"
                items={destacadas}
                consulta={consulta}
                onAnnounce={announce}
              />
            ) : null}
            <h2 className="section-title">Todas las ofertas</h2>
            <div className="offer-list">
              {visibles.map((o, i) => (
                <OfferCard
                  key={o.id}
                  oferta={o}
                  compact={compact}
                  consulta={consulta}
                  onAnnounce={announce}
                  index={i}
                />
              ))}
            </div>
          </>
        )}

        <p className="footer-note">
          Confirma siempre en la tienda oficial antes de comprar.
          <br />
          <Link href="/privacidad">Política de privacidad</Link>
          {" · "}
          <Link href="/terminos">Términos</Link>
        </p>
      </TabPanel>

      <nav className="bottom-nav" aria-label="Accesos rápidos">
        <button
          type="button"
          className={`nav-item ${categoria === "Todas" ? "is-active" : ""}`}
          aria-current={categoria === "Todas" ? "page" : undefined}
          onClick={() => {
            setCategoria("Todas");
            setBusqueda("");
          }}
        >
          <span aria-hidden="true">🏠</span>Inicio
        </button>
        <button
          type="button"
          className={`nav-item ${categoria === "Supermercados" ? "is-active" : ""}`}
          aria-current={categoria === "Supermercados" ? "page" : undefined}
          onClick={() => setCategoria("Supermercados")}
        >
          <span aria-hidden="true">🛒</span>Súper
        </button>
        <button
          type="button"
          className={`nav-item ${categoria === "Ropa" ? "is-active" : ""}`}
          aria-current={categoria === "Ropa" ? "page" : undefined}
          onClick={() => setCategoria("Ropa")}
        >
          <span aria-hidden="true">👗</span>Ropa
        </button>
        <button
          type="button"
          className={`nav-item ${categoria === "Cine" ? "is-active" : ""}`}
          aria-current={categoria === "Cine" ? "page" : undefined}
          onClick={() => setCategoria("Cine")}
        >
          <span aria-hidden="true">🎬</span>Cine
        </button>
        <button
          type="button"
          className={`nav-item ${categoria === "Viajes" ? "is-active" : ""}`}
          aria-current={categoria === "Viajes" ? "page" : undefined}
          onClick={() => setCategoria("Viajes")}
        >
          <span aria-hidden="true">✈️</span>Viajes
        </button>
      </nav>
    </div>
  );
}

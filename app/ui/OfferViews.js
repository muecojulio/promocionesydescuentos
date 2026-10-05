"use client";

import { useState } from "react";
import { Accordion } from "./Controls";
import { Button } from "./Button";
import { HorizontalRail } from "./HorizontalRail";
import { SwipeReveal } from "./SwipeReveal";
import { copyText } from "./hooks";

function usable(value) {
  const v = String(value || "").trim();
  return v && v !== "N/A" ? v : "";
}

export function OfferFicha({ oferta, consulta }) {
  return (
    <div className="ficha">
      <div className="ficha-item">
        <span>% Descuento</span>
        <strong>{oferta.descuento > 0 ? `${oferta.descuento}%` : "Solo MSI"}</strong>
      </div>
      <div className="ficha-item">
        <span>Vigencia</span>
        <strong>
          {oferta.vigenciaInicio} → {oferta.vigenciaFin}
        </strong>
      </div>
      <div className="ficha-item">
        <span>MSI</span>
        <strong>{oferta.msi > 0 ? `${oferta.msi} meses sin intereses` : "No aplica"}</strong>
      </div>
      <div className="ficha-item">
        <span>Banco o bancos</span>
        <strong>{oferta.banco || "N/A"}</strong>
      </div>
      <div className="ficha-item">
        <span>Cupón</span>
        <strong>{oferta.cupon || "N/A"}</strong>
      </div>
      <div className="ficha-item">
        <span>Código</span>
        <strong>{oferta.codigo || "N/A"}</strong>
      </div>
      <div className="ficha-item">
        <span>Categoría</span>
        <strong>{oferta.categoria}</strong>
      </div>
      <div className="ficha-item">
        <span>Fecha/hora</span>
        <strong>{oferta.fechaConsulta || consulta || "—"}</strong>
      </div>
    </div>
  );
}

export function OfferBody({ oferta, compact, consulta, onAnnounce }) {
  const cupon = usable(oferta.cupon);
  const codigo = usable(oferta.codigo);
  const [copyState, setCopyState] = useState("idle");
  const [copyWhat, setCopyWhat] = useState("cupón");

  const copyValue = async (text, what) => {
    setCopyWhat(what);
    const ok = await copyText(text);
    setCopyState(ok ? "success" : "error");
    onAnnounce?.(ok ? `${what} copiado` : `No se pudo copiar el ${what}`);
    window.setTimeout(() => setCopyState("idle"), ok ? 1600 : 2000);
  };

  return (
    <article className={`card ${compact ? "is-compact" : ""}`}>
      <div className="card-header">
        <div className="tienda">{oferta.tienda}</div>
        <div className="badges">
          {oferta.descuento > 0 ? (
            <span className="badge">-{oferta.descuento}%</span>
          ) : (
            <span className="badge badge-msi">MSI</span>
          )}
          {oferta.msi > 0 ? <span className="badge badge-meses">{oferta.msi} MSI</span> : null}
        </div>
      </div>
      <h2 className="titulo">{oferta.titulo}</h2>
      {oferta.msi > 0 ? (
        <div className="msi-badge">💳 {oferta.msi} meses sin intereses</div>
      ) : (
        <div className="msi-badge msi-off">Sin MSI</div>
      )}
      {compact ? (
        <Accordion title="Ficha completa" defaultOpen={false}>
          <OfferFicha oferta={oferta} consulta={consulta} />
        </Accordion>
      ) : (
        <OfferFicha oferta={oferta} consulta={consulta} />
      )}
      {oferta.descripcion ? <p className="descripcion">{oferta.descripcion}</p> : null}
      <div className="card-toolbar">
        {cupon ? (
          <Button
            variant="quiet"
            state={copyWhat === "cupón" ? copyState : "idle"}
            idleLabel={`Copiar ${cupon}`}
            loadingLabel="Copiando"
            successLabel="Copiado"
            errorLabel="No se pudo copiar"
            aria-label={`Copiar cupón ${cupon}`}
            onClick={() => copyValue(cupon, "cupón")}
          />
        ) : null}
        {oferta.url ? (
          <a className="card-link" href={oferta.url} target="_blank" rel="noopener noreferrer">
            Ver fuente
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function OfferCard({
  oferta,
  compact,
  consulta,
  onAnnounce,
  index = 0,
  enableSwipe = true,
}) {
  const cupon = usable(oferta.cupon);
  const codigo = usable(oferta.codigo);
  const actions = [
    cupon
      ? {
          id: "cupon",
          label: "Copiar cupón",
          tone: "is-primary",
          onAction: async () => {
            const ok = await copyText(cupon);
            onAnnounce?.(ok ? "Cupón copiado" : "No se pudo copiar el cupón");
          },
        }
      : null,
    codigo
      ? {
          id: "codigo",
          label: "Copiar código",
          onAction: async () => {
            const ok = await copyText(codigo);
            onAnnounce?.(ok ? "Código copiado" : "No se pudo copiar el código");
          },
        }
      : null,
    oferta.url
      ? {
          id: "fuente",
          label: "Ver fuente",
          href: oferta.url,
        }
      : null,
  ].filter(Boolean);

  const body = (
    <OfferBody
      oferta={oferta}
      compact={compact}
      consulta={consulta}
      onAnnounce={onAnnounce}
    />
  );

  return (
    <div className="offer-item" style={{ "--i": Math.min(index, 10) }}>
      {enableSwipe ? (
        <SwipeReveal actions={actions} label={`Acciones de ${oferta.tienda}`}>
          {body}
        </SwipeReveal>
      ) : (
        body
      )}
    </div>
  );
}

export function OfferCarousel({ title, items, consulta, onAnnounce }) {
  if (!items?.length) return null;
  return (
    <section className="offer-carousel" aria-label={title}>
      <h2 className="section-title">{title}</h2>
      <HorizontalRail
        snap="mandatory"
        collapseToGrid
        hint="Desliza"
        className="offer-carousel-rail"
      >
        {items.map((oferta, i) => (
          <div key={oferta.id} className="offer-slide">
            <OfferCard
              oferta={oferta}
              compact
              enableSwipe={false}
              consulta={consulta}
              onAnnounce={onAnnounce}
              index={i}
            />
          </div>
        ))}
      </HorizontalRail>
    </section>
  );
}

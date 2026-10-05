"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "./hooks";

const NESTED_INTERACTIVE = "a, button, input, select, textarea, [role='button'], [role='switch']";

export function SwipeReveal({
  actions = [],
  children,
  label = "Acciones de la oferta",
}) {
  const reduced = usePrefersReducedMotion();
  const isFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const rootRef = useRef(null);
  const surfaceRef = useRef(null);
  const actionsRef = useRef(null);
  const startRef = useRef(null);
  const axisRef = useRef(null);
  const offsetRef = useRef(0);
  const openRef = useRef(false);
  const suppressClick = useRef(false);
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const panelId = useId();

  const usefulActions = actions.filter(Boolean);
  const desktop = isFinePointer;

  const panelWidth = () => Math.min(actionsRef.current?.offsetWidth || 152, rootRef.current?.offsetWidth * 0.7 || 152);

  const snapTo = useCallback(
    (nextOpen) => {
      openRef.current = nextOpen;
      setOpen(nextOpen);
      const x = nextOpen ? -panelWidth() : 0;
      offsetRef.current = x;
      setOffset(x);
      setDragging(false);
    },
    [],
  );

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (desktop) {
      offsetRef.current = 0;
      setOffset(0);
      setOpen(false);
      openRef.current = false;
    }
  }, [desktop]);

  const onPointerDown = (e) => {
    if (desktop || !usefulActions.length) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest?.(NESTED_INTERACTIVE)) return;
    e.stopPropagation();
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      id: e.pointerId,
      base: openRef.current ? -panelWidth() : 0,
    };
    axisRef.current = null;
    suppressClick.current = false;
  };

  const onPointerMove = (e) => {
    const start = startRef.current;
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!axisRef.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dx) > Math.abs(dy) * 1.2) {
        axisRef.current = "x";
        setDragging(true);
        surfaceRef.current?.setPointerCapture?.(e.pointerId);
      } else {
        axisRef.current = "y";
        startRef.current = null;
        return;
      }
    }
    if (axisRef.current !== "x") return;
    const max = panelWidth();
    const next = Math.min(0, Math.max(-max, start.base + dx));
    offsetRef.current = next;
    setOffset(next);
    if (Math.abs(dx) > 8) suppressClick.current = true;
  };

  const onPointerUp = (e) => {
    const start = startRef.current;
    if (!start || (e.pointerId && e.pointerId !== start.id)) {
      startRef.current = null;
      return;
    }
    const dx = e.clientX - start.x;
    const dt = Math.max(1, performance.now() - start.t);
    const vx = dx / dt;
    const max = panelWidth();
    if (axisRef.current === "x") {
      const projected = start.base + dx;
      const shouldOpen = projected < -max * 0.35 || vx < -0.35;
      const shouldClose = projected > -max * 0.65 || vx > 0.35;
      if (openRef.current) snapTo(!shouldClose ? true : false);
      else snapTo(shouldOpen);
    } else {
      setDragging(false);
    }
    startRef.current = null;
    axisRef.current = null;
  };

  const onClickCapture = (e) => {
    if (!suppressClick.current) return;
    e.preventDefault();
    e.stopPropagation();
    suppressClick.current = false;
  };

  const toggle = () => snapTo(!openRef.current);

  if (!usefulActions.length) {
    return <div className="ui-swipe ui-swipe--static">{children}</div>;
  }

  return (
    <div
      ref={rootRef}
      className={`ui-swipe ${dragging ? "is-dragging" : ""} ${open ? "is-open" : ""} ${desktop ? "is-desktop" : ""}`}
      data-no-panel-swipe=""
    >
      <div
        ref={actionsRef}
        className="ui-swipe-actions"
        id={panelId}
        role="group"
        aria-label={label}
        aria-hidden={desktop ? undefined : !open}
        inert={desktop || open ? undefined : true}
      >
        {usefulActions.map((action) =>
          action.href ? (
            <a
              key={action.id}
              className={`ui-swipe-action ${action.tone || ""}`}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={desktop || open ? 0 : -1}
            >
              {action.label}
            </a>
          ) : (
            <button
              key={action.id}
              type="button"
              className={`ui-swipe-action ${action.tone || ""}`}
              onClick={() => {
                action.onAction?.();
                snapTo(false);
              }}
              tabIndex={desktop || open ? 0 : -1}
            >
              {action.label}
            </button>
          ),
        )}
      </div>
      <div
        ref={surfaceRef}
        className="ui-swipe-surface"
        style={{
          transform: desktop ? "none" : `translate3d(${offset}px, 0, 0)`,
          transitionDuration: reduced || dragging ? "0ms" : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
      >
        {children}
        {desktop ? null : (
          <button
            type="button"
            className="ui-swipe-more"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={toggle}
          >
            {open ? "Cerrar acciones" : "Acciones"}
          </button>
        )}
      </div>
    </div>
  );
}

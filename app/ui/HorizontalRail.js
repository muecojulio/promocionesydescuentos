"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { centerChild, usePrefersReducedMotion } from "./hooks";

export function HorizontalRail({
  children,
  ariaLabel,
  className = "",
  snap = "proximity",
  collapseToGrid = false,
  recenterKey,
  hint = "Desliza",
}) {
  const scrollerRef = useRef(null);
  const pointerRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [overflow, setOverflow] = useState({ start: false, end: false });

  const updateOverflow = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 4) {
      setOverflow({ start: false, end: false });
      return;
    }
    setOverflow({
      start: el.scrollLeft > 4,
      end: el.scrollLeft < max - 4,
    });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateOverflow();
    const ro = new ResizeObserver(updateOverflow);
    ro.observe(el);
    for (const child of el.children) ro.observe(child);
    el.addEventListener("scroll", updateOverflow, { passive: true });
    window.addEventListener("resize", updateOverflow);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateOverflow);
      window.removeEventListener("resize", updateOverflow);
    };
  }, [updateOverflow, recenterKey]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || recenterKey === undefined || recenterKey === null) return;
    const active = el.querySelector(
      '[aria-selected="true"], [aria-pressed="true"], [aria-current="true"], .is-active, .is-pressed',
    );
    if (active) centerChild(el, active, reduced);
  }, [recenterKey, reduced]);

  const onPointerDown = (e) => {
    pointerRef.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerMove = (e) => {
    const p = pointerRef.current;
    if (!p) return;
    if (Math.abs(e.clientX - p.x) > 8 || Math.abs(e.clientY - p.y) > 8) p.moved = true;
  };
  const onPointerUp = () => {
    window.setTimeout(() => {
      pointerRef.current = null;
    }, 0);
  };
  const onClickCapture = (e) => {
    if (pointerRef.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const snapType = snap === false ? "none" : snap === "mandatory" ? "mandatory" : "proximity";
  const showHint = overflow.end && hint;

  return (
    <div
      className={`ui-rail ${collapseToGrid ? "ui-rail--grid-md" : ""} ${className}`.trim()}
      role={ariaLabel ? "region" : undefined}
      aria-label={ariaLabel}
      data-overflow-start={overflow.start ? "true" : "false"}
      data-overflow-end={overflow.end ? "true" : "false"}
    >
      <div
        ref={scrollerRef}
        className="ui-rail-scroller"
        data-snap={snapType}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
      {overflow.start ? <div className="ui-rail-fade ui-rail-fade-start" aria-hidden="true" /> : null}
      {overflow.end ? <div className="ui-rail-fade ui-rail-fade-end" aria-hidden="true" /> : null}
      {showHint ? (
        <div className="ui-rail-hint" aria-hidden="true">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

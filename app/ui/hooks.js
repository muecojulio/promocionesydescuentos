"use client";

import { useEffect, useRef, useState } from "react";

export function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "option",
  "label",
  "summary",
  "iframe",
  "canvas",
  "video",
  "audio",
  "map",
  "[role='button']",
  "[role='tab']",
  "[role='switch']",
  "[role='combobox']",
  "[role='option']",
  "[role='slider']",
  "[role='link']",
  "[role='menuitem']",
  "[role='checkbox']",
  "[contenteditable='true']",
  "[data-no-swipe]",
  "[data-no-panel-swipe]",
  ".ui-rail-scroller",
  ".ui-swipe",
  ".ui-tablist",
  ".leaflet-container",
].join(",");

export function isInteractiveTarget(target) {
  if (!target || typeof target.closest !== "function") return false;
  return Boolean(target.closest(INTERACTIVE_SELECTOR));
}

export async function copyText(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fallback below */
  }
  try {
    const el = document.createElement("textarea");
    el.value = value;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function scrollToX(scroller, left, behavior) {
  if (!scroller) return;
  const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
  const next = Math.max(0, Math.min(max, left));
  if (typeof scroller.scrollTo === "function") {
    scroller.scrollTo({ left: next, behavior: behavior || "auto" });
  } else {
    scroller.scrollLeft = next;
  }
}

export function centerChild(scroller, child, reducedMotion) {
  if (!scroller || !child) return;
  const left = child.offsetLeft - (scroller.clientWidth - child.offsetWidth) / 2;
  scrollToX(scroller, left, reducedMotion ? "auto" : "smooth");
}

/**
 * Swipe horizontal discreto (p. ej. cambiar de pestaña).
 * Distingue eje con proporción ~1.2 y no arranca sobre controles.
 */
export function useHorizontalSwipe(
  ref,
  { onSwipe, enabled = true, threshold = 56, ratio = 1.2 } = {},
) {
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;

  useEffect(() => {
    const el = ref?.current;
    if (!el || !enabled) return;

    let start = null;
    let axis = null;

    const reset = () => {
      start = null;
      axis = null;
    };

    const onDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (isInteractiveTarget(e.target)) return;
      start = {
        x: e.clientX,
        y: e.clientY,
        t: performance.now(),
        id: e.pointerId,
      };
      axis = null;
    };

    const onMove = (e) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (axis) return;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      axis = Math.abs(dx) > Math.abs(dy) * ratio ? "x" : "y";
    };

    const onUp = (e) => {
      if (!start || e.pointerId !== start.id) {
        reset();
        return;
      }
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const dt = Math.max(1, performance.now() - start.t);
      const vx = dx / dt;
      if (axis === "x") {
        const far =
          Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * ratio;
        const flick =
          Math.abs(vx) > 0.35 && Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy);
        if (far || flick) onSwipeRef.current?.(dx < 0 ? "left" : "right");
      }
      reset();
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", reset);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", reset);
    };
  }, [ref, enabled, threshold, ratio]);
}



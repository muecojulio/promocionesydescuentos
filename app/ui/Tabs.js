"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { HorizontalRail } from "./HorizontalRail";
import { useHorizontalSwipe, usePrefersReducedMotion } from "./hooks";

export function TabList({
  items,
  value,
  onChange,
  ariaLabel = "Categorías",
  idBase,
  panelId,
}) {
  const autoId = useId();
  const base = idBase || autoId;
  const listRef = useRef(null);
  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, top: 0, height: 0 });

  const updateIndicator = useCallback(() => {
    const list = listRef.current;
    const index = items.indexOf(value);
    const tab = tabRefs.current[index];
    if (!list || !tab) return;
    setIndicator({
      left: tab.offsetLeft,
      width: tab.offsetWidth,
      top: tab.offsetTop,
      height: tab.offsetHeight,
    });
  }, [items, value]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const ro = new ResizeObserver(updateIndicator);
    ro.observe(list);
    window.addEventListener("resize", updateIndicator);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  const onKeyDown = (e) => {
    const i = items.indexOf(value);
    if (i < 0) return;
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(items.length - 1, i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(0, i - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;
    e.preventDefault();
    onChange(items[next]);
    requestAnimationFrame(() => tabRefs.current[next]?.focus());
  };

  return (
    <div className={`ui-tabs ${indicator.width ? "is-ready" : ""}`}>
      <HorizontalRail recenterKey={value} snap="proximity" className="ui-tabs-rail">
        <div
          ref={listRef}
          className="ui-tablist"
          role="tablist"
          aria-label={ariaLabel}
          onKeyDown={onKeyDown}
        >
          <span
            className="ui-tab-indicator"
            aria-hidden="true"
            style={{
              transform: `translate(${indicator.left}px, ${indicator.top}px)`,
              width: indicator.width,
              height: indicator.height || undefined,
            }}
          />
          {items.map((item, i) => {
            const selected = item === value;
            const tabId = `${base}-tab-${i}`;
            return (
              <button
                key={item}
                ref={(node) => {
                  tabRefs.current[i] = node;
                }}
                type="button"
                className={`ui-tab ${selected ? "is-active" : ""}`}
                role="tab"
                id={tabId}
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            );
          })}
        </div>
      </HorizontalRail>
    </div>
  );
}

export function TabPanel({
  id,
  labelledBy,
  activeIndex,
  onIndexChange,
  itemCount = 0,
  children,
  className = "",
  as: Tag = "div",
}) {
  const panelRef = useRef(null);
  const prevIndex = useRef(activeIndex);
  const [dir, setDir] = useState("none");
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (activeIndex === prevIndex.current) return;
    setDir(activeIndex > prevIndex.current ? "next" : "prev");
    prevIndex.current = activeIndex;
  }, [activeIndex]);

  useHorizontalSwipe(panelRef, {
    enabled: itemCount > 1,
    onSwipe: (direction) => {
      if (direction === "left" && activeIndex < itemCount - 1) onIndexChange?.(activeIndex + 1);
      if (direction === "right" && activeIndex > 0) onIndexChange?.(activeIndex - 1);
    },
  });

  return (
    <Tag
      ref={panelRef}
      className={`ui-tabpanel ${className}`.trim()}
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      tabIndex={-1}
    >
      <div
        key={activeIndex}
        className={`ui-tabpanel-anim ${reduced ? "is-reduced" : ""} is-${dir}`}
      >
        {children}
      </div>
    </Tag>
  );
}

export function tabIdFor(base, index) {
  return `${base}-tab-${index}`;
}

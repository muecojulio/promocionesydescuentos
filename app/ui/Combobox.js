"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Field } from "./Controls";
import { normalizeText } from "./hooks";

export function SearchCombobox({
  id,
  label = "Buscar",
  placeholder,
  value,
  onChange,
  options = [],
  onSelect,
  emptyMessage = "Sin coincidencias",
}) {
  const autoId = useId();
  const inputId = id || `${autoId}-input`;
  const listId = `${autoId}-list`;
  const inputRef = useRef(null);
  const rootRef = useRef(null);
  const composing = useRef(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const filtered = useMemo(() => {
    const q = normalizeText(value).trim();
    const matched = q
      ? options.filter(
          (opt) =>
            normalizeText(opt.label).includes(q) ||
            normalizeText(opt.value).includes(q) ||
            normalizeText(opt.group || "").includes(q),
        )
      : options;
    return matched.slice(0, 40);
  }, [options, value]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const opt of filtered) {
      const g = opt.group || "Sugerencias";
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(opt);
    }
    return [...map.entries()];
  }, [filtered]);

  const flat = filtered;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open || active < 0) return;
    const node = document.getElementById(`${listId}-opt-${active}`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active, open, listId]);

  const selectIndex = (index) => {
    const opt = flat[index];
    if (!opt) return;
    onSelect?.(opt);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (composing.current) return;
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setActive(flat.length ? 0 : -1);
          return;
        }
        if (!flat.length) return;
        setActive((i) => (i < 0 ? 0 : Math.min(flat.length - 1, i + 1)));
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setActive(flat.length ? flat.length - 1 : -1);
          return;
        }
        if (!flat.length) return;
        setActive((i) => (i < 0 ? flat.length - 1 : Math.max(0, i - 1)));
        break;
      }
      case "Home": {
        if (!open || !flat.length) return;
        e.preventDefault();
        setActive(0);
        break;
      }
      case "End": {
        if (!open || !flat.length) return;
        e.preventDefault();
        setActive(flat.length - 1);
        break;
      }
      case "Enter": {
        if (open && active >= 0 && flat[active]) {
          e.preventDefault();
          selectIndex(active);
        } else {
          setOpen(false);
        }
        break;
      }
      case "Escape": {
        if (open) {
          e.preventDefault();
          setOpen(false);
          setActive(-1);
        }
        break;
      }
      case "Tab": {
        setOpen(false);
        break;
      }
      default:
        break;
    }
  };

  let runningIndex = -1;
  const activeId = open && active >= 0 ? `${listId}-opt-${active}` : undefined;

  return (
    <Field id={inputId} label={label} visuallyHiddenLabel>
      <div className="ui-combobox search-box" ref={rootRef}>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          className="ui-combobox-input"
          placeholder={placeholder}
          value={value}
          autoComplete="off"
          spellCheck="false"
          enterKeyHint="search"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-haspopup="listbox"
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
        />
        <button
          type="button"
          className="ui-combobox-toggle"
          aria-label={open ? "Cerrar sugerencias" : "Abrir sugerencias"}
          aria-expanded={open}
          aria-controls={listId}
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setOpen((v) => !v);
            inputRef.current?.focus();
          }}
        >
          <span aria-hidden="true">{open ? "▴" : "▾"}</span>
        </button>
        {open ? (
          <div
            className="ui-combobox-list"
            id={listId}
            role="listbox"
            aria-label="Sugerencias de búsqueda"
          >
            {flat.length === 0 ? (
              <div className="ui-combobox-empty" role="status">
                {emptyMessage}
              </div>
            ) : (
              groups.map(([group, opts]) => (
                <div key={group} className="ui-combobox-group" role="group" aria-label={group}>
                  <div className="ui-combobox-group-label" role="presentation">
                    {group}
                  </div>
                  {opts.map((opt) => {
                    runningIndex += 1;
                    const index = runningIndex;
                    const selected = index === active;
                    return (
                      <div
                        key={opt.id || `${group}-${opt.value}`}
                        id={`${listId}-opt-${index}`}
                        role="option"
                        className={`ui-combobox-option ${selected ? "is-active" : ""}`}
                        aria-selected={selected}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => selectIndex(index)}
                      >
                        {opt.label}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </Field>
  );
}

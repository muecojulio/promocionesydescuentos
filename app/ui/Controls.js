"use client";

import { useId, useState } from "react";

export function StatusLive({ message }) {
  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message || ""}
    </div>
  );
}

export function Field({ id, label, hint, children, visuallyHiddenLabel = false }) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="ui-field">
      <label className={visuallyHiddenLabel ? "sr-only" : "ui-field-label"} htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="ui-field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  id,
}) {
  const autoId = useId();
  const switchId = id || autoId;
  return (
    <button
      id={switchId}
      type="button"
      className={`ui-switch ${checked ? "is-on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
    >
      <span className="ui-switch-track" aria-hidden="true">
        <span className="ui-switch-thumb" />
      </span>
      <span className="ui-switch-text">{label}</span>
    </button>
  );
}

export function Chip({ pressed, onClick, children, disabled = false }) {
  return (
    <button
      type="button"
      className={`ui-chip ${pressed ? "is-pressed" : ""}`}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  className = "",
}) {
  const autoId = useId();
  const btnId = `${autoId}-btn`;
  const panelId = `${autoId}-panel`;
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = typeof openProp === "boolean";
  const open = isControlled ? openProp : uncontrolled;

  const toggle = () => {
    const next = !open;
    if (!isControlled) setUncontrolled(next);
    onOpenChange?.(next);
  };

  return (
    <div className={`ui-acc ${open ? "is-open" : ""} ${className}`.trim()}>
      <button
        type="button"
        className="ui-acc-btn"
        id={btnId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span>{title}</span>
        <span className="ui-acc-chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      <div
        className="ui-acc-panel"
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        inert={open ? undefined : true}
      >
        <div className="ui-acc-inner">{children}</div>
      </div>
    </div>
  );
}

"use client";

export function Button({
  state = "idle",
  variant = "primary",
  idleLabel,
  loadingLabel,
  successLabel,
  errorLabel,
  children,
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ariaLabel,
  ...rest
}) {
  const busy = state === "loading";
  const isDisabled = disabled || busy;
  const label =
    state === "loading"
      ? loadingLabel ?? idleLabel ?? children
      : state === "success"
        ? successLabel ?? idleLabel ?? children
        : state === "error"
          ? errorLabel ?? idleLabel ?? children
          : idleLabel ?? children;

  const statusText =
    state === "loading"
      ? loadingLabel || "Cargando"
      : state === "success"
        ? successLabel || "Listo"
        : state === "error"
          ? errorLabel || "Error"
          : undefined;

  return (
    <button
      type={type}
      className={`ui-btn ui-btn-${variant} is-${state} ${className}`.trim()}
      disabled={isDisabled}
      aria-busy={busy || undefined}
      aria-disabled={isDisabled || undefined}
      aria-label={ariaLabel}
      onClick={isDisabled ? undefined : onClick}
      {...rest}
    >
      {state === "loading" ? (
        <span className="ui-btn-spinner" aria-hidden="true" />
      ) : state === "success" ? (
        <span className="ui-btn-status" aria-hidden="true">
          ✓
        </span>
      ) : state === "error" ? (
        <span className="ui-btn-status" aria-hidden="true">
          !
        </span>
      ) : null}
      <span className="ui-btn-label">{label}</span>
      {statusText && state !== "idle" ? (
        <span className="sr-only">{statusText}</span>
      ) : null}
    </button>
  );
}

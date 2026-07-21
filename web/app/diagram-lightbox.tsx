"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DiagramLightboxProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function DiagramLightbox({ title, children, onClose }: DiagramLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1) ?? first;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      className="diagram-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="diagram-lightbox-bar">
        <strong>{title}</strong>
        <button type="button" onClick={onClose} autoFocus>
          关闭大图 ×
        </button>
      </div>
      <div className="diagram-lightbox-viewport">{children}</div>
    </div>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";

type DiagramLightboxProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function DiagramLightbox({ title, children, onClose }: DiagramLightboxProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="diagram-lightbox" role="dialog" aria-modal="true" aria-label={title}>
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

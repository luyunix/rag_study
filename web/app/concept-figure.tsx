"use client";

import { useCallback, useState } from "react";
import { DiagramLightbox } from "./diagram-lightbox";

type ConceptFigureProps = {
  page: number;
  src: string;
};

export function ConceptFigure({ page, src }: ConceptFigureProps) {
  const [expanded, setExpanded] = useState(false);
  const closeExpanded = useCallback(() => setExpanded(false), []);
  const pageLabel = `P${String(page).padStart(3, "0")}`;
  const alt = `${pageLabel} 原创知识图`;

  return (
    <>
      <figure className="concept-figure">
        <figcaption className="figure-label">
          <span>原创知识图</span>
          <div className="diagram-actions">
            <small>{pageLabel}</small>
            <button type="button" onClick={() => setExpanded(true)} aria-label={`放大查看 ${alt}`}>
              放大查看 ↗
            </button>
          </div>
        </figcaption>
        <div className="concept-image-scroll" tabIndex={0}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} />
        </div>
        <p className="diagram-scroll-hint">图中文字较多时，可左右滑动；也可以放大查看。</p>
      </figure>

      {expanded && (
        <DiagramLightbox title={`${pageLabel} 原创知识图`} onClose={closeExpanded}>
          <div className="concept-lightbox-canvas">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} />
          </div>
        </DiagramLightbox>
      )}
    </>
  );
}

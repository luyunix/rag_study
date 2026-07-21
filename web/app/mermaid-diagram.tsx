"use client";

import { useCallback, useEffect, useId, useState, type CSSProperties } from "react";
import { DiagramLightbox } from "./diagram-lightbox";

type MermaidInstance = (typeof import("mermaid"))["default"];

let mermaidPromise: Promise<MermaidInstance> | null = null;

function readableWidthFromSvg(renderedSvg: string) {
  const viewBox = renderedSvg.match(
    /\bviewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+[\d.]+/i,
  );
  const viewBoxWidth = Number(viewBox?.[1]);

  if (!Number.isFinite(viewBoxWidth)) return 720;

  // Mermaid defaults to width: 100%, which can shrink a wide graph until
  // 16px labels become illegible. Keep labels near their designed size and
  // let the existing figure scroll horizontally when the graph is wide.
  return Math.max(720, Math.ceil(viewBoxWidth * 0.92));
}

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        themeVariables: {
          background: "#ffffff",
          primaryColor: "#f3f6f4",
          primaryTextColor: "#292d2a",
          primaryBorderColor: "#6f8f80",
          lineColor: "#6f8f80",
          secondaryColor: "#eef2ef",
          tertiaryColor: "#ffffff",
          fontFamily:
            '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
          fontSize: "18px",
        },
        flowchart: {
          htmlLabels: true,
          curve: "basis",
          padding: 18,
          nodeSpacing: 55,
          rankSpacing: 70,
        },
      });
      return mermaid;
    });
  }

  return mermaidPromise;
}

export function MermaidDiagram({ chart }: { chart: string }) {
  const reactId = useId();
  const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);
  const [readableWidth, setReadableWidth] = useState(720);
  const [expanded, setExpanded] = useState(false);
  const closeExpanded = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    let active = true;

    Promise.resolve()
      .then(() => {
        if (!active) return undefined;
        setSvg("");
        setError(false);
        setReadableWidth(720);
        return loadMermaid();
      })
      .then((mermaid) => {
        if (!mermaid) return undefined;
        return mermaid.render(diagramId, chart);
      })
      .then((result) => {
        if (active && result) {
          const { svg: renderedSvg } = result;
          setReadableWidth(readableWidthFromSvg(renderedSvg));
          setSvg(renderedSvg);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [chart, diagramId]);

  if (error) {
    return (
      <div className="mermaid-error" role="note">
        <strong>这张流程图暂时无法显示</strong>
        <pre>
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  return (
    <>
      <figure
        className={`mermaid-diagram ${svg ? "is-ready" : "is-rendering"}`}
        style={{ "--mermaid-readable-width": `${readableWidth}px` } as CSSProperties}
      >
        {svg && (
          <figcaption className="mermaid-toolbar">
            <span>知识关系流程图</span>
            <button type="button" onClick={() => setExpanded(true)} aria-label="放大查看知识关系流程图">
              放大查看 ↗
            </button>
          </figcaption>
        )}
        <div className="mermaid-scroll" tabIndex={svg ? 0 : undefined}>
          <div
            className="mermaid-canvas"
            role="img"
            aria-label="本节知识关系流程图"
            dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
          />
        </div>
        {svg && <p className="diagram-scroll-hint">图中文字较多时，可左右滑动；也可以放大查看。</p>}
        {!svg && <span className="mermaid-loading">正在绘制知识图…</span>}
      </figure>

      {expanded && svg && (
        <DiagramLightbox title="知识关系流程图" onClose={closeExpanded}>
          <div
            className="mermaid-canvas mermaid-lightbox-canvas"
            role="img"
            aria-label="放大的本节知识关系流程图"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </DiagramLightbox>
      )}
    </>
  );
}

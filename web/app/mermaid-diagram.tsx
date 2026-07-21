"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";

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
        },
        flowchart: {
          htmlLabels: true,
          curve: "basis",
          padding: 18,
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

  useEffect(() => {
    let active = true;

    setSvg("");
    setError(false);
    setReadableWidth(720);

    loadMermaid()
      .then((mermaid) => mermaid.render(diagramId, chart))
      .then(({ svg: renderedSvg }) => {
        if (active) {
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
    <figure
      className={`mermaid-diagram ${svg ? "is-ready" : "is-rendering"}`}
      style={{ "--mermaid-readable-width": `${readableWidth}px` } as CSSProperties}
      tabIndex={svg ? 0 : undefined}
    >
      <div
        className="mermaid-canvas"
        role="img"
        aria-label="本节知识关系流程图"
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
      {!svg && <span className="mermaid-loading">正在绘制知识图…</span>}
    </figure>
  );
}

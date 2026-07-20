"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "./mermaid-diagram";

type CatalogEntry = {
  page: number;
  title: string;
  duration: string;
  url: string;
  stem: string;
  asr_checked: boolean;
};

type Catalog = {
  sections: number;
  duration_seconds: number;
  entries: CatalogEntry[];
};

type Heading = {
  level: number;
  text: string;
  id: string;
};

const chapters = [
  { start: 1, end: 1, dir: "01-course-guide", title: "课程导学", short: "导学" },
  { start: 2, end: 7, dir: "02-rag-foundations", title: "RAG 基础", short: "基础" },
  { start: 8, end: 16, dir: "03-llm-foundations", title: "大模型基础与选型", short: "LLM" },
  { start: 17, end: 23, dir: "04-embeddings", title: "Embedding", short: "向量" },
  { start: 24, end: 31, dir: "05-vector-databases", title: "向量数据库", short: "向量库" },
  { start: 32, end: 38, dir: "06-document-processing", title: "文档解析与分块", short: "文档" },
  { start: 39, end: 44, dir: "07-baseline-rag", title: "企业制度问答 Baseline", short: "Baseline" },
  { start: 45, end: 50, dir: "08-evaluation", title: "RAG 评估", short: "评估" },
  { start: 51, end: 68, dir: "09-advanced-retrieval", title: "高级检索增强", short: "增强" },
  { start: 69, end: 76, dir: "10-graph-rag", title: "Graph RAG", short: "Graph" },
  { start: 77, end: 82, dir: "11-agentic-rag", title: "Agentic RAG", short: "Agent" },
  { start: 83, end: 86, dir: "12-gradio-app", title: "Gradio 整合", short: "应用" },
  { start: 87, end: 87, dir: "13-model-finetuning", title: "模型微调导言", short: "微调" },
  { start: 88, end: 89, dir: "14-course-review", title: "课程总结与面试", short: "总结" },
] as const;

const glossaryByChapter: Record<string, { label: string; text: string }[]> = {
  "02-rag-foundations": [
    { label: "Retrieval", text: "从外部知识库找到与问题相关的证据。" },
    { label: "Augmentation", text: "把证据组织进模型当前上下文。" },
    { label: "Generation", text: "让模型依据证据生成可核查答案。" },
  ],
  "04-embeddings": [
    { label: "Embedding", text: "把查询与文档映射到同一向量空间。" },
    { label: "Recall@k", text: "正确证据是否进入前 k 个召回结果。" },
    { label: "Hard Negative", text: "主题相近但不能回答问题的困难负例。" },
  ],
  "05-vector-databases": [
    { label: "ANN", text: "用近似方法快速寻找相邻向量。" },
    { label: "HNSW", text: "用分层小世界图组织近似近邻搜索。" },
    { label: "Top-k", text: "检索阶段返回的前 k 个候选片段。" },
  ],
  "07-baseline-rag": [
    { label: "Baseline", text: "先跑通、可评测的最小完整 RAG 版本。" },
    { label: "制度DB", text: "课程实战在 Chroma 中使用的集合名。" },
    { label: "拒答", text: "证据不足时明确说不知道，而不是猜测。" },
  ],
  "08-evaluation": [
    { label: "Faithfulness", text: "回答中的陈述是否都能由上下文支持。" },
    { label: "Context Recall", text: "标准答案所需事实是否被完整召回。" },
    { label: "Context Precision", text: "相关上下文是否排在检索结果前部。" },
    { label: "Answer Relevancy", text: "生成答案是否直接回应用户问题。" },
  ],
  "09-advanced-retrieval": [
    { label: "RRF", text: "按排名而非原始分数融合多路检索结果。" },
    { label: "Re-rank", text: "用更精确的模型重新排列召回候选。" },
    { label: "Self-RAG", text: "让系统判断是否检索并检查证据与答案。" },
  ],
};

function chapterFor(page: number) {
  return chapters.find((chapter) => page >= chapter.start && page <= chapter.end) ?? chapters[0];
}

function cleanTitle(title: string) {
  return title.replace(/^\d+-\d+\s*/, "").replace(/：/g, " · ");
}

function headingId(text: string, index = 0) {
  const slug = text
    .toLowerCase()
    .replace(/[`*_:[\]()（）？?]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
  return `${slug || "section"}-${index}`;
}

function extractHeadings(markdown: string): Heading[] {
  let index = 0;
  return markdown
    .split("\n")
    .map((line) => {
      const match = line.match(/^(##|###)\s+(.+)$/);
      if (!match) return null;
      const heading = {
        level: match[1].length,
        text: match[2].replace(/[*`]/g, ""),
        id: headingId(match[2], index),
      };
      index += 1;
      return heading;
    })
    .filter((item): item is Heading => Boolean(item))
    .slice(0, 12);
}

function assetUrl(entry: CatalogEntry, kind: "note" | "asr" | "diagram") {
  const chapter = chapterFor(entry.page);
  const base = `/notes/${chapter.dir}`;
  if (kind === "note") return `${base}/${entry.stem}.md`;
  if (kind === "asr") return `${base}/transcripts/${entry.stem}-ASR.md`;
  return `${base}/diagrams/${entry.stem}-concept.svg`;
}

function MarkdownPre({ children }: { children?: ReactNode }) {
  const child = Children.toArray(children)[0];

  if (
    isValidElement<{ className?: string; children?: ReactNode }>(child) &&
    child.props.className?.split(/\s+/).includes("language-mermaid")
  ) {
    const chart = String(child.props.children ?? "").replace(/\n$/, "");
    return <MermaidDiagram chart={chart} />;
  }

  return <pre>{children}</pre>;
}

export function StudyReader() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [activePage, setActivePage] = useState(48);
  const [expandedChapter, setExpandedChapter] = useState("08-evaluation");
  const [mode, setMode] = useState<"note" | "asr">("note");
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [checks, setChecks] = useState([false, false, false]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = Number(params.get("p"));
    if (initial >= 1 && initial <= 89) setActivePage(initial);

    const stored = window.localStorage.getItem("rag-study-completed");
    if (stored) {
      try {
        setCompleted(new Set(JSON.parse(stored) as number[]));
      } catch {
        setCompleted(new Set());
      }
    }

    fetch("/data/course-catalog.json")
      .then((response) => response.json())
      .then((data: Catalog) => setCatalog(data));
  }, []);

  const activeEntry = catalog?.entries.find((entry) => entry.page === activePage);
  const activeChapter = chapterFor(activePage);

  useEffect(() => {
    setExpandedChapter(activeChapter.dir);
  }, [activeChapter.dir]);

  useEffect(() => {
    if (!activeEntry) return;
    setLoading(true);
    fetch(encodeURI(assetUrl(activeEntry, mode)))
      .then((response) => {
        if (!response.ok) throw new Error("内容加载失败");
        return response.text();
      })
      .then((text) => setMarkdown(text))
      .catch(() => setMarkdown("# 暂时无法读取这一节\n\n请稍后刷新页面重试。"))
      .finally(() => setLoading(false));

    const storedChecks = window.localStorage.getItem(`rag-study-checks-${activeEntry.page}`);
    setChecks(storedChecks ? JSON.parse(storedChecks) : [false, false, false]);
    window.history.replaceState(null, "", `?p=${activeEntry.page}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeEntry, mode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMobileNav(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectPage = useCallback((page: number) => {
    setActivePage(page);
    setMode("note");
    setSearch("");
    setSearchOpen(false);
    setMobileNav(false);
  }, []);

  const filteredEntries = useMemo(() => {
    if (!catalog || !search.trim()) return [];
    const term = search.trim().toLowerCase();
    return catalog.entries
      .filter(
        (entry) =>
          entry.title.toLowerCase().includes(term) ||
          entry.stem.toLowerCase().includes(term) ||
          `p${entry.page}`.includes(term),
      )
      .slice(0, 10);
  }, [catalog, search]);

  const headings = useMemo(() => extractHeadings(markdown), [markdown]);
  const glossary = glossaryByChapter[activeChapter.dir] ?? [
    { label: activeChapter.short, text: `本章围绕“${activeChapter.title}”建立完整知识链。` },
    { label: "校正版", text: "正文按原声顺序重写，并修正语音识别中的技术术语。" },
    { label: "完整 ASR", text: "保留逐段时间戳，用于核对老师的原始讲解。" },
  ];

  const totalMinutes = catalog ? Math.round(catalog.duration_seconds / 60) : 823;
  const progress = catalog ? Math.round((completed.size / catalog.sections) * 100) : 0;

  const toggleComplete = () => {
    const next = new Set(completed);
    if (next.has(activePage)) next.delete(activePage);
    else next.add(activePage);
    setCompleted(next);
    window.localStorage.setItem("rag-study-completed", JSON.stringify([...next]));
  };

  const toggleCheck = (index: number) => {
    const next = checks.map((checked, itemIndex) => (index === itemIndex ? !checked : checked));
    setChecks(next);
    window.localStorage.setItem(`rag-study-checks-${activePage}`, JSON.stringify(next));
  };

  const onMarkdownLink = (event: MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (!href || href.startsWith("http")) return;
    const page = Number(href.match(/p(\d{3})/)?.[1]);
    if (page) {
      event.preventDefault();
      selectPage(page);
    }
  };

  const markdownBase = activeEntry ? `/notes/${activeChapter.dir}/` : "/";
  let headingIndex = 0;

  return (
    <div className="reader-shell">
      <header className="topbar">
        <button
          className="menu-button"
          onClick={() => setMobileNav((open) => !open)}
          aria-label="打开课程目录"
        >
          目录
        </button>
        <a className="brand" href="?p=1" onClick={(event) => { event.preventDefault(); selectPage(1); }}>
          <span className="brand-mark">R</span>
          <span>
            <strong>RAG Study</strong>
            <small>从原理到企业级实践</small>
          </span>
        </a>

        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            ref={searchRef}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="搜索章节、概念或 P 编号"
            aria-label="搜索课程"
          />
          <kbd>⌘ K</kbd>
          {searchOpen && search && (
            <div className="search-results">
              {filteredEntries.length ? (
                filteredEntries.map((entry) => (
                  <button key={entry.page} onClick={() => selectPage(entry.page)}>
                    <span>P{String(entry.page).padStart(3, "0")}</span>
                    <strong>{cleanTitle(entry.title)}</strong>
                    <small>{entry.duration}</small>
                  </button>
                ))
              ) : (
                <p>没有找到匹配课程</p>
              )}
            </div>
          )}
        </div>

        <div className="top-progress">
          <span>{completed.size} / {catalog?.sections ?? 89} 已完成</span>
          <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
          <strong>{progress}%</strong>
        </div>
      </header>

      <div className="reader-layout">
        <aside className={`course-sidebar ${mobileNav ? "is-open" : ""}`}>
          <div className="sidebar-summary">
            <span>完整课程</span>
            <strong>14 章 · 89 节</strong>
            <small>约 {Math.floor(totalMinutes / 60)} 小时 {totalMinutes % 60} 分钟</small>
          </div>
          <nav aria-label="课程章节">
            {chapters.map((chapter, index) => {
              const chapterEntries =
                catalog?.entries.filter(
                  (entry) => entry.page >= chapter.start && entry.page <= chapter.end,
                ) ?? [];
              const doneCount = chapterEntries.filter((entry) => completed.has(entry.page)).length;
              const active = chapter.dir === activeChapter.dir;
              const expanded = chapter.dir === expandedChapter;
              return (
                <div className={`chapter-group ${active ? "active" : ""}`} key={chapter.dir}>
                  <button
                    className="chapter-button"
                    onClick={() => setExpandedChapter(expanded ? "" : chapter.dir)}
                  >
                    <span className="chapter-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="chapter-title">
                      <strong>{chapter.title}</strong>
                      <small>{chapterEntries.length} 节</small>
                    </span>
                    <span className="chapter-done">{doneCount || ""}</span>
                  </button>
                  {expanded && (
                    <div className="section-list">
                      {chapterEntries.map((entry) => (
                        <button
                          key={entry.page}
                          className={entry.page === activePage ? "selected" : ""}
                          onClick={() => selectPage(entry.page)}
                        >
                          <span className={completed.has(entry.page) ? "lesson-dot done" : "lesson-dot"} />
                          <span>
                            <strong>P{String(entry.page).padStart(3, "0")}</strong>
                            {cleanTitle(entry.title)}
                          </span>
                          <small>{entry.duration}</small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            <span>本地学习进度</span>
            <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
            <small>进度仅保存在当前浏览器</small>
          </div>
        </aside>

        {mobileNav && <button className="nav-scrim" aria-label="关闭目录" onClick={() => setMobileNav(false)} />}

        <main className="reading-pane">
          <div className="breadcrumb">
            <span>第 {chapters.indexOf(activeChapter) + 1} 章</span>
            <i />
            <span>{activeChapter.title}</span>
            <i />
            <strong>P{String(activePage).padStart(3, "0")}</strong>
          </div>

          <section className="article-hero">
            <div className="eyebrow">
              <span>校正版学习稿</span>
              <span>{activeEntry?.duration ?? "—"}</span>
              <span>{activeEntry?.asr_checked ? "已核对音轨" : "待核对"}</span>
            </div>
            <h1>{activeEntry ? cleanTitle(activeEntry.title) : "正在载入课程目录"}</h1>
            <p>
              先读通顺的概念讲解，再用原创知识图建立结构；需要核对老师原话时，
              随时切换到带时间戳的完整 ASR。
            </p>
            <div className="hero-actions">
              <button className={completed.has(activePage) ? "complete-button completed" : "complete-button"} onClick={toggleComplete}>
                {completed.has(activePage) ? "✓ 已完成本节" : "标记为已完成"}
              </button>
              {activeEntry && (
                <a href={activeEntry.url} target="_blank" rel="noreferrer">
                  打开原视频 ↗
                </a>
              )}
            </div>
          </section>

          <div className="content-toolbar">
            <div className="mode-tabs" role="tablist" aria-label="阅读模式">
              <button className={mode === "note" ? "active" : ""} onClick={() => setMode("note")}>
                精读笔记
              </button>
              <button className={mode === "asr" ? "active" : ""} onClick={() => setMode("asr")}>
                语音转写 ASR
              </button>
            </div>
            <span>{mode === "note" ? "术语已校正 · 按视频顺序" : "原始识别 · 带时间戳"}</span>
          </div>

          {mode === "note" && activeEntry && (
            <figure className="concept-figure">
              <div className="figure-label">
                <span>原创知识图</span>
                <small>P{String(activePage).padStart(3, "0")}</small>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={encodeURI(assetUrl(activeEntry, "diagram"))} alt={`P${activePage} 原创知识图`} />
            </figure>
          )}

          <article className={`markdown-body ${loading ? "is-loading" : ""}`}>
            {loading ? (
              <div className="reading-loader">
                <span />
                <span />
                <span />
                <p>正在翻到这一节…</p>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: MarkdownPre,
                  h1: ({ children }) => <h2 className="source-title">{children}</h2>,
                  h2: ({ children }) => {
                    const id = headings[headingIndex]?.id ?? headingId(String(children), headingIndex);
                    headingIndex += 1;
                    return <h2 id={id}>{children}</h2>;
                  },
                  h3: ({ children }) => {
                    const id = headings[headingIndex]?.id ?? headingId(String(children), headingIndex);
                    headingIndex += 1;
                    return <h3 id={id}>{children}</h3>;
                  },
                  a: ({ href, children }) => (
                    <a
                      href={href?.startsWith("./") ? `${markdownBase}${href.slice(2)}` : href}
                      onClick={(event) => onMarkdownLink(event, href)}
                      target={href?.startsWith("http") ? "_blank" : undefined}
                      rel={href?.startsWith("http") ? "noreferrer" : undefined}
                    >
                      {children}
                    </a>
                  ),
                  img: ({ src, alt }) => {
                    const resolved = src?.startsWith("./")
                      ? `${markdownBase}${src.slice(2)}`
                      : src;
                    // The dedicated figure above provides a larger, captioned version.
                    if (resolved?.includes("-concept.svg")) return null;
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img src={resolved} alt={alt ?? ""} />;
                  },
                  code: ({ className, children }) => {
                    const language = className?.replace("language-", "") || "text";
                    return (
                      <code className={className} data-language={language}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {markdown}
              </ReactMarkdown>
            )}
          </article>

          <section className="lesson-check">
            <div>
              <span className="section-kicker">读完检查</span>
              <h2>把“看懂了”变成能说出来</h2>
            </div>
            {[
              "我能不看视频解释本节核心概念",
              "我能指出它在 RAG 数据流中的位置",
              "我核对了原创图或完整 ASR",
            ].map((label, index) => (
              <label key={label}>
                <input type="checkbox" checked={checks[index]} onChange={() => toggleCheck(index)} />
                <span>{label}</span>
              </label>
            ))}
          </section>

          <nav className="lesson-pagination" aria-label="上一节和下一节">
            <button disabled={activePage <= 1} onClick={() => selectPage(activePage - 1)}>
              <small>上一节</small>
              <strong>← P{String(Math.max(1, activePage - 1)).padStart(3, "0")}</strong>
            </button>
            <button disabled={activePage >= 89} onClick={() => selectPage(activePage + 1)}>
              <small>下一节</small>
              <strong>P{String(Math.min(89, activePage + 1)).padStart(3, "0")} →</strong>
            </button>
          </nav>
        </main>

        <aside className="reading-aside">
          <section>
            <span className="aside-kicker">ON THIS PAGE</span>
            <h2>本页目录</h2>
            <nav>
              {headings.length ? (
                headings.map((heading) => (
                  <button
                    key={heading.id}
                    className={heading.level === 3 ? "nested" : ""}
                    onClick={() => document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" })}
                  >
                    {heading.text}
                  </button>
                ))
              ) : (
                <small>正在生成目录…</small>
              )}
            </nav>
          </section>

          <section>
            <span className="aside-kicker orange">KEY TERMS</span>
            <h2>本章术语</h2>
            <div className="term-list">
              {glossary.map((term) => (
                <article key={term.label}>
                  <strong>{term.label}</strong>
                  <p>{term.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="next-card">
            <span>学习建议</span>
            <strong>先理解，再核对</strong>
            <p>正文负责讲通概念；原创图负责建立关系；ASR 负责保留原声证据。</p>
            <button onClick={() => setMode(mode === "note" ? "asr" : "note")}>
              切换到{mode === "note" ? "完整 ASR" : "校正版笔记"} →
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

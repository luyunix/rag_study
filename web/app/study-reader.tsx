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
import { ConceptFigure } from "./concept-figure";
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

type TeacherParagraph = {
  start: number;
  end: number;
  text: string;
};

type TeacherSection = {
  title: string;
  time: string;
  paragraphs: TeacherParagraph[];
};

type TeacherTranscript = {
  sections: TeacherSection[];
  omittedSegments: number;
};

type SearchIndexEntry = {
  page: number;
  title: string;
  stem: string;
  text: string;
};

type SearchResult = {
  entry: CatalogEntry;
  snippet: string;
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
  "01-course-guide": [
    { label: "学习主线", text: "沿数据、检索、生成、评估和工程化逐层搭建完整 RAG 能力。" },
    { label: "可核查", text: "结论能够回到课程原声、代码、数据或检索证据逐项验证。" },
    { label: "学习闭环", text: "理解原理、运行实验、分析坏例，再把结果沉淀为可复用判断。" },
  ],
  "02-rag-foundations": [
    { label: "Retrieval", text: "从外部知识库找到与问题相关的证据。" },
    { label: "Augmentation", text: "把证据组织进模型当前上下文。" },
    { label: "Generation", text: "让模型依据证据生成可核查答案。" },
  ],
  "03-llm-foundations": [
    { label: "Token", text: "模型读取和生成文本时使用的基本计算单位。" },
    { label: "Context Window", text: "一次推理能够接收的 Token 总量上限。" },
    { label: "推理部署", text: "在本地或 API 上运行模型，并平衡效果、时延、成本与合规。" },
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
  "06-document-processing": [
    { label: "Parser", text: "把 PDF、表格、网页等载体还原为结构化内容。" },
    { label: "Chunk", text: "进入索引和检索的最小文档单元。" },
    { label: "Metadata", text: "与片段绑定的来源、页码、标题、时间和权限等信息。" },
  ],
  "07-baseline-rag": [
    { label: "Baseline", text: "先跑通、可评测的最小完整 RAG 版本。" },
    { label: "制度 DB", text: "课程实战在 Chroma 中使用的知识集合。" },
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
  "10-graph-rag": [
    { label: "Entity", text: "知识图谱中具有唯一身份的对象节点。" },
    { label: "Relation", text: "连接实体并表达业务语义的有向边。" },
    { label: "Cypher", text: "Neo4j 用于匹配节点、关系和路径的图查询语言。" },
  ],
  "11-agentic-rag": [
    { label: "Agent", text: "能根据当前状态选择工具、执行动作并继续推理的系统。" },
    { label: "ReAct", text: "交替进行推理与行动，并用观察结果修正下一步。" },
    { label: "Router", text: "依据问题类型把请求分发到合适的数据源或工具。" },
  ],
  "12-gradio-app": [
    { label: "Gradio", text: "用 Python 快速把模型或 Pipeline 封装成可交互界面。" },
    { label: "State", text: "在多轮交互中保存历史消息和页面状态。" },
    { label: "Streaming", text: "边生成边返回内容，缩短用户感知等待时间。" },
  ],
  "13-model-finetuning": [
    { label: "Fine-tuning", text: "用领域数据继续训练模型，使其适应特定任务或表达方式。" },
    { label: "SFT", text: "用输入与理想输出样本进行有监督微调。" },
    { label: "RAG vs 微调", text: "RAG 补充可更新事实，微调更适合改变能力、格式或行为。" },
  ],
  "14-course-review": [
    { label: "端到端", text: "从数据接入、检索、生成、评估直到部署形成完整链路。" },
    { label: "坏例分析", text: "从失败样本反推数据、召回、排序或生成环节的问题。" },
    { label: "项目表达", text: "用目标、方案、取舍、指标和结果讲清一次 RAG 实践。" },
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

function plainMarkdown(value: string) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractConclusion(markdown: string) {
  const match = markdown.match(
    /##\s+这节到底讲什么\s*\n+([\s\S]*?)(?=\n##\s|$)/,
  );
  if (!match) return "先建立本节的核心判断，再沿着老师的推导、案例和边界条件完整理解。";

  const paragraph = match[1]
    .split(/\n\s*\n/)
    .map(plainMarkdown)
    .find((item) => item && !item.startsWith("←"));
  return paragraph || "先建立本节的核心判断，再沿着老师的推导、案例和边界条件完整理解。";
}

function markdownSection(markdown: string, title: string) {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${title}`);
  if (start < 0) return "";
  const next = lines.findIndex((line, index) => index > start && /^##\s+/.test(line));
  return lines.slice(start + 1, next < 0 ? undefined : next).join("\n").trim();
}

function markdownSectionByPattern(markdown: string, pattern: RegExp) {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => {
    const heading = line.match(/^##\s+(.+)$/)?.[1]?.trim();
    return Boolean(heading && pattern.test(heading));
  });
  if (start < 0) return "";
  const next = lines.findIndex((line, index) => index > start && /^##\s+/.test(line));
  return lines.slice(start + 1, next < 0 ? undefined : next).join("\n").trim();
}

function compactSection(markdown: string, pattern: RegExp, fallback: string) {
  const text = plainMarkdown(markdownSectionByPattern(markdown, pattern));
  if (!text) return fallback;
  return text.length > 360 ? `${text.slice(0, 357)}…` : text;
}

function explanationMarkdown(markdown: string) {
  const firstSection = markdown.search(/^##\s+/m);
  if (firstSection < 0) return markdown;

  const sections = markdown
    .slice(firstSection)
    .split(/(?=^##\s+)/m)
    .map((section) => section.trim())
    .filter(Boolean);

  return sections
    .filter((section) => !/^##\s+(完整原声逐段记录|自测|学完检查)\s*$/m.test(section.split("\n")[0]))
    .map((section) => {
      if (!section.startsWith("## 这节到底讲什么")) return section;
      const body = section.replace(/^##\s+这节到底讲什么\s*\n+/, "");
      const paragraphs = body.split(/\n\s*\n/).filter((paragraph) => paragraph.trim());
      const expanded = paragraphs.slice(1);
      return expanded.length ? `## 先把结论讲透\n\n${expanded.join("\n\n")}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function numberedItems(markdown: string, title: string) {
  return markdownSection(markdown, title)
    .split("\n")
    .map((line) => line.match(/^\d+\.\s+(.+)$/)?.[1]?.trim())
    .filter((item): item is string => Boolean(item));
}

function checklistItems(markdown: string) {
  return markdownSection(markdown, "学完检查")
    .split("\n")
    .map((line) => line.match(/^-\s+\[[ xX]\]\s+(.+)$/)?.[1]?.trim())
    .filter((item): item is string => Boolean(item));
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

const transcriptCorrections: [RegExp, string][] = [
  [/\b(?:IG-AS|IGAS|RAG-AS)\b/gi, "Ragas"],
  [/\bIG\b/g, "RAG"],
  [/大[远原圆员业]模型/g, "大语言模型"],
  [/删下文|善下文|善加文|上下完/g, "上下文"],
  [/中时性|中石性|中实性|中程度/g, "忠实性"],
  [/减锁/g, "检索"],
  [/招回|招肥|招呼/g, "召回"],
  [/孕妇/g, "用户"],
  [/生存/g, "生成"],
  [/Inventive|inbattery/gi, "Embedding"],
  [/Jensen/gi, "JSON"],
  [/数据级|数据机|data-side/gi, "数据集"],
  [/GT关注|关注标准答案|官处标准答案/g, "ground truth 标准答案"],
  [/寒浮其持/g, "含糊其辞"],
  [/余选相似度|逾选相似度/g, "余弦相似度"],
  [/闯入/g, "传入"],
  [/便利问题列表/g, "遍历问题列表"],
];

function cleanTranscriptText(text: string) {
  return transcriptCorrections
    .reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text)
    .replace(/\s+/g, " ")
    .replace(/\s+([，。！？；：])/g, "$1")
    .trim();
}

function transcriptSeconds(value: string) {
  const [hours, minutes, seconds] = value.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function displayTranscriptTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function isTranscriptNoise(text: string) {
  if (!text || text.includes("�")) return true;

  const phrases = text
    .split(/[，。！？；、]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (phrases.length >= 8 && new Set(phrases).size / phrases.length < 0.35) return true;

  const words = text.toLowerCase().match(/[a-z][a-z0-9-]*/g) ?? [];
  if (words.length >= 10) {
    const counts = new Map<string, number>();
    words.forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
    if (Math.max(...counts.values()) / words.length > 0.55) return true;
  }

  return false;
}

function joinTranscriptText(left: string, right: string) {
  if (!left) return right;
  return /[。！？；：]$/.test(left) ? `${left}${right}` : `${left}；${right}`;
}

function extractTeacherTranscript(asr: string, requestedTitles: string[]): TeacherTranscript {
  const segments: TeacherParagraph[] = [];
  let currentStart = 0;
  let currentEnd = 0;
  let started = false;
  let omittedSegments = 0;

  for (const rawLine of asr.split("\n")) {
    const line = rawLine.trim();
    const timestamp = line.match(
      /^##\s+(\d{2}:\d{2}:\d{2})[–-](\d{2}:\d{2}:\d{2})/,
    );

    if (timestamp) {
      started = true;
      currentStart = transcriptSeconds(timestamp[1]);
      currentEnd = transcriptSeconds(timestamp[2]);
      continue;
    }

    if (!started || !line || line.startsWith("#") || line.startsWith(">")) continue;
    const text = cleanTranscriptText(line);
    if (isTranscriptNoise(text)) {
      omittedSegments += 1;
      continue;
    }
    segments.push({ start: currentStart, end: currentEnd, text });
  }

  const paragraphs: TeacherParagraph[] = [];
  let block: TeacherParagraph | null = null;

  for (const segment of segments) {
    if (!block) {
      block = { ...segment };
      continue;
    }

    if (block.text.length < 300) {
      block.text = joinTranscriptText(block.text, segment.text);
      block.end = segment.end;
    } else {
      paragraphs.push(block);
      block = { ...segment };
    }
  }

  if (block) paragraphs.push(block);

  if (!paragraphs.length) return { sections: [], omittedSegments };

  const fallbackTitles = [
    "先交代问题、目标与背景",
    "接着拆解方法和实现过程",
    "再用例子验证关键判断",
    "最后说明结果、限制与下一步",
  ];
  const titles = requestedTitles
    .map((title) => title.replace(/^\d+[.、]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
  const sectionCount = Math.min(
    paragraphs.length,
    Math.max(3, Math.min(5, titles.length || fallbackTitles.length)),
  );
  const sections = Array.from({ length: sectionCount }, (_, index) => {
    const startIndex = Math.floor((index * paragraphs.length) / sectionCount);
    const endIndex = Math.floor(((index + 1) * paragraphs.length) / sectionCount);
    const sectionParagraphs = paragraphs.slice(startIndex, endIndex);
    const first = sectionParagraphs[0];
    const last = sectionParagraphs.at(-1) ?? first;
    return {
      title: titles[index] ?? fallbackTitles[index] ?? `第 ${index + 1} 段讲解`,
      time: `${displayTranscriptTime(first.start)}–${displayTranscriptTime(last.end)}`,
      paragraphs: sectionParagraphs,
    };
  });

  return { sections, omittedSegments };
}

function searchSnippet(text: string, term: string) {
  if (!text) return "";
  const normalized = text.toLowerCase();
  const index = normalized.indexOf(term);
  if (index < 0) return "";
  const start = Math.max(0, index - 34);
  const end = Math.min(text.length, index + term.length + 72);
  return `${start ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

export function StudyReader() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [expandedChapter, setExpandedChapter] = useState("01-course-guide");
  const [mode, setMode] = useState<"note" | "asr">("note");
  const [markdown, setMarkdown] = useState("");
  const [noteMarkdown, setNoteMarkdown] = useState("");
  const [teacherTranscript, setTeacherTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchIndexEntry[] | null>(null);
  const [searchIndexLoading, setSearchIndexLoading] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [checks, setChecks] = useState([false, false, false]);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchIndexPromise = useRef<Promise<SearchIndexEntry[]> | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const initial = Number(params.get("p"));
      const storedPage = Number(window.localStorage.getItem("rag-study-last-page"));
      const restoredPage = initial >= 1 && initial <= 89
        ? initial
        : storedPage >= 1 && storedPage <= 89
          ? storedPage
          : 1;
      setActivePage(restoredPage);
      setExpandedChapter(chapterFor(restoredPage).dir);

      const stored = window.localStorage.getItem("rag-study-completed");
      if (stored) {
        try {
          setCompleted(new Set(JSON.parse(stored) as number[]));
        } catch {
          setCompleted(new Set());
        }
      }
    });

    fetch("/data/course-catalog.json")
      .then((response) => response.json())
      .then((data: Catalog) => setCatalog(data));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const activeEntry = catalog?.entries.find((entry) => entry.page === activePage);
  const activeChapter = chapterFor(activePage);

  const ensureSearchIndex = useCallback(() => {
    if (searchIndex || searchIndexPromise.current) return;
    setSearchIndexLoading(true);
    searchIndexPromise.current = fetch("/data/course-search.json")
      .then((response) => {
        if (!response.ok) throw new Error("全文索引加载失败");
        return response.json() as Promise<SearchIndexEntry[]>;
      })
      .then((data) => {
        setSearchIndex(data);
        return data;
      })
      .catch(() => [])
      .finally(() => setSearchIndexLoading(false));
  }, [searchIndex]);

  useEffect(() => {
    if (!activeEntry) return;
    fetch(encodeURI(assetUrl(activeEntry, mode)))
      .then((response) => {
        if (!response.ok) throw new Error("内容加载失败");
        return response.text();
      })
      .then((text) => {
        setMarkdown(text);
        if (mode === "note") setNoteMarkdown(text);
      })
      .catch(() => setMarkdown("# 暂时无法读取这一节\n\n请稍后刷新页面重试。"))
      .finally(() => setLoading(false));

    const storedChecks = window.localStorage.getItem(`rag-study-checks-${activeEntry.page}`);
    queueMicrotask(() => {
      try {
        setChecks(storedChecks ? JSON.parse(storedChecks) : [false, false, false]);
      } catch {
        setChecks([false, false, false]);
      }
    });
    window.localStorage.setItem("rag-study-last-page", String(activeEntry.page));
    window.history.replaceState(null, "", `?p=${activeEntry.page}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeEntry, mode]);

  useEffect(() => {
    if (!activeEntry) return;
    fetch(encodeURI(assetUrl(activeEntry, "asr")))
      .then((response) => {
        if (!response.ok) throw new Error("转写加载失败");
        return response.text();
      })
      .then((text) => setTeacherTranscript(text))
      .catch(() => setTeacherTranscript(""));
  }, [activeEntry]);

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
    setLoading(true);
    setNoteMarkdown("");
    setTeacherTranscript("");
    setActivePage(page);
    setExpandedChapter(chapterFor(page).dir);
    setMode("note");
    setSearch("");
    setSearchOpen(false);
    setMobileNav(false);
  }, []);

  const filteredEntries = useMemo<SearchResult[]>(() => {
    if (!catalog || !search.trim()) return [];
    const term = search.trim().toLowerCase();
    const indexedByPage = new Map(searchIndex?.map((entry) => [entry.page, entry]));
    return catalog.entries
      .map((entry) => {
        const indexed = indexedByPage.get(entry.page);
        const titleMatch =
          entry.title.toLowerCase().includes(term) ||
          entry.stem.toLowerCase().includes(term) ||
          `p${entry.page}`.includes(term);
        const snippet = searchSnippet(indexed?.text ?? "", term);
        return titleMatch || snippet ? { entry, snippet } : null;
      })
      .filter((result): result is SearchResult => Boolean(result))
      .slice(0, 10);
  }, [catalog, search, searchIndex]);

  const lessonMarkdown = noteMarkdown || (mode === "note" ? markdown : "");
  const headings = useMemo(() => extractHeadings(lessonMarkdown), [lessonMarkdown]);
  const conclusion = useMemo(() => extractConclusion(lessonMarkdown), [lessonMarkdown]);
  const logicSteps = useMemo(
    () => {
      const detailedSteps = headings.filter((heading) => heading.level === 3).slice(0, 3);
      if (detailedSteps.length >= 3) return detailedSteps;
      return headings
        .filter(
          (heading) =>
            heading.level === 2 &&
            !/这节到底讲什么|辅助流程图|正文讲解|校正版讲解时间线|完整原声|自测|学完检查/.test(heading.text),
        )
        .slice(0, 3);
    },
    [headings],
  );
  const teacherSectionTitles = useMemo(
    () => headings.filter((heading) => heading.level === 3).map((heading) => heading.text).slice(0, 5),
    [headings],
  );
  const teacherExplanation = useMemo(
    () => extractTeacherTranscript(teacherTranscript, teacherSectionTitles),
    [teacherSectionTitles, teacherTranscript],
  );
  const displayMarkdown = useMemo(
    () => (mode === "note" ? explanationMarkdown(markdown) : markdown),
    [markdown, mode],
  );
  const reviewQuestions = useMemo(
    () => numberedItems(lessonMarkdown, "自测"),
    [lessonMarkdown],
  );
  const projectApplication = useMemo(
    () => compactSection(
      lessonMarkdown,
      /用一个例子|案例|实战|动手|最小可运行代码/,
      "把本节方法放进一个真实问题中，记录输入、召回证据、模型回答和失败样本，再用本节自测检查每一步是否成立。",
    ),
    [lessonMarkdown],
  );
  const projectPitfall = useMemo(
    () => compactSection(
      lessonMarkdown,
      /最容易踩的坑|注意|边界|限制|误区|反例/,
      "不要只看一次演示是否跑通；还要核对证据来源、失败条件和不适用场景，并把坏例留到同一评测集里复测。",
    ),
    [lessonMarkdown],
  );
  const lessonTerms = glossaryByChapter[activeChapter.dir] ?? glossaryByChapter["01-course-guide"];
  const reviewChecklist = useMemo(() => {
    const items = checklistItems(lessonMarkdown);
    return items.length
      ? items
      : [
          "我能不看视频解释本节核心概念",
          "我能指出它在 RAG 数据流中的位置",
          "我核对了原创图或完整 ASR",
        ];
  }, [lessonMarkdown]);
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
    const next = Array.from(
      { length: Math.max(checks.length, reviewChecklist.length, index + 1) },
      (_, itemIndex) => (index === itemIndex ? !checks[itemIndex] : Boolean(checks[itemIndex])),
    );
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
  const headingIds = new Map(headings.map((heading) => [heading.text, heading.id]));

  return (
    <div className="reader-shell course-app">
      <header className="topbar">
        <button
          className="menu-button"
          onClick={() => setMobileNav((open) => !open)}
          aria-label={mobileNav ? "关闭课程目录" : "打开课程目录"}
          aria-expanded={mobileNav}
          aria-controls="course-sidebar"
        >
          <span />
          <span />
          <span />
        </button>
        <a className="brand" href="?p=1" onClick={(event) => { event.preventDefault(); selectPage(1); }}>
          <span className="brand-mark">R</span>
          <span>
            <strong>RAG Study</strong>
            <small>从原理到企业级实践</small>
          </span>
        </a>

        <div className="course-stats" aria-label="课程概况">
          <span>14 个章节</span>
          <span>{catalog?.sections ?? 89} 节课</span>
          <span>约 {Math.floor(totalMinutes / 60)} 小时</span>
        </div>

        <label className="search search-wrap">
          <span className="search-icon" aria-hidden="true" />
          <input
            ref={searchRef}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSearchOpen(true);
              ensureSearchIndex();
            }}
            onFocus={() => {
              setSearchOpen(true);
              ensureSearchIndex();
            }}
            placeholder="搜索标题、正文、术语或 P 编号"
            aria-label="搜索课程"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={searchOpen && Boolean(search)}
            aria-controls="course-search-results"
          />
          {searchOpen && search && (
            <div className="global-search-results" id="course-search-results" role="listbox">
              {filteredEntries.length ? (
                filteredEntries.map(({ entry, snippet }) => (
                  <button
                    key={entry.page}
                    role="option"
                    aria-selected={false}
                    onClick={() => selectPage(entry.page)}
                  >
                    <span className="search-result-code">P{String(entry.page).padStart(3, "0")}</span>
                    <span className="search-result-copy">
                      <strong>{cleanTitle(entry.title)}</strong>
                      {snippet && <small>{snippet}</small>}
                    </span>
                    <small className="search-result-duration">{entry.duration}</small>
                  </button>
                ))
              ) : searchIndexLoading ? (
                <p>正在载入 89 节全文索引…</p>
              ) : (
                <p>没有找到匹配课程</p>
              )}
            </div>
          )}
        </label>

        <div className="header-progress top-progress">
          <span>{progress}%</span>
          <small>已完成</small>
        </div>
      </header>

      <div className="reader-layout workspace">
        <aside
          className={`course-sidebar sidebar ${mobileNav ? "is-open" : ""}`}
          id="course-sidebar"
        >
          <div className="sidebar-intro">
            <div>
              <span className="eyebrow-label">COURSE MAP</span>
              <h2>课程目录</h2>
            </div>
            <div
              className="progress-ring"
              style={{
                background: `conic-gradient(var(--blue) ${progress * 3.6}deg, var(--line) 0deg)`,
              }}
              aria-label={`课程完成度 ${progress}%`}
            >
              <span>{completed.size}</span>
              <small>/ {catalog?.sections ?? 89}</small>
            </div>
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

        <main className="reading-pane reader">
          <div className="breadcrumb">
            <span>第 {chapters.indexOf(activeChapter) + 1} 章</span>
            <i />
            <span>{activeChapter.title}</span>
            <i />
            <strong>P{String(activePage).padStart(3, "0")}</strong>
          </div>

          <header className="article-hero lesson-hero">
            <div className="lesson-meta">
              <span>第 {chapters.indexOf(activeChapter) + 1} 章</span>
              <i />
              <span>{activeChapter.title}</span>
              <i />
              <span>{activeEntry?.duration ?? "—"}</span>
            </div>
            <div className="lesson-title-row">
              <div className="lesson-index">
                <span>LESSON</span>
                <strong>{String(activePage).padStart(2, "0")}</strong>
              </div>
              <div>
                <h1>{activeEntry ? cleanTitle(activeEntry.title) : "正在载入课程目录"}</h1>
                <p>
                  正文按老师的讲解顺序展开，保留推导、例子、反例、补充说明和使用边界。
                </p>
              </div>
            </div>
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
          </header>

          <section className="conclusion-card" id="summary">
            <div className="conclusion-kicker">
              <span>01</span>
              <strong>先看结论</strong>
            </div>
            <blockquote>{conclusion}</blockquote>
          </section>

          <section className="content-section logic-section" id="logic">
            <div className="section-heading">
              <div>
                <span>02 / CORE LOGIC</span>
                <h2>老师怎么一步步讲</h2>
              </div>
              <p>先用三条主线定位，再进入完整解释、案例和边界条件。</p>
            </div>
            <ol className="logic-steps">
              {(logicSteps.length ? logicSteps : headings.slice(0, 3)).map((heading, index) => (
                <li key={heading.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <button
                    type="button"
                    onClick={() => document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" })}
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <div className="content-toolbar">
            <div className="mode-tabs" role="tablist" aria-label="阅读模式">
              <button
                id="note-mode-tab"
                role="tab"
                aria-selected={mode === "note"}
                aria-controls="article"
                className={mode === "note" ? "active" : ""}
                onClick={() => {
                  if (mode === "note") return;
                  setLoading(true);
                  setMode("note");
                }}
              >
                完整讲解
              </button>
              <button
                id="asr-mode-tab"
                role="tab"
                aria-selected={mode === "asr"}
                aria-controls="article"
                className={mode === "asr" ? "active" : ""}
                onClick={() => {
                  if (mode === "asr") return;
                  setLoading(true);
                  setMode("asr");
                }}
              >
                语音转写 ASR
              </button>
            </div>
            <span>{mode === "note" ? "术语已校正 · 保留老师补充说明" : "原始识别 · 带时间戳"}</span>
          </div>

          <section
            className="content-section teacher-article"
            id="article"
            role="tabpanel"
            aria-labelledby={mode === "note" ? "note-mode-tab" : "asr-mode-tab"}
          >
            <div className="section-heading">
              <div>
                <span>03 / FULL EXPLANATION</span>
                <h2>{mode === "note" ? "老师的完整讲解" : "完整语音转写"}</h2>
              </div>
              <p>
                {mode === "note"
                  ? "保留推导、案例、反例、补充判断和使用边界，只删去重复语气词。"
                  : "保留时间戳与原始表达，适合逐句核对老师原声。"}
              </p>
            </div>

            <div className="article-intro">
              <strong>{mode === "note" ? "这部分不是要点复述" : "这部分用于核对原话"}</strong>
              <p>
                {mode === "note"
                  ? "按老师的讲解顺序还原为什么得出结论、用了什么例子、指标之间怎样区分，以及结论在什么条件下成立。"
                  : "ASR 保留完整口头讲解和时间位置；遇到专有名词误识别时，以校正版完整讲解为准。"}
              </p>
            </div>

            <div className={`markdown-body ${loading ? "is-loading" : ""}`}>
              {loading ? (
                <div className="reading-loader">
                  <span />
                  <span />
                  <span />
                  <p>正在翻到这一节…</p>
                </div>
              ) : (
                <>
                  <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre: MarkdownPre,
                    h1: ({ children }) => <h2 className="source-title">{children}</h2>,
                    h2: ({ children }) => {
                      const text = String(children).replace(/[*`]/g, "");
                      const id = headingIds.get(text) ?? headingId(text);
                      return <h2 id={id}>{children}</h2>;
                    },
                    h3: ({ children }) => {
                      const text = String(children).replace(/[*`]/g, "");
                      const id = headingIds.get(text) ?? headingId(text);
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
                      // The dedicated figure below provides a larger, captioned version.
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
                    {displayMarkdown}
                  </ReactMarkdown>

                  {mode === "note" && teacherExplanation.sections.length > 0 && (
                    <section className="teacher-explanation" aria-labelledby="teacher-explanation-title">
                      <div className="teacher-explanation-heading">
                        <span className="section-kicker">按原声补全</span>
                        <h2 id="teacher-explanation-title">老师的补充说明与完整推导</h2>
                        <p>
                          下面按时间段继续还原老师的口头推导、例子、操作细节和补充判断；每段都能回到原声核对。
                        </p>
                      </div>
                      <div className="teacher-transcript-flow">
                        {teacherExplanation.sections.map((section, sectionIndex) => (
                          <section className="teacher-transcript-section" key={`${section.time}-${sectionIndex}`}>
                            <div className="teacher-transcript-section-heading">
                              <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                              <div>
                                <h3>{section.title}</h3>
                                <time>{section.time}</time>
                              </div>
                            </div>
                            {section.paragraphs.map((paragraph, paragraphIndex) => (
                              <p className="teacher-paragraph" key={`${paragraph.start}-${paragraphIndex}`}>
                                <a
                                  href={activeEntry?.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`打开原视频，定位参考时间 ${displayTranscriptTime(paragraph.start)}`}
                                >
                                  {displayTranscriptTime(paragraph.start)}
                                </a>
                                <span>{paragraph.text}</span>
                              </p>
                            ))}
                          </section>
                        ))}
                      </div>
                      <p className="teacher-transcript-note">
                        {teacherExplanation.omittedSegments > 0
                          ? `已跳过 ${teacherExplanation.omittedSegments} 个明显重复或损坏的识别片段；其余内容按原声顺序完整保留。`
                          : "个别专有名词仍可能受原始识别影响；需要逐句确认时，可切换到“语音转写 ASR”。"}
                      </p>
                    </section>
                  )}
                </>
              )}
            </div>
          </section>

          {mode === "note" && activeEntry && (
            <section className="diagram-card" id="diagram">
              <div className="diagram-copy">
                <span className="eyebrow-label">CONCEPT MAP</span>
                <h2>把本节逻辑画出来</h2>
                <p>先看关系，再回到上面的推导、例子和边界条件。</p>
              </div>
              <ConceptFigure page={activePage} src={encodeURI(assetUrl(activeEntry, "diagram"))} />
            </section>
          )}

          {mode === "note" && (
            <section className="project-layer" id="application">
              <div className="section-heading project-layer-heading">
                <div>
                  <span>04 / APPLY &amp; VERIFY</span>
                  <h2>把老师的方法用到项目里</h2>
                </div>
                <p>不仅记概念，还要知道怎么落地、在哪些条件下会失效。</p>
              </div>
              <div className="project-layer-grid">
                <article className="application-card">
                  <span>PROJECT USE</span>
                  <h3>这一节可以怎么用</h3>
                  <p>{projectApplication}</p>
                </article>
                <article className="pitfall-card">
                  <span>WATCH OUT</span>
                  <h3>老师提醒的边界与坑</h3>
                  <p>{projectPitfall}</p>
                </article>
              </div>
            </section>
          )}

          {mode === "note" && (
            <section className="terms-section" id="terms">
              <div className="section-heading terms-heading">
                <div>
                  <span>05 / KEY TERMS</span>
                  <h2>关键术语与判断边界</h2>
                </div>
                <p>先用一句话说准，再回到完整讲解确认它与相近概念的区别。</p>
              </div>
              <div className="lesson-term-grid">
                {lessonTerms.map((term) => (
                  <article key={term.label}>
                    <strong>{term.label}</strong>
                    <p>{term.text}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="lesson-check review-card" id="review">
            <div className="review-header">
              <div className="review-heading">
                <span className="section-kicker">06 / REVIEW</span>
                <h2>学完自测</h2>
                <p>能讲清、能判断、能行动，才算真的学会。</p>
              </div>
              <div className="check-count">
                <strong>{checks.filter(Boolean).length}</strong>
                <span>/ {reviewChecklist.length}</span>
              </div>
            </div>
            {reviewQuestions.length > 0 && (
              <ol className="self-test">
                {reviewQuestions.map((question, index) => (
                  <li key={question}>
                    <span>{index + 1}</span>
                    <p>{question}</p>
                  </li>
                ))}
              </ol>
            )}
            <div className="checklist">
              {reviewChecklist.map((label, index) => (
                <label key={label}>
                  <input type="checkbox" checked={Boolean(checks[index])} onChange={() => toggleCheck(index)} />
                  <span className="custom-check" aria-hidden="true">✓</span>
                  <span>{label}</span>
                </label>
              ))}
            </div>
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

        <aside className="reading-aside outline" aria-label="本页目录">
          <span className="eyebrow-label">ON THIS PAGE</span>
          <nav>
            {[
              ["summary", "先看结论"],
              ["logic", "老师怎么讲"],
              ["article", mode === "note" ? "完整讲解" : "语音转写"],
              ...(mode === "note" ? [["diagram", "概念图"]] : []),
              ...(mode === "note" ? [["application", "用在项目里"]] : []),
              ...(mode === "note" ? [["terms", "关键术语"]] : []),
              ["review", "学完自测"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                <span />
                {label}
              </a>
            ))}
          </nav>
          <div className="outline-note">
            <span>学习提示</span>
            <p>先抓主线，再读完整解释、案例和老师的补充判断；概念图用于最后串起关系。</p>
          </div>
          <div className="mini-progress">
            <span>课程进度</span>
            <strong>{progress}%</strong>
            <div><i style={{ width: `${progress}%` }} /></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

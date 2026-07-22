import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/?p=48", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the RAG Study reader", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /RAG Study/);
  assert.match(html, /89 节完整学习笔记/);
  assert.match(html, /搜索标题、正文、术语或 P 编号/);
  assert.match(html, /完整讲解/);
  assert.match(html, /先看结论/);
  assert.match(html, /老师怎么一步步讲/);
  assert.match(html, /把本节方法用到项目里/);
  assert.match(html, /关键术语与判断边界/);
  assert.match(html, /学完自测/);
  assert.match(html, /保留推导、例子、(?:反例、)?补充说明和使用边界/);
  assert.match(html, /语音转写 ASR/);
  assert.match(html, /role="tab"/);
  assert.match(html, /role="tabpanel"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("ships the complete course assets and bespoke metadata", async () => {
  const [catalog, packageJson, layout] = await Promise.all([
    readFile(new URL("public/data/course-catalog.json", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);

  assert.equal(JSON.parse(catalog).entries.length, 89);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(layout, /og\.png/);

  await Promise.all([
    access(new URL("public/og.png", root)),
    access(
      new URL(
        "public/notes/08-evaluation/p048-RAG评价神器-Ragas框架.md",
        root,
      ),
    ),
    access(
      new URL(
        "public/notes/08-evaluation/transcripts/p048-RAG评价神器-Ragas框架-ASR.md",
        root,
      ),
    ),
    access(
      new URL(
        "public/notes/08-evaluation/diagrams/p048-RAG评价神器-Ragas框架-concept.svg",
        root,
      ),
    ),
  ]);
});

test("keeps Mermaid labels readable inside article typography", async () => {
  const [component, lightbox, styles] = await Promise.all([
    readFile(new URL("app/mermaid-diagram.tsx", root), "utf8"),
    readFile(new URL("app/diagram-lightbox.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(component, /--mermaid-readable-width/);
  assert.match(component, /IntersectionObserver/);
  assert.match(styles, /width:\s*max\(100%,\s*var\(--mermaid-readable-width/);
  assert.match(styles, /\.mermaid-canvas\s+\.nodeLabel p/);
  assert.match(styles, /line-height:\s*1\.45/);
  assert.match(lightbox, /previousFocus\?\.focus/);
  assert.match(lightbox, /event\.key !== "Tab"/);
});

test("indexes every lesson body and restores a sensible reading position", async () => {
  const [searchJson, reader, packageJson, graphLesson] = await Promise.all([
    readFile(new URL("public/data/course-search.json", root), "utf8"),
    readFile(new URL("app/study-reader.tsx", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
    readFile(
      new URL(
        "public/notes/10-graph-rag/p075-实战-利用Graph-RAG构建金融智库知识库应用.md",
        root,
      ),
      "utf8",
    ),
  ]);
  const searchIndex = JSON.parse(searchJson);

  assert.equal(searchIndex.length, 89);
  assert.match(searchIndex.find((entry) => entry.page === 48).text, /Context Precision/);
  assert.match(searchIndex.find((entry) => entry.page === 75).text, /图数据库|图查询/);
  assert.match(reader, /const \[activePage, setActivePage\] = useState\(1\)/);
  assert.match(reader, /rag-study-last-page/);
  assert.match(reader, /正常阅读只展示人工整理的校正版讲解/);
  assert.match(reader, /不作为事实依据；请以同节校正版完整讲解为准/);
  assert.doesNotMatch(reader, /extractTeacherTranscript/);
  assert.doesNotMatch(reader, /老师的补充说明与完整推导/);
  assert.match(reader, /glossaryByChapter/);
  assert.match(reader, /需要注意的边界与坑/);
  assert.doesNotMatch(searchIndex.find((entry) => entry.page === 48).text, /GPXGO|删下文/);
  assert.match(packageJson, /"prebuild": "npm run content:index"/);
  assert.match(graphLesson, /节点类型对齐/);
  assert.match(graphLesson, /query_level/);
  assert.match(graphLesson, /单跳、公司分析和多跳关系/);
});

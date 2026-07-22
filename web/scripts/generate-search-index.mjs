import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");

const chapters = [
  { start: 1, end: 1, dir: "01-course-guide" },
  { start: 2, end: 7, dir: "02-rag-foundations" },
  { start: 8, end: 16, dir: "03-llm-foundations" },
  { start: 17, end: 23, dir: "04-embeddings" },
  { start: 24, end: 31, dir: "05-vector-databases" },
  { start: 32, end: 38, dir: "06-document-processing" },
  { start: 39, end: 44, dir: "07-baseline-rag" },
  { start: 45, end: 50, dir: "08-evaluation" },
  { start: 51, end: 68, dir: "09-advanced-retrieval" },
  { start: 69, end: 76, dir: "10-graph-rag" },
  { start: 77, end: 82, dir: "11-agentic-rag" },
  { start: 83, end: 86, dir: "12-gradio-app" },
  { start: 87, end: 87, dir: "13-model-finetuning" },
  { start: 88, end: 89, dir: "14-course-review" },
];

function chapterFor(page) {
  return chapters.find((chapter) => page >= chapter.start && page <= chapter.end);
}

function plainText(markdown) {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^```[^\n]*$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_>#|~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const catalogPath = path.join(publicRoot, "data", "course-catalog.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));

const index = await Promise.all(
  catalog.entries.map(async (entry) => {
    const chapter = chapterFor(entry.page);
    if (!chapter) throw new Error(`Missing chapter mapping for P${entry.page}`);

    const lessonDir = path.join(publicRoot, "notes", chapter.dir);
    const note = await readFile(path.join(lessonDir, `${entry.stem}.md`), "utf8");

    return {
      page: entry.page,
      title: entry.title,
      stem: entry.stem,
      // Search the manually curated lesson only. Raw ASR remains available in
      // its own tab, but indexing it would surface known recognition errors as
      // if they were verified terminology.
      text: plainText(note),
    };
  }),
);

await writeFile(
  path.join(publicRoot, "data", "course-search.json"),
  `${JSON.stringify(index)}\n`,
  "utf8",
);

console.log(`Generated full-text search index for ${index.length} lessons.`);

#!/usr/bin/env python3
"""Project-specific completeness audit for the 89-lesson RAG study site."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
PUBLIC_NOTES = WEB / "public" / "notes"
SOURCE_NOTES = ROOT / "notes"

CHAPTERS = (
    (1, 1, "01-course-guide"),
    (2, 7, "02-rag-foundations"),
    (8, 16, "03-llm-foundations"),
    (17, 23, "04-embeddings"),
    (24, 31, "05-vector-databases"),
    (32, 38, "06-document-processing"),
    (39, 44, "07-baseline-rag"),
    (45, 50, "08-evaluation"),
    (51, 68, "09-advanced-retrieval"),
    (69, 76, "10-graph-rag"),
    (77, 82, "11-agentic-rag"),
    (83, 86, "12-gradio-app"),
    (87, 87, "13-model-finetuning"),
    (88, 89, "14-course-review"),
)


def chapter_for(page: int) -> str:
    for start, end, directory in CHAPTERS:
        if start <= page <= end:
            return directory
    raise AssertionError(f"P{page:03d}: missing chapter mapping")


def seconds(value: str) -> int:
    parts = [int(item) for item in value.split(":")]
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    return parts[0] * 3600 + parts[1] * 60 + parts[2]


def visible_characters(markdown: str) -> int:
    text = re.sub(r"!\[[^]]*]\([^)]+\)", "", markdown)
    text = re.sub(r"\[([^]]+)]\([^)]+\)", r"\1", text)
    text = re.sub(r"[`*_>#|\s]", "", text)
    return len(text)


def main() -> int:
    errors: list[str] = []
    catalog = json.loads((WEB / "public" / "data" / "course-catalog.json").read_text())
    search_index = json.loads((WEB / "public" / "data" / "course-search.json").read_text())
    entries = catalog["entries"]

    if len(entries) != 89:
        errors.append(f"catalog: expected 89 lessons, found {len(entries)}")
    if [entry["page"] for entry in entries] != list(range(1, 90)):
        errors.append("catalog: page numbers are not the continuous range P001–P089")
    if len(search_index) != 89:
        errors.append(f"search index: expected 89 lessons, found {len(search_index)}")

    indexed_pages = {entry["page"] for entry in search_index}
    for entry in entries:
        page = entry["page"]
        label = f"P{page:03d}"
        chapter = chapter_for(page)
        stem = entry["stem"]
        public_note = PUBLIC_NOTES / chapter / f"{stem}.md"
        public_asr = PUBLIC_NOTES / chapter / "transcripts" / f"{stem}-ASR.md"
        public_diagram = PUBLIC_NOTES / chapter / "diagrams" / f"{stem}-concept.svg"
        source_note = SOURCE_NOTES / chapter / public_note.name
        source_asr = SOURCE_NOTES / chapter / "transcripts" / public_asr.name
        source_diagram = SOURCE_NOTES / chapter / "diagrams" / public_diagram.name

        for kind, path in (
            ("note", public_note),
            ("ASR", public_asr),
            ("diagram", public_diagram),
            ("source note", source_note),
            ("source ASR", source_asr),
            ("source diagram", source_diagram),
        ):
            if not path.is_file():
                errors.append(f"{label}: missing {kind}: {path.relative_to(ROOT)}")
        if any(not path.is_file() for path in (public_note, public_asr, public_diagram)):
            continue

        note = public_note.read_text()
        asr = public_asr.read_text()
        diagram = public_diagram.read_text()

        if source_note.is_file() and source_note.read_text() != note:
            errors.append(f"{label}: source note and published note differ")
        if source_asr.is_file() and source_asr.read_text() != asr:
            errors.append(f"{label}: source ASR and published ASR differ")
        if source_diagram.is_file() and source_diagram.read_text() != diagram:
            errors.append(f"{label}: source diagram and published diagram differ")

        for heading in ("## 这节到底讲什么", "## 自测", "## 学完检查"):
            if heading not in note:
                errors.append(f"{label}: missing section {heading}")
        detail_headings = len(re.findall(r"^###\s+", note, re.MULTILINE))
        timed_headings = len(re.findall(r"\*\*\d{2}:\d{2}[–-]\d{2}:\d{2}", note))
        if max(detail_headings, timed_headings) < 3:
            errors.append(f"{label}: fewer than three explanatory subsections")
        if visible_characters(note) < 500:
            errors.append(f"{label}: structured note is too short")

        timestamps = re.findall(
            r"^##\s+\d{2}:\d{2}:\d{2}[–-](\d{2}:\d{2}:\d{2})",
            asr,
            re.MULTILINE,
        )
        if not timestamps:
            errors.append(f"{label}: ASR has no timestamped segments")
        else:
            delta = abs(seconds(entry["duration"]) - seconds(timestamps[-1]))
            if delta > 30:
                errors.append(f"{label}: ASR ends {delta}s away from catalog duration")
        if visible_characters(asr) < 300:
            errors.append(f"{label}: ASR transcript is unexpectedly short")

        if "<title>" not in diagram or "<desc>" not in diagram:
            errors.append(f"{label}: concept SVG lacks accessible title/description")
        if 'viewBox="0 0 1200 680"' not in diagram:
            errors.append(f"{label}: concept SVG does not use the readable 1200×680 canvas")
        if re.search(r"#(?:ea580c|c2410c|ffedd5|fff7ed)\b", diagram, re.IGNORECASE):
            errors.append(f"{label}: concept SVG still contains the retired orange palette")
        if page not in indexed_pages:
            errors.append(f"{label}: missing from full-text search index")

    app = (WEB / "app" / "study-reader.tsx").read_text()
    for marker in (
        "老师的补充说明与完整推导",
        "把老师的方法用到项目里",
        "关键术语与判断边界",
        "glossaryByChapter",
        "course-search.json",
        'useState(1)',
        'role="tabpanel"',
        'aria-selected={mode === "note"}',
    ):
        if marker not in app:
            errors.append(f"frontend: missing required behavior marker {marker!r}")

    graph_lesson = (
        PUBLIC_NOTES
        / "10-graph-rag"
        / "p075-实战-利用Graph-RAG构建金融智库知识库应用.md"
    ).read_text()
    for marker in ("节点类型对齐", "query_level", "单跳、公司分析和多跳关系"):
        if marker not in graph_lesson:
            errors.append(f"P075: missing preserved teacher explanation {marker!r}")

    if errors:
        print(f"Course audit failed with {len(errors)} issue(s):", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(
        "Course audit passed: 89 notes, 89 timestamped ASR transcripts, "
        "89 readable concept diagrams, and 89 full-text search records."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

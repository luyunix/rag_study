import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class CatalogTest(unittest.TestCase):
    def test_course_has_every_section_diagram_and_transcript(self):
        catalog = json.loads(
            (ROOT / "sources" / "course-catalog.json").read_text(encoding="utf-8")
        )
        entries = catalog["entries"]
        self.assertEqual(list(range(1, 90)), [entry["page"] for entry in entries])
        self.assertTrue(all(entry["asr_checked"] for entry in entries))

        section_pages = []
        diagrams = []
        transcripts = []
        for chapter in (ROOT / "notes").iterdir():
            if not chapter.is_dir():
                continue
            section_pages.extend(chapter.glob("p[0-9][0-9][0-9]-*.md"))
            diagrams.extend(
                chapter.glob("diagrams/p[0-9][0-9][0-9]-*-concept.svg")
            )
            transcripts.extend(
                chapter.glob("transcripts/p[0-9][0-9][0-9]-*-ASR.md")
            )
        self.assertEqual(89, len(section_pages))
        self.assertEqual(89, len(diagrams))
        self.assertEqual(89, len(transcripts))

    def test_all_local_markdown_links_resolve(self):
        missing = []
        link_pattern = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
        for markdown in ROOT.rglob("*.md"):
            for target in link_pattern.findall(markdown.read_text(encoding="utf-8")):
                if target.startswith(("http://", "https://", "#")):
                    continue
                path = (markdown.parent / target.split("#", 1)[0]).resolve()
                if not path.exists():
                    missing.append(f"{markdown.relative_to(ROOT)} -> {target}")
        self.assertEqual([], missing)

    def test_diagrams_are_section_specific(self):
        contents = []
        for diagram in sorted(ROOT.glob("notes/*/diagrams/p*-concept.svg")):
            text = diagram.read_text(encoding="utf-8")
            self.assertIn("<title>", text)
            self.assertIn("<desc>", text)
            self.assertIn("学完必须能回答", text)
            contents.append(text)
        self.assertEqual(89, len(set(contents)))


if __name__ == "__main__":
    unittest.main()

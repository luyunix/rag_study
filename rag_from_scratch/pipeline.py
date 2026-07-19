"""Baseline RAG：索引、召回、上下文组装、提示词四步闭环。"""

from __future__ import annotations

from typing import Iterable, List

from .chunking import Chunk
from .dense import VectorIndex


class BaselineRAG:
    def __init__(self, chunks: Iterable[Chunk]):
        self.index = VectorIndex()
        self.index.add(chunks)

    def retrieve(self, question: str, k: int = 4):
        return self.index.search(question, k=k)

    def build_prompt(self, question: str, k: int = 4) -> str:
        hits = self.retrieve(question, k=k)
        context_blocks: List[str] = [
            f"[资料 {index} | {hit.chunk.id}]\n{hit.chunk.text}"
            for index, hit in enumerate(hits, start=1)
        ]
        context = "\n\n".join(context_blocks) or "（没有检索到资料）"
        return (
            "你是严谨的知识库问答助手。只根据资料回答；资料不足时明确说不知道。"
            "回答后用 [资料 N] 标注依据。\n\n"
            f"{context}\n\n问题：{question}\n回答："
        )


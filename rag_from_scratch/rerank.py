"""便于观察候选集变化的轻量重排器。"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List

from .chunking import Chunk
from .text import tokenize


@dataclass(frozen=True)
class RerankedHit:
    chunk: Chunk
    score: float


def overlap_rerank(query: str, hits: Iterable[object], limit: int = 5) -> List[RerankedHit]:
    """按查询 token 覆盖率重排；生产中可换 Cross-Encoder。"""

    query_terms = set(tokenize(query))
    results = []
    for hit in hits:
        chunk_terms = set(tokenize(hit.chunk.text))
        coverage = len(query_terms & chunk_terms) / max(1, len(query_terms))
        original_score = float(getattr(hit, "score", 0.0))
        results.append(RerankedHit(hit.chunk, 0.8 * coverage + 0.2 * original_score))
    return sorted(results, key=lambda hit: (-hit.score, hit.chunk.id))[:limit]


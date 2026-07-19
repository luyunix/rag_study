"""多路检索结果融合。"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Iterable, List, Sequence

from .chunking import Chunk


@dataclass(frozen=True)
class FusedHit:
    chunk: Chunk
    score: float
    matched_lists: int


def reciprocal_rank_fusion(
    rankings: Sequence[Iterable[object]], *, k: int = 60, limit: int = 5
) -> List[FusedHit]:
    """用名次而非不可比的原始分数融合 BM25 与向量召回。

    每个 hit 只需暴露 ``.chunk`` 属性。
    """

    if k < 0:
        raise ValueError("RRF 的 k 不能为负数")
    scores = defaultdict(float)
    matches = defaultdict(int)
    chunks = {}
    for ranking in rankings:
        seen = set()
        for rank, hit in enumerate(ranking, start=1):
            chunk = hit.chunk
            if chunk.id in seen:
                continue
            seen.add(chunk.id)
            chunks[chunk.id] = chunk
            scores[chunk.id] += 1.0 / (k + rank)
            matches[chunk.id] += 1
    ordered = sorted(scores, key=lambda chunk_id: (-scores[chunk_id], chunk_id))
    return [
        FusedHit(chunks[chunk_id], scores[chunk_id], matches[chunk_id])
        for chunk_id in ordered[:limit]
    ]


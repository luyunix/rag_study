"""检索评估：先把“相关文档在哪里”量化，再讨论生成质量。"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Dict, Iterable, List, Sequence, Set


@dataclass(frozen=True)
class RetrievalCase:
    query: str
    relevant_ids: Set[str]


def recall_at_k(ranked_ids: Sequence[str], relevant_ids: Set[str], k: int) -> float:
    if not relevant_ids:
        return 1.0
    return len(set(ranked_ids[:k]) & relevant_ids) / len(relevant_ids)


def reciprocal_rank(ranked_ids: Sequence[str], relevant_ids: Set[str]) -> float:
    for rank, chunk_id in enumerate(ranked_ids, start=1):
        if chunk_id in relevant_ids:
            return 1.0 / rank
    return 0.0


def evaluate_retrieval(
    cases: Iterable[RetrievalCase],
    retrieve: Callable[[str, int], Iterable[object]],
    *,
    k: int = 5,
) -> Dict[str, float]:
    recalls: List[float] = []
    reciprocal_ranks: List[float] = []
    for case in cases:
        ranked_ids = [hit.chunk.id for hit in retrieve(case.query, k)]
        recalls.append(recall_at_k(ranked_ids, case.relevant_ids, k))
        reciprocal_ranks.append(reciprocal_rank(ranked_ids, case.relevant_ids))
    return {
        f"recall@{k}": sum(recalls) / len(recalls) if recalls else 0.0,
        "mrr": (
            sum(reciprocal_ranks) / len(reciprocal_ranks)
            if reciprocal_ranks
            else 0.0
        ),
        "cases": float(len(recalls)),
    }


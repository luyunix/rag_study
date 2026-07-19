"""Okapi BM25 稀疏检索的可读实现。"""

from __future__ import annotations

import math
from collections import Counter, defaultdict
from dataclasses import dataclass
from typing import Dict, Iterable, List, Tuple

from .chunking import Chunk
from .text import tokenize


@dataclass(frozen=True)
class SparseHit:
    chunk: Chunk
    score: float


class BM25Index:
    def __init__(self, *, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self._chunks: Dict[str, Chunk] = {}
        self._term_frequencies: Dict[str, Counter[str]] = {}
        self._document_frequency: Counter[str] = Counter()
        self._lengths: Dict[str, int] = {}

    def add(self, chunks: Iterable[Chunk]) -> None:
        for chunk in chunks:
            if chunk.id in self._chunks:
                raise ValueError(f"重复 chunk id: {chunk.id}")
            terms = tokenize(chunk.text)
            counts = Counter(terms)
            self._chunks[chunk.id] = chunk
            self._term_frequencies[chunk.id] = counts
            self._lengths[chunk.id] = len(terms)
            self._document_frequency.update(counts.keys())

    @property
    def average_document_length(self) -> float:
        return (
            sum(self._lengths.values()) / len(self._lengths)
            if self._lengths
            else 0.0
        )

    def _idf(self, term: str) -> float:
        document_count = len(self._chunks)
        frequency = self._document_frequency[term]
        return math.log(1.0 + (document_count - frequency + 0.5) / (frequency + 0.5))

    def search(self, query: str, k: int = 5) -> List[SparseHit]:
        if k <= 0 or not self._chunks:
            return []
        query_terms = set(tokenize(query))
        average_length = self.average_document_length or 1.0
        scores: Dict[str, float] = defaultdict(float)
        for chunk_id, counts in self._term_frequencies.items():
            document_length = self._lengths[chunk_id]
            for term in query_terms:
                frequency = counts[term]
                if not frequency:
                    continue
                denominator = frequency + self.k1 * (
                    1.0 - self.b + self.b * document_length / average_length
                )
                scores[chunk_id] += self._idf(term) * (
                    frequency * (self.k1 + 1.0) / denominator
                )

        ranked: List[Tuple[str, float]] = sorted(
            scores.items(), key=lambda item: (-item[1], item[0])
        )
        return [
            SparseHit(chunk=self._chunks[chunk_id], score=score)
            for chunk_id, score in ranked[:k]
        ]


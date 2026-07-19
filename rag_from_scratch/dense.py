"""确定性的 Hashing Embedding 与精确余弦向量检索。"""

from __future__ import annotations

import hashlib
import math
from dataclasses import dataclass
from typing import Dict, Iterable, List, Sequence, Tuple

from .chunking import Chunk
from .text import tokenize


def cosine_similarity(left: Sequence[float], right: Sequence[float]) -> float:
    if len(left) != len(right):
        raise ValueError("向量维度必须一致")
    left_norm = math.sqrt(sum(value * value for value in left))
    right_norm = math.sqrt(sum(value * value for value in right))
    if not left_norm or not right_norm:
        return 0.0
    return sum(a * b for a, b in zip(left, right)) / (left_norm * right_norm)


class HashingEmbedder:
    """把 token 哈希到固定维度；适合解释接口，不代表语义模型质量。"""

    def __init__(self, dimensions: int = 256):
        if dimensions <= 0:
            raise ValueError("dimensions 必须为正数")
        self.dimensions = dimensions

    def embed(self, text: str) -> List[float]:
        vector = [0.0] * self.dimensions
        for token in tokenize(text):
            digest = hashlib.blake2b(token.encode("utf-8"), digest_size=8).digest()
            bucket = int.from_bytes(digest[:4], "big") % self.dimensions
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            vector[bucket] += sign
        norm = math.sqrt(sum(value * value for value in vector))
        return [value / norm for value in vector] if norm else vector


@dataclass(frozen=True)
class DenseHit:
    chunk: Chunk
    score: float


class VectorIndex:
    """小数据集精确搜索；生产系统通常换成 HNSW/IVF 等近似索引。"""

    def __init__(self, embedder: HashingEmbedder | None = None):
        self.embedder = embedder or HashingEmbedder()
        self._chunks: Dict[str, Chunk] = {}
        self._vectors: Dict[str, List[float]] = {}

    def add(self, chunks: Iterable[Chunk]) -> None:
        for chunk in chunks:
            self._chunks[chunk.id] = chunk
            self._vectors[chunk.id] = self.embedder.embed(chunk.text)

    def search(self, query: str, k: int = 5) -> List[DenseHit]:
        if k <= 0:
            return []
        query_vector = self.embedder.embed(query)
        scored: List[Tuple[str, float]] = [
            (chunk_id, cosine_similarity(query_vector, vector))
            for chunk_id, vector in self._vectors.items()
        ]
        scored.sort(key=lambda item: (-item[1], item[0]))
        return [
            DenseHit(chunk=self._chunks[chunk_id], score=score)
            for chunk_id, score in scored[:k]
        ]


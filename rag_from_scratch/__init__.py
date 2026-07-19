"""只依赖 Python 标准库的教学版 RAG 组件。"""

from .chunking import Chunk, recursive_split
from .dense import HashingEmbedder, VectorIndex
from .evaluation import RetrievalCase, evaluate_retrieval
from .fusion import reciprocal_rank_fusion
from .graph import KnowledgeGraph
from .pipeline import BaselineRAG
from .sparse import BM25Index

__all__ = [
    "BM25Index",
    "BaselineRAG",
    "Chunk",
    "HashingEmbedder",
    "KnowledgeGraph",
    "RetrievalCase",
    "VectorIndex",
    "evaluate_retrieval",
    "reciprocal_rank_fusion",
    "recursive_split",
]


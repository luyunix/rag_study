"""递归字符分块：先尊重文档结构，再满足长度约束。"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Sequence


@dataclass(frozen=True)
class Chunk:
    id: str
    text: str
    metadata: Dict[str, str] = field(default_factory=dict)


def _split_once(text: str, separator: str) -> List[str]:
    if not separator:
        return list(text)
    parts = text.split(separator)
    return [
        part + (separator if index < len(parts) - 1 else "")
        for index, part in enumerate(parts)
        if part
    ]


def _recursive_units(
    text: str, chunk_size: int, separators: Sequence[str], level: int = 0
) -> List[str]:
    if len(text) <= chunk_size:
        return [text]
    if level >= len(separators):
        return [text[index : index + chunk_size] for index in range(0, len(text), chunk_size)]

    units = _split_once(text, separators[level])
    if len(units) == 1:
        return _recursive_units(text, chunk_size, separators, level + 1)

    result: List[str] = []
    for unit in units:
        if len(unit) <= chunk_size:
            result.append(unit)
        else:
            result.extend(_recursive_units(unit, chunk_size, separators, level + 1))
    return result


def _merge_with_overlap(
    units: Iterable[str], chunk_size: int, chunk_overlap: int
) -> List[str]:
    chunks: List[str] = []
    current = ""
    for unit in units:
        if current and len(current) + len(unit) > chunk_size:
            chunks.append(current.strip())
            current = current[-chunk_overlap:] if chunk_overlap else ""
        current += unit
        while len(current) > chunk_size:
            chunks.append(current[:chunk_size].strip())
            current = current[chunk_size - chunk_overlap :]
    if current.strip():
        chunks.append(current.strip())
    return chunks


def recursive_split(
    text: str,
    *,
    source_id: str = "document",
    chunk_size: int = 400,
    chunk_overlap: int = 60,
    separators: Sequence[str] = ("\n\n", "\n", "。", "！", "？", "；", "，", " ", ""),
    metadata: Dict[str, str] | None = None,
) -> List[Chunk]:
    """按结构递归拆分并加入滑动重叠。

    ``chunk_overlap`` 必须小于 ``chunk_size``，否则窗口无法前进。
    """

    if chunk_size <= 0:
        raise ValueError("chunk_size 必须为正数")
    if not 0 <= chunk_overlap < chunk_size:
        raise ValueError("chunk_overlap 必须满足 0 <= overlap < chunk_size")
    if not text.strip():
        return []

    units = _recursive_units(text, chunk_size, separators)
    texts = _merge_with_overlap(units, chunk_size, chunk_overlap)
    base_metadata = dict(metadata or {})
    return [
        Chunk(
            id=f"{source_id}#chunk-{index:04d}",
            text=chunk_text,
            metadata={**base_metadata, "source_id": source_id, "chunk_index": str(index)},
        )
        for index, chunk_text in enumerate(texts)
    ]


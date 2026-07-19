"""面向中英文混合知识库的最小文本处理工具。"""

from __future__ import annotations

import re
import unicodedata
from typing import List


_LATIN_WORD = re.compile(r"[a-z0-9_+#.-]+")
_CJK = re.compile(r"[\u3400-\u9fff]")


def normalize_text(text: str) -> str:
    """统一 Unicode、空白和英文大小写，但保留中文标点语义。"""

    text = unicodedata.normalize("NFKC", text).lower()
    return re.sub(r"\s+", " ", text).strip()


def tokenize(text: str) -> List[str]:
    """零依赖 tokenizer：英文按词，中文同时保留单字与相邻双字。

    这是教学实现，不替代生产环境中的领域分词器。中文双字能让 BM25
    区分“向量数据库”和只包含“数据库”的文档。
    """

    normalized = normalize_text(text)
    tokens = _LATIN_WORD.findall(normalized)
    cjk = _CJK.findall(normalized)
    tokens.extend(cjk)
    tokens.extend(a + b for a, b in zip(cjk, cjk[1:]))
    return tokens


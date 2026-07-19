"""知识三元组与多跳路径检索的最小 Graph RAG 组件。"""

from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass
from typing import DefaultDict, Iterable, List, Set, Tuple


@dataclass(frozen=True)
class Triple:
    subject: str
    predicate: str
    object: str


class KnowledgeGraph:
    def __init__(self, triples: Iterable[Triple | Tuple[str, str, str]] = ()):
        self._outgoing: DefaultDict[str, List[Triple]] = defaultdict(list)
        for triple in triples:
            self.add(triple)

    def add(self, triple: Triple | Tuple[str, str, str]) -> None:
        item = triple if isinstance(triple, Triple) else Triple(*triple)
        self._outgoing[item.subject].append(item)

    def paths_from(self, entity: str, max_hops: int = 2) -> List[List[Triple]]:
        """广度优先返回 1..max_hops 的路径，并避免实体环。"""

        if max_hops <= 0:
            return []
        queue = deque([(entity, [], {entity})])
        paths: List[List[Triple]] = []
        while queue:
            current, path, visited = queue.popleft()
            if len(path) >= max_hops:
                continue
            for triple in self._outgoing.get(current, []):
                new_path = path + [triple]
                paths.append(new_path)
                if triple.object not in visited:
                    queue.append((triple.object, new_path, visited | {triple.object}))
        return paths


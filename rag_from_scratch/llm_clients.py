"""统一封装云端 API、本地兼容服务与可离线测试的模拟模型。"""

from __future__ import annotations

import json
import time
import urllib.request
from dataclasses import dataclass
from typing import Callable, Iterable, Mapping, Protocol, Sequence


Message = Mapping[str, str]


@dataclass(frozen=True)
class ChatResponse:
    text: str
    model: str
    prompt_tokens: int | None
    completion_tokens: int | None
    latency_seconds: float


class ChatClient(Protocol):
    def chat(self, messages: Sequence[Message]) -> ChatResponse:
        """根据 system/user/assistant 消息返回一次完整响应。"""


class OpenAICompatibleClient:
    """调用实现 `/v1/chat/completions` 协议的云端或本地服务。"""

    def __init__(
        self,
        *,
        base_url: str,
        model: str,
        api_key: str = "",
        timeout_seconds: float = 30.0,
        temperature: float = 0.0,
        max_tokens: int = 512,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.api_key = api_key
        self.timeout_seconds = timeout_seconds
        self.temperature = temperature
        self.max_tokens = max_tokens

    def chat(self, messages: Sequence[Message]) -> ChatResponse:
        payload = json.dumps(
            {
                "model": self.model,
                "messages": list(messages),
                "temperature": self.temperature,
                "max_tokens": self.max_tokens,
            }
        ).encode("utf-8")
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        request = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=payload,
            headers=headers,
            method="POST",
        )
        started = time.perf_counter()
        with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
            result = json.loads(response.read().decode("utf-8"))
        latency = time.perf_counter() - started
        usage = result.get("usage", {})
        return ChatResponse(
            text=result["choices"][0]["message"]["content"],
            model=result.get("model", self.model),
            prompt_tokens=usage.get("prompt_tokens"),
            completion_tokens=usage.get("completion_tokens"),
            latency_seconds=latency,
        )


class MockChatClient:
    """无需模型和网络即可练习统一接口与评测记录。"""

    def __init__(self, responder: Callable[[Sequence[Message]], str]) -> None:
        self.responder = responder

    def chat(self, messages: Sequence[Message]) -> ChatResponse:
        started = time.perf_counter()
        text = self.responder(messages)
        return ChatResponse(
            text=text,
            model="mock",
            prompt_tokens=None,
            completion_tokens=None,
            latency_seconds=time.perf_counter() - started,
        )


def benchmark(
    client: ChatClient, cases: Iterable[tuple[str, Sequence[Message]]]
) -> list[dict[str, object]]:
    """用同一批消息比较不同后端，并把成功或错误都写入结果。"""
    results = []
    for case_id, messages in cases:
        try:
            response = client.chat(messages)
            results.append(
                {
                    "case_id": case_id,
                    "ok": True,
                    "text": response.text,
                    "model": response.model,
                    "latency_seconds": response.latency_seconds,
                    "prompt_tokens": response.prompt_tokens,
                    "completion_tokens": response.completion_tokens,
                }
            )
        except Exception as error:
            results.append(
                {
                    "case_id": case_id,
                    "ok": False,
                    "error": f"{type(error).__name__}: {error}",
                }
            )
    return results


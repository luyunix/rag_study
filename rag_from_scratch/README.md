# RAG 从零实现练习包

这组代码把课程中的抽象技术栈缩成可运行的小零件：

- `chunking.py`：递归字符分块与 overlap；
- `dense.py`：Embedding 接口、余弦相似度、精确向量检索；
- `sparse.py`：BM25 稀疏检索；
- `fusion.py`：Reciprocal Rank Fusion；
- `rerank.py`：候选集重排；
- `evaluation.py`：Recall@k 与 MRR；
- `graph.py`：知识三元组与多跳路径；
- `pipeline.py`：Baseline RAG 的索引—召回—上下文—提示词闭环。
- `llm_clients.py`：统一云端 API、本地兼容服务与离线模拟模型，并记录调用指标。

`HashingEmbedder` 是教学替身：它能展示 RAG 的数据流和接口边界，但不具备
真正语义模型的泛化能力。学懂后再把它替换成 BGE、M3E、E5 等模型。

从项目根目录运行：

```bash
python -m unittest discover -s tests -p 'test_*.py'
```

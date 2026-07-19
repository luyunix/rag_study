import unittest

from rag_from_scratch.chunking import Chunk, recursive_split
from rag_from_scratch.dense import VectorIndex
from rag_from_scratch.evaluation import RetrievalCase, evaluate_retrieval
from rag_from_scratch.fusion import reciprocal_rank_fusion
from rag_from_scratch.graph import KnowledgeGraph
from rag_from_scratch.llm_clients import MockChatClient, benchmark
from rag_from_scratch.pipeline import BaselineRAG
from rag_from_scratch.sparse import BM25Index


class RAGBasicsTest(unittest.TestCase):
    def setUp(self):
        self.chunks = [
            Chunk("leave", "年假申请需要提前三天提交给直属主管。"),
            Chunk("expense", "差旅报销需要发票，并在返程后十天内提交。"),
            Chunk("vector", "HNSW 是常见的向量数据库近似最近邻索引。"),
        ]

    def test_recursive_split_respects_size_and_overlap(self):
        chunks = recursive_split("第一段内容。\n\n第二段内容很长。" * 8, chunk_size=30, chunk_overlap=5)
        self.assertGreater(len(chunks), 1)
        self.assertTrue(all(0 < len(chunk.text) <= 30 for chunk in chunks))
        self.assertEqual(chunks[0].id, "document#chunk-0000")

    def test_dense_and_sparse_retrieve_relevant_chunk(self):
        dense = VectorIndex()
        sparse = BM25Index()
        dense.add(self.chunks)
        sparse.add(self.chunks)
        self.assertEqual(dense.search("向量索引", k=1)[0].chunk.id, "vector")
        self.assertEqual(sparse.search("差旅报销发票", k=1)[0].chunk.id, "expense")

    def test_rrf_rewards_agreement(self):
        dense = VectorIndex()
        sparse = BM25Index()
        dense.add(self.chunks)
        sparse.add(self.chunks)
        fused = reciprocal_rank_fusion(
            [dense.search("向量数据库索引", 3), sparse.search("向量数据库索引", 3)]
        )
        self.assertEqual(fused[0].chunk.id, "vector")
        self.assertEqual(fused[0].matched_lists, 2)

    def test_retrieval_evaluation(self):
        sparse = BM25Index()
        sparse.add(self.chunks)
        metrics = evaluate_retrieval(
            [RetrievalCase("年假提前几天申请", {"leave"})], sparse.search, k=2
        )
        self.assertEqual(metrics["recall@2"], 1.0)
        self.assertEqual(metrics["mrr"], 1.0)

    def test_graph_multi_hop(self):
        graph = KnowledgeGraph(
            [
                ("公司A", "投资", "公司B"),
                ("公司B", "研发", "产品C"),
                ("产品C", "属于", "行业D"),
            ]
        )
        paths = graph.paths_from("公司A", max_hops=2)
        self.assertTrue(any(len(path) == 2 and path[-1].object == "产品C" for path in paths))
        self.assertFalse(any(len(path) == 3 for path in paths))

    def test_baseline_prompt_contains_sources_and_abstention_rule(self):
        prompt = BaselineRAG(self.chunks).build_prompt("年假怎么申请？", k=2)
        self.assertIn("[资料 1", prompt)
        self.assertIn("资料不足时明确说不知道", prompt)
        self.assertIn("年假怎么申请", prompt)

    def test_llm_client_benchmark_records_results(self):
        client = MockChatClient(
            lambda messages: f"收到：{messages[-1]['content']}"
        )
        cases = [
            ("leave", [{"role": "user", "content": "年假怎么申请？"}]),
            ("expense", [{"role": "user", "content": "报销需要什么？"}]),
        ]
        results = benchmark(client, cases)
        self.assertEqual(["leave", "expense"], [row["case_id"] for row in results])
        self.assertTrue(all(row["ok"] for row in results))
        self.assertEqual("收到：年假怎么申请？", results[0]["text"])


if __name__ == "__main__":
    unittest.main()

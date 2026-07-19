# P48：8-4 RAG评价神器：Ragas框架

> 笔记编号 48/89 · 对应原视频 P48 · 时长 20:34 · [打开这一节](https://www.bilibili.com/video/BV1fLoKBREGv?p=48)

[← P47: 8-3 RAG评估的三大步骤](../08-evaluation/p047-RAG评估的三大步骤.md) · [返回第 8 章专题](./README.md) · [P49: 8-5 实战：用Ragas评估制度问答模块的性能 →](../08-evaluation/p049-实战-用Ragas评估制度问答模块的性能.md)

## 这节到底讲什么

**核心问题：Ragas 用哪些维度评价 RAG？**

这节直接回答“Ragas 用哪些维度评价 RAG？”。老师的结论可以整理成五点：第一，评测输入：question、answer、contexts、ground truth；第二，Faithfulness：答案陈述是否由上下文支持；第三，Answer Relevancy：答案是否真正回应问题；第四，Context 指标：召回上下文的相关性与覆盖；第五，使用边界：自动评审有偏差，需人工抽检。下面逐项解释每一点的含义和作用。

![P48 原创概念图](./diagrams/p048-RAG评价神器-Ragas框架-concept.svg)

## 辅助流程图

```mermaid
flowchart LR
    N0["评测输入"]
    N1["Faithfulness"]
    N2["Answer Relevancy"]
    N3["Context 指标"]
    N4["使用边界"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
```

## 正文讲解（按视频顺序）

> 下面是依据音轨和画面整理的通顺版本，不是逐字稿。技术术语已经校正，
> 老师的原始讲法保留在后面的 ASR 页面。

### 1. 评测输入

question、answer、contexts、ground truth。

### 2. Faithfulness

答案陈述是否由上下文支持。

### 3. Answer Relevancy

答案是否真正回应问题。

### 4. Context 指标

召回上下文的相关性与覆盖。

### 5. 使用边界

自动评审有偏差，需人工抽检。


## 用一个例子串起来

改完分块参数后，某个演示问题答对了，并不能证明系统变好。要在同一批问题上比较 Recall@k、MRR、忠实性、答案相关性和延迟，再分析具体坏例。

## 完整原声逐段记录

已用本地语音识别核查；技术词与口误以专题笔记的校正版为准。

[查看本节按时间戳保留的本地 ASR 转写](./transcripts/p048-RAG评价神器-Ragas框架-ASR.md)。原始转写会保留
同音字和断句误差，正文用校正后的术语，方便同时核对“老师说了什么”和“概念是什么”。

## 读完记住这五句话

- **评测输入：** question、answer、contexts、ground truth
- **Faithfulness：** 答案陈述是否由上下文支持
- **Answer Relevancy：** 答案是否真正回应问题
- **Context 指标：** 召回上下文的相关性与覆盖
- **使用边界：** 自动评审有偏差，需人工抽检

## 最小可运行代码

[打开本节最相关的纯 Python 练习](../../rag_from_scratch/evaluation.py)。练习包不依赖 LangChain，
目的是先看清输入、输出和算法边界，再替换成课程中的框架/API。



## 最容易踩的坑

只看一个平均分会掩盖不同失败类型。检索失败和生成失败需要分开统计，并逐条查看低分样本。

## 自测

1. 不看图回答：Ragas 用哪些维度评价 RAG？
2. 用上面的例子，指出本节五个知识点分别出现在哪里。
3. 如果没有“Context 指标”，会出现什么具体问题？

## 学完检查

- [ ] 我能不看视频解释本节核心概念
- [ ] 我能指出它在 RAG 数据流中的位置
- [ ] 我知道它最适合与最不适合的场景
- [ ] 我读过完整 ASR 并核对了技术术语
- [ ] 我完成了专题 README 中对应的自测或实验

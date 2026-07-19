# RAG 零基础学习笔记：89 节完整路线

这套笔记按课程原声和选集顺序整理。14 个专题 README 负责串起完整知识体系；
89 个逐集页面各自包含专属原创概念图、校正版原声顺序稿、完整 ASR、误区、
自测与代码入口。所有逐集图都按该集内容单独绘制，不复用章节通用流程图。

- 原课程：[https://www.bilibili.com/video/BV1fLoKBREGv](https://www.bilibili.com/video/BV1fLoKBREGv)
- 总时长：13.71 小时
- 媒体处理：内置浏览器核对目录与画面，本地语音识别核查音频
- 完整性：保留每节带时间戳的本地机器转写，正文另做术语校正

## 建议学习顺序

1. 先读章级 README，画出这一章的数据流。
2. 按 P 号观看；每节看完完成页面中的五项检查。
3. 运行 `rag_from_scratch` 对应实验，先猜结果再执行。
4. 用固定评测集记录每次改动，不以单个漂亮答案判断效果。

## 课程目录

### 第 1 章：课程导学

[打开专题学习说明](./notes/01-course-guide/README.md)

1. [P1 1-1 全面了解课程，让你少走弯路，必看！！！](./notes/01-course-guide/p001-全面了解课程-让你少走弯路-必看.md) · 10:54

### 第 2 章：RAG 基础

[打开专题学习说明](./notes/02-rag-foundations/README.md)

2. [P2 2-1 本章简介](./notes/02-rag-foundations/p002-RAG-基础-本章导学.md) · 00:59
3. [P3 2-2 满足企业精准需求：RAG如何填补大语言模型短板](./notes/02-rag-foundations/p003-满足企业精准需求-RAG如何填补大语言模型短板.md) · 03:39
4. [P4 2-3 解锁RAG三大核心](./notes/02-rag-foundations/p004-解锁RAG三大核心.md) · 01:33
5. [P5 2-4 深入思考 long context加持的大模型企业还需要RAG](./notes/02-rag-foundations/p005-深入思考-long-context加持的大模型企业还需要RAG.md) · 06:27
6. [P6 2-5 RAG技术栈：从【合格】到【优秀】的跨越](./notes/02-rag-foundations/p006-RAG技术栈-从-合格-到-优秀-的跨越.md) · 02:43
7. [P7 2-6 本课程案例分析与说明](./notes/02-rag-foundations/p007-本课程案例分析与说明.md) · 02:25

### 第 3 章：大模型基础与选型

[打开专题学习说明](./notes/03-llm-foundations/README.md)

8. [P8 3-1 本章简介](./notes/03-llm-foundations/p008-大模型基础与选型-本章导学.md) · 01:41
9. [P9 3-2 大模型入门：核心要点和技术演变（Token、Transformer、GPT）](./notes/03-llm-foundations/p009-大模型入门-核心要点和技术演变-Token-Transformer-GPT.md) · 20:58
10. [P10 3-3 国内外大模型产品必知必会](./notes/03-llm-foundations/p010-国内外大模型产品必知必会.md) · 03:45
11. [P11 3-4 没有GPU如何调用大模型-大模型调用的三种方式](./notes/03-llm-foundations/p011-没有GPU如何调用大模型-大模型调用的三种方式.md) · 09:33
12. [P12 3-5 火眼金星：如何分辨大模型的好坏](./notes/03-llm-foundations/p012-火眼金星-如何分辨大模型的好坏.md) · 05:58
13. [P13 3-6 RAG应用：挑选大模型的四大步骤](./notes/03-llm-foundations/p013-RAG应用-挑选大模型的四大步骤.md) · 02:18
14. [P14 3-7 总结和展望：不同项目角色需要对AI大模型了解程度的差异性分析](./notes/03-llm-foundations/p014-总结和展望-不同项目角色需要对AI大模型了解程度的差异性分析.md) · 09:02
15. [P15 3-11 实战：使用大语言模型（本地和API、GPU和CPU）-1](./notes/03-llm-foundations/p015-实战-使用大语言模型-本地和API-GPU和CPU-1.md) · 17:39
16. [P16 3-12 实战：使用大语言模型（本地和API、GPU和CPU）-2](./notes/03-llm-foundations/p016-实战-使用大语言模型-本地和API-GPU和CPU-2.md) · 18:43

### 第 4 章：Embedding

[打开专题学习说明](./notes/04-embeddings/README.md)

17. [P17 4-1 本章介绍](./notes/04-embeddings/p017-Embedding-本章导学.md) · 00:42
18. [P18 4-2 embedding模型的重要性](./notes/04-embeddings/p018-embedding模型的重要性.md) · 02:36
19. [P19 4-3 embedding是怎么炼成的？](./notes/04-embeddings/p019-embedding是怎么炼成的.md) · 05:08
20. [P20 4-4 主流中文embedding模型](./notes/04-embeddings/p020-主流中文embedding模型.md) · 06:21
21. [P21 4-5 embedding模型排行榜靠谱不靠谱，如何选择](./notes/04-embeddings/p021-embedding模型排行榜靠谱不靠谱-如何选择.md) · 04:11
22. [P22 4-7 实战：embedding模型加载和使用对比](./notes/04-embeddings/p022-实战-embedding模型加载和使用对比.md) · 22:25
23. [P23 4-8 本章总结](./notes/04-embeddings/p023-Embedding-本章总结.md) · 01:20

### 第 5 章：向量数据库

[打开专题学习说明](./notes/05-vector-databases/README.md)

24. [P24 5-1 本章介绍](./notes/05-vector-databases/p024-向量数据库-本章导学.md) · 01:04
25. [P25 5-2 全方位对比：主流向量数据库](./notes/05-vector-databases/p025-全方位对比-主流向量数据库.md) · 11:49
26. [P26 5-3 企业级向量数据库的要求](./notes/05-vector-databases/p026-企业级向量数据库的要求.md) · 01:52
27. [P27 5-4 向量数据库相似性搜索](./notes/05-vector-databases/p027-向量数据库相似性搜索.md) · 02:34
28. [P28 5-5 性能为王：探索向量数据索引优化技术](./notes/05-vector-databases/p028-性能为王-探索向量数据索引优化技术.md) · 16:01
29. [P29 5-6 实战：部署和使用企业级向量数据库（chroma和milvus）-1](./notes/05-vector-databases/p029-实战-部署和使用企业级向量数据库-chroma和milvus-1.md) · 14:56
30. [P30 5-7 实战：部署和使用企业级向量数据库（chroma和milvus）-2](./notes/05-vector-databases/p030-实战-部署和使用企业级向量数据库-chroma和milvus-2.md) · 14:45
31. [P31 5-8 总结和展望：企业级应用的高可用性](./notes/05-vector-databases/p031-总结和展望-企业级应用的高可用性.md) · 02:40

### 第 6 章：文档解析与分块

[打开专题学习说明](./notes/06-document-processing/README.md)

32. [P32 6-1 本章介绍](./notes/06-document-processing/p032-文档解析与分块-本章导学.md) · 00:57
33. [P33 6-2 复杂：企业数据复杂多样](./notes/06-document-processing/p033-复杂-企业数据复杂多样.md) · 04:36
34. [P34 6-3 原则：垃圾进垃圾出，注重文档质量](./notes/06-document-processing/p034-原则-垃圾进垃圾出-注重文档质量.md) · 03:59
35. [P35 6-4 挑战：RAG如何读取多样性文档（文本、表格和布局分析）](./notes/06-document-processing/p035-挑战-RAG如何读取多样性文档-文本-表格和布局分析.md) · 09:11
36. [P36 6-5 文档分块：递归文本分块和语义智能分块](./notes/06-document-processing/p036-文档分块-递归文本分块和语义智能分块.md) · 12:19
37. [P37 6-6 实战：实现制度问答模块数据读取和切割](./notes/06-document-processing/p037-实战-实现制度问答模块数据读取和切割.md) · 35:38
38. [P38 6-7 本章总结](./notes/06-document-processing/p038-文档解析与分块-本章总结.md) · 01:14

### 第 7 章：企业制度问答 Baseline

[打开专题学习说明](./notes/07-baseline-rag/README.md)

39. [P39 7-1 本章介绍](./notes/07-baseline-rag/p039-企业制度问答-Baseline-本章导学.md) · 01:24
40. [P40 7-2 【企业员工制度问答助手】需求分析](./notes/07-baseline-rag/p040-企业员工制度问答助手-需求分析.md) · 02:25
41. [P41 7-3 项目技术选型](./notes/07-baseline-rag/p041-项目技术选型.md) · 01:36
42. [P42 7-4 项目架构设计](./notes/07-baseline-rag/p042-项目架构设计.md) · 01:40
43. [P43 7-5 实战：实现制度问答模块RAG baseline](./notes/07-baseline-rag/p043-实战-实现制度问答模块RAG-baseline.md) · 16:22
44. [P44 7-6 总结和展望：转变思想，AI应用开发和传统软件开发的区别](./notes/07-baseline-rag/p044-总结和展望-转变思想-AI应用开发和传统软件开发的区别.md) · 04:27

### 第 8 章：RAG 评估

[打开专题学习说明](./notes/08-evaluation/README.md)

45. [P45 8-1 本章介绍](./notes/08-evaluation/p045-RAG-评估-本章导学.md) · 00:50
46. [P46 8-2 RAG迭代的关键：评估](./notes/08-evaluation/p046-RAG迭代的关键-评估.md) · 03:53
47. [P47 8-3 RAG评估的三大步骤](./notes/08-evaluation/p047-RAG评估的三大步骤.md) · 01:06
48. [P48 8-4 RAG评价神器：Ragas框架](./notes/08-evaluation/p048-RAG评价神器-Ragas框架.md) · 20:34
49. [P49 8-5 实战：用Ragas评估制度问答模块的性能](./notes/08-evaluation/p049-实战-用Ragas评估制度问答模块的性能.md) · 07:35
50. [P50 8-6 本章总结](./notes/08-evaluation/p050-RAG-评估-本章总结.md) · 02:15

### 第 9 章：高级检索增强

[打开专题学习说明](./notes/09-advanced-retrieval/README.md)

51. [P51 9-1 本章介绍](./notes/09-advanced-retrieval/p051-高级检索增强-本章导学.md) · 01:24
52. [P52 9-2 一图剖析RAG进化之路：探索优化点](./notes/09-advanced-retrieval/p052-一图剖析RAG进化之路-探索优化点.md) · 03:03
53. [P53 9-3 检索的两大形态：稀疏 vs 稠密](./notes/09-advanced-retrieval/p053-检索的两大形态-稀疏-vs-稠密.md) · 09:45
54. [P54 9-4 查询增强：增加相关内容-Query2doc+ HyDE+子问题查询](./notes/09-advanced-retrieval/p054-查询增强-增加相关内容-Query2doc-HyDE-子问题查询.md) · 20:37
55. [P55 9-5 多索引增强：从不同维度构建索引，强化相关内容](./notes/09-advanced-retrieval/p055-多索引增强-从不同维度构建索引-强化相关内容.md) · 09:18
56. [P56 9-6 检索后增强：融合检索，三个臭皮匠顶一个诸葛亮](./notes/09-advanced-retrieval/p056-检索后增强-融合检索-三个臭皮匠顶一个诸葛亮.md) · 08:55
57. [P57 9-7 检索后增强：重排序技术(Re-rank)](./notes/09-advanced-retrieval/p057-检索后增强-重排序技术-Re-rank.md) · 05:37
58. [P58 9-8 系统性增强：迭代检索增强生成，从上一迭代收获信息](./notes/09-advanced-retrieval/p058-系统性增强-迭代检索增强生成-从上一迭代收获信息.md) · 06:56
59. [P59 9-9 RAG新范式：自我评估增强Self-RAG](./notes/09-advanced-retrieval/p059-RAG新范式-自我评估增强Self-RAG.md) · 10:50
60. [P60 9-10 总结和展望：关于企业里需要良好的代码规范和代码管理](./notes/09-advanced-retrieval/p060-总结和展望-关于企业里需要良好的代码规范和代码管理.md) · 19:42
61. [P61 9-11 实战：用检索增强技术提升制度问答模块性能-查询增强-1](./notes/09-advanced-retrieval/p061-实战-用检索增强技术提升制度问答模块性能-查询增强-1.md) · 21:26
62. [P62 9-12 实战：用检索增强技术提升制度问答模块性能-查询增强-2](./notes/09-advanced-retrieval/p062-实战-用检索增强技术提升制度问答模块性能-查询增强-2.md) · 26:57
63. [P63 9-13 实战：用检索增强技术提升制度问答模块性能-多索引增强](./notes/09-advanced-retrieval/p063-实战-用检索增强技术提升制度问答模块性能-多索引增强.md) · 23:55
64. [P64 9-14 实战：用检索增强技术提升制度问答模块性能-融合检索](./notes/09-advanced-retrieval/p064-实战-用检索增强技术提升制度问答模块性能-融合检索.md) · 07:11
65. [P65 9-16 实战：用检索增强技术提升制度问答模块性能-rerank重排](./notes/09-advanced-retrieval/p065-实战-用检索增强技术提升制度问答模块性能-rerank重排.md) · 06:31
66. [P66 9-17 实战：用检索增强技术提升制度问答模块性能-迭代检索增强生成](./notes/09-advanced-retrieval/p066-实战-用检索增强技术提升制度问答模块性能-迭代检索增强生成.md) · 06:03
67. [P67 9-18 实战：用检索增强技术提升制度问答模块性能-self-RAG-1](./notes/09-advanced-retrieval/p067-实战-用检索增强技术提升制度问答模块性能-self-RAG-1.md) · 17:35
68. [P68 9-19 实战：用检索增强技术提升制度问答模块性能-self-RAG-2](./notes/09-advanced-retrieval/p068-实战-用检索增强技术提升制度问答模块性能-self-RAG-2.md) · 17:50

### 第 10 章：Graph RAG

[打开专题学习说明](./notes/10-graph-rag/README.md)

69. [P69 10-1 本章介绍](./notes/10-graph-rag/p069-Graph-RAG-本章导学.md) · 02:49
70. [P70 10-2 认识金融智库知识图谱数据：特别的知识三元组](./notes/10-graph-rag/p070-认识金融智库知识图谱数据-特别的知识三元组.md) · 12:02
71. [P71 10-3 如何存储和操作知识图谱：neo4j和nebulagraph](./notes/10-graph-rag/p071-如何存储和操作知识图谱-neo4j和nebulagraph.md) · 16:37
72. [P72 10-4 实战：动手构建金融智库知识图谱-1](./notes/10-graph-rag/p072-实战-动手构建金融智库知识图谱-1.md) · 17:27
73. [P73 10-5 实战：动手构建金融智库知识图谱-2](./notes/10-graph-rag/p073-实战-动手构建金融智库知识图谱-2.md) · 20:23
74. [P74 10-6 RAG和Graph RAG有什么区别：如何构建Graph RAG](./notes/10-graph-rag/p074-RAG和Graph-RAG有什么区别-如何构建Graph-RAG.md) · 18:04
75. [P75 10-7 实战：利用Graph RAG构建金融智库知识库应用](./notes/10-graph-rag/p075-实战-利用Graph-RAG构建金融智库知识库应用.md) · 26:14
76. [P76 10-8 总结和展望：如何自我学习，跟进前沿技术](./notes/10-graph-rag/p076-总结和展望-如何自我学习-跟进前沿技术.md) · 09:50

### 第 11 章：Agentic RAG

[打开专题学习说明](./notes/11-agentic-rag/README.md)

77. [P77 11-1 本章介绍](./notes/11-agentic-rag/p077-Agentic-RAG-本章导学.md) · 01:25
78. [P78 11-2 大模型的手脚：AI智能体Agent](./notes/11-agentic-rag/p078-大模型的手脚-AI智能体Agent.md) · 14:27
79. [P79 11-3 推理和行动并行：ReAct框架](./notes/11-agentic-rag/p079-推理和行动并行-ReAct框架.md) · 04:46
80. [P80 11-4 基于Agent的多文档RAG Router](./notes/11-agentic-rag/p080-基于Agent的多文档RAG-Router.md) · 02:37
81. [P81 11-5 实战：利用 ReAct Agent 实现 RAG Router](./notes/11-agentic-rag/p081-实战-利用-ReAct-Agent-实现-RAG-Router.md) · 13:31
82. [P82 11-6 本章总结](./notes/11-agentic-rag/p082-Agentic-RAG-本章总结.md) · 01:25

### 第 12 章：Gradio 整合

[打开专题学习说明](./notes/12-gradio-app/README.md)

83. [P83 12-1 本章介绍](./notes/12-gradio-app/p083-Gradio-整合-本章导学.md) · 01:14
84. [P84 12-2 演示界面神器：gradio介绍](./notes/12-gradio-app/p084-演示界面神器-gradio介绍.md) · 12:20
85. [P85 12-3 实战：gradio整合两大RAG项目（1）](./notes/12-gradio-app/p085-实战-gradio整合两大RAG项目-1.md) · 13:24
86. [P86 12-4 实战：gradio整合两大RAG项目（2）](./notes/12-gradio-app/p086-实战-gradio整合两大RAG项目-2.md) · 19:07

### 第 13 章：模型微调导言

[打开专题学习说明](./notes/13-model-finetuning/README.md)

87. [P87 13-1 本章介绍](./notes/13-model-finetuning/p087-模型微调导言-本章导学.md) · 01:32

### 第 14 章：课程总结与面试

[打开专题学习说明](./notes/14-course-review/README.md)

88. [P88 14-1 项目总结和展望：课程回顾与总结](./notes/14-course-review/p088-项目总结和展望-课程回顾与总结.md) · 15:06
89. [P89 14-2 项目总结和展望：课程总结与 AI 岗位面试技巧](./notes/14-course-review/p089-项目总结和展望-课程总结与-AI-岗位面试技巧.md) · 15:57

## 配套可运行代码

- [RAG 从零实现练习包](./rag_from_scratch/README.md)
- 运行测试：`python -m unittest discover -s tests -p 'test_*.py'`

## 采集与校正说明

[查看课程来源、截图与语音核查说明](./sources/README.md)

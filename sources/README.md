# 课程来源与核查说明

主课程：[Bilibili BV1fLoKBREGv](https://www.bilibili.com/video/BV1fLoKBREGv)。

整理过程：

1. 用内置浏览器核对视频标题、89 节选集、时长和页面显示的字幕状态；
2. 页面显示“暂无字幕”，因此下载纯音频到临时目录，用本地 Whisper 做语音识别；
3. 用音频检查每节讲解顺序、例子和技术细节，再人工纠正 RAG、Embedding、
   Ragas、HyDE、Rerank、Graph RAG、ReAct 等容易误识别的术语；
4. 在 HNSW、文档分块、Ragas、HyDE、Graph RAG、ReAct 等关键画面截图核对；
5. 仓库不保存原始音视频或网页截图；概念图全部重新绘制为原创 SVG；
6. 按用户的学习需求保留每节机器转写，并把校正后的知识另写入专题正文。

`course-catalog.json` 是可机读的 89 节目录。机器转写用于完整性核查，可能包含
同音字和技术术语误识别；技术概念以各章专题 README 的校正版为准。

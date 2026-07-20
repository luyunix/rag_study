import type { Metadata } from "next";
import { StudyReader } from "./study-reader";

export const metadata: Metadata = {
  title: {
    absolute: "RAG Study｜89 节完整学习笔记",
  },
  description:
    "按章节阅读 89 节 RAG 学习笔记，在校正版讲解、原创知识图与完整 ASR 之间随时切换。",
};

export default function Home() {
  return <StudyReader />;
}

# P34 音轨转写：6-3 原则：垃圾进垃圾出，注重文档质量

> [返回学习笔记](../p034-原则-垃圾进垃圾出-注重文档质量.md) · [打开原视频](https://www.bilibili.com/video/BV1fLoKBREGv?p=34)

> 本页由本地语音识别生成，用于核查讲解遗漏。可能存在同音字、断句和
> 技术术语误识别；校正后的概念请以章级 README 为准。

## 00:00:00–00:00:30

GabbageIn，GabbageOut，LagGin，LagG出，RagGin，LagGin，LagG出，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin�

## 00:00:30–00:01:00

GabbageIn，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin

## 00:01:00–00:01:03

如果在這個過程中輸入的數字質量很差

## 00:01:03–00:01:08

比如說數據中包含一些相互衝突、矛盾的一些信息

## 00:01:08–00:01:10

還有就是在數據處理過程中

## 00:01:10–00:01:13

比如說解析和分割都存在一些錯誤

## 00:01:13–00:01:17

那麼無論你的IG的流程構建了多麼的完美

## 00:01:17–00:01:22

最終IG的系統是無法產生它應有的價值

## 00:01:23–00:01:29

這個就是IG系統中的GabbageIn，GabbageOut

## 00:01:30–00:01:30

LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin

## 00:02:00–00:02:30

LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin，LagGin

## 00:02:30–00:02:56

我們在上一小節中分析過,企業的數據格式和內容是複雜多樣的,而這部分數據的解析就很容易引入數據錯誤,比如內容識別的錯誤,像有些關鍵詞或者句子,動入遺漏或者誤讀以及表格的行列識別關係憤怒。這些錯誤的數據解析都可能給IG系統引入垃圾數據。

## 00:02:56–00:03:25

第三個原因是數據的分塊策略上的一些問題,文檔分塊它的作用就是將整個文檔分成落干小的一個部分,這個具體的技術點我們在後面的小節中會詳細的講解。在這裡我們需要了解的是,在分塊的過程中,如果將同一個語意的一句話或者一段話猜到不同的塊裡面去,這樣就造成上下文信息的割裂,也就造成它的不全面。

## 00:03:25–00:03:36

另一個方面是,如果不同語意的信息分在同一塊裡面去,這樣在檢索時就會參查一些不相關的信息,對結果造成一定程度的干擾。

## 00:03:36–00:03:52

所以說在IG的構建過程中,每一個步驟都有可能引入垃圾數據,所以說在構建的過程中要特別注意數據的一個資料問題,可以說保證數據資料是構建一個成功的IG系統的一個關鍵所在。

## 00:03:52–00:03:59

所以說,GabbyGeeIn,GabbyGeeOut,GeeIn,GeeTools,這個原則我們要時刻鳴記在心。

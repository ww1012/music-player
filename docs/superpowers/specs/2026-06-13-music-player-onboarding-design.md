# 音乐播放器项目 · 新手导览学习地图（设计文档）

- 日期：2026-06-13
- 学习者：前后端新手
- 学习目标：**能定位 bug 并修小问题**（不是写出每个细节，而是看到一个 bug 就能猜出大概在哪个文件、哪一段）
- 项目仓库：`C:\Users\86133\Desktop\音乐播放器`（Next.js 14 + Express 5 + MongoDB monorepo）

---

## 1. 学习契约

### 这份地图是什么

一份针对**前后端新手**的项目导览，目标是让你具备：

> 看到一个 bug → 能猜到大概在哪个文件、那个文件里大概在哪一段

它**不是**全栈教程：不会系统讲 React/TS/Node 语法，只在用到时点穴式补背景。

### 各自的责任

| 角色 | 职责 |
|---|---|
| 教练（Claude） | 每章给出 ① 一句话定位 ② 关键文件 ③ 逐段讲解 ④ 一道"如果这里坏了"的诊断题（先让你猜，再公布答案） |
| 学习者（你） | 每章读完回复「懂了」或「卡在 X」，让教练决定是补讲还是进下一章 |
| 公共约定 | 不一次性输出全部 8 章；按节奏标注分章互动 |

### 完成标准

完成全 8 章后，第 8 章的 bug 演练作为客观验收点（详见第 4 节）。

---

## 2. 8 章大纲

每章统一四件套结构：**这一层在干什么 → 锁定文件 → 逐段讲解 → 诊断题**。

### 第 0 章 · 跑起来 *(详讲)*

- **在干什么**：介绍 monorepo workspaces、`npm run dev` 怎么同时拉起前后端、MongoDB 和 `.env` 的角色
- **锁定文件**：根 `package.json`、`backend/package.json`、`frontend/package.json`
- **产出物**：终端看到「前端 3000 ✅ / 后端 3001 ✅ / MongoDB 已连接」，浏览器能打开页面
- **诊断题**：「后端起来了但前端访问 API 报错」最先看哪里？

### 第 1 章 · 整体地图 *(快过)*

- **在干什么**：把 `docs/architecture.md` 那张大图用新手能接受的语言讲一遍——浏览器、Next 前端、Express 后端、MongoDB、IndexedDB 各管什么、谁向谁发请求
- **锁定文件**：`docs/architecture.md`
- **产出物**：能在白纸上凭记忆画出 5 个方块和它们之间的箭头
- **诊断题**：「歌词不显示」可能是 5 个方块里哪几个出问题？

### 第 2 章 · 前端入口（Next.js App Router）*(快过)*

- **在干什么**：补 App Router 背景（layout.tsx 是壳、page.tsx 是页面），讲首页怎么把 6 个组件组装在一起
- **锁定文件**：`frontend/src/app/layout.tsx`、`frontend/src/app/page.tsx`
- **产出物**：能说清「页面上每一块对应哪个组件」
- **诊断题**：「整个页面白屏」最先看哪个文件？

### 第 3 章 · 状态中枢（Zustand store）*(快过)*

- **在干什么**：补 Zustand 背景（一个全局变量 + 改它的方法），讲 `playerStore` 存了哪些状态、谁在改它
- **锁定文件**：`frontend/src/store/playerStore.ts`
- **产出物**：能列出 store 所有字段、知道每个字段的"读写双方"
- **诊断题**：「点了下一首但 UI 没反应」可能是 store 哪里没更新？

### 第 4 章 · 音频引擎（核心）*(详讲)*

- **在干什么**：补 `<audio>` 元素和 Web Audio API 最小知识，讲 `useAudioPlayer` 怎么把"store 里的当前歌曲"变成"实际播放的声音"，以及 Equalizer 怎么从音频流读频谱画动效
- **锁定文件**：`frontend/src/hooks/useAudioPlayer.ts`、`frontend/src/components/Player.tsx`、`frontend/src/components/Equalizer.tsx`
- **产出物**：能讲清「按下播放键 → 听到声音」整条调用链
- **诊断题**：「按播放键没声音但歌曲信息显示了」会从这条链的哪一环开始查？

### 第 5 章 · 本地存储与文件 *(快过)*

- **在干什么**：补 IndexedDB 背景（浏览器里的小数据库），讲音频文件怎么从用户硬盘 → 上传 → 存进 IndexedDB → 被 Audio 元素读取
- **锁定文件**：`frontend/src/utils/indexedDB.ts`、`frontend/src/components/FileUploader.tsx`、`frontend/src/components/Playlist.tsx`
- **产出物**：能讲清「拖一个 mp3 进去之后经过哪些函数才变成可播放歌曲」
- **诊断题**：「刷新后歌单消失了」是哪一步出了问题？

### 第 6 章 · 后端骨架 *(快过)*

- **在干什么**：补 Express 背景（路由 = URL 到函数的映射、中间件 = 请求拦截器），讲 `server.ts` 怎么把零件装起来
- **锁定文件**：`backend/src/server.ts`、`backend/src/middleware/auth.ts`、`backend/src/utils/jwt.ts`
- **产出物**：能讲清一个请求从进入服务器到拿到响应经过的函数顺序
- **诊断题**：「调用收藏接口报 401 未授权」从哪个文件开始查？

### 第 7 章 · 三条业务线 *(详讲)*

- **在干什么**：把 auth / favorites / lyrics 三个模块各走一遍「前端 service → 后端 route → Mongoose model → MongoDB → 返回前端」的完整链路
- **锁定文件**：`frontend/src/services/api.ts`、`backend/src/routes/{auth,favorites,lyrics}.ts`、`backend/src/models/User.ts` 及前端调用方
- **产出物**：能从前端任意一个用户操作倒推到后端哪条路由、哪个 Model、读写哪个集合
- **诊断题**：「收藏成功但刷新后丢了」前后端两侧分别会先看哪个文件？

### 第 8 章 · bug 演练（验收章）*(详讲)*

- **在干什么**：拿当前 git 上 7 个未提交修改作为题目（含 `lyrics display error` 修复在内），不告诉答案，让你**先猜在哪、再读改动验证**
- **锁定文件**：当前 git status 中的 7 个被修改文件
  - `backend/src/server.ts`
  - `frontend/src/components/Equalizer.tsx`
  - `frontend/src/components/Lyrics.tsx`
  - `frontend/src/components/Player.tsx`
  - `frontend/src/hooks/useAudioPlayer.ts`
  - `frontend/src/services/api.ts`
  - `frontend/src/store/playerStore.ts`
- **产出物**：每道题先报「文件名 + 大致位置」，再打开验证
- **诊断题**：本章本身就是诊断题集合

---

## 3. 节奏与交互方式

| 章 | 主题 | 节奏 |
|---|---|---|
| 0 | 跑起来 | 详讲 |
| 1 | 整体地图 | 快过 |
| 2 | 前端入口 | 快过 |
| 3 | 状态中枢 | 快过 |
| 4 | 音频引擎 | **详讲** |
| 5 | 本地存储与文件 | 快过 |
| 6 | 后端骨架 | 快过 |
| 7 | 三条业务线 | **详讲** |
| 8 | bug 演练 | **详讲** |

- 详讲章 = 一章一互动，发完讲解等你回复「懂了」或「卡在 X」再前进
- 快过章 = 一次发 2–3 章，集中读完一起提问
- 诊断题统一格式：教练抛题 → 你先猜（文件名 + 大致位置）→ 教练公布参考思路与对照

---

## 4. 验收标准

1. 完成全部 8 章
2. 第 8 章 bug 演练中，每道题做到「先报文件名+大致位置 → 打开看是否猜对」
3. **命中率 ≥ 60%** 视为达成"能定位 bug"目标
4. 命中率 < 60% 时回炉对应章节，而不是放过

---

## 5. 范围与边界

### 包含
- 项目当前代码结构、关键文件解读
- 数据流、调用链、状态流向
- 必要时点穴补 React/Express/Mongoose/Web Audio/IndexedDB/JWT 的最小背景
- 基于现存 git 修改的 bug 定位演练

### 不包含
- React / TypeScript / Node 的系统语法教学（async/await、解构、泛型这类基础卡住需自查或单点提问）
- 真正"修 bug"的能力训练（"定位 ≠ 修复"，修复能力作为副产物自然提升，不是硬验收项）
- 部署、CI、自动化测试（项目里没有）

---

## 6. 下一步

设计文档完成后：

1. 用户复核本文档，确认无修改
2. 调用 `writing-plans` 技能，把本设计转换成可执行的章节计划
3. 按计划逐章开讲

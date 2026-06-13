# 音乐播放器项目导览 · 章节交付计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal：** 按既定 8 章地图，逐章为学习者（前后端新手）交付项目导览内容，达成"能定位 bug 并修小问题"。

**Architecture：** 这是"教学交付"型计划，不是写代码。每章 = 1 个 Task，每 Task 内部按"准备 → 讲解 → 诊断题 → 用户 gate"四步推进。详讲章保留完整四步；快过章合并讲解段落。验收章（第 8 章）是纯 bug 演练交互。

**Tech Stack：** Markdown 讲解 + AskUserQuestion 互动 + 直接读项目源文件。

**spec 来源：** `docs/superpowers/specs/2026-06-13-music-player-onboarding-design.md`

**通用约定：**
- "讲解"步骤的输出形态：在终端给学习者发结构化中文讲义（含必要代码片段引用 `file:line`）
- 诊断题采用 `AskUserQuestion`，让学习者先选/先猜，再公布答案
- 每章末尾设 **GATE**：等待学习者回复"懂了"或"卡在 X"，卡住则补讲，懂了则进下一章
- 详讲章独立交付（一章一互动）；快过章可合批（每批 2–3 章）后再统一 GATE
- "提交"动作仅在阶段性整理后做，不是每章都提交（教学交付不修改源码）

---

### Task 0: 第 0 章 · 跑起来 *(详讲)*

**Files:**
- Read: `package.json`、`backend/package.json`、`frontend/package.json`、`.gitignore`
- Read: `backend/src/server.ts`（瞥一眼 MongoDB 连接段）

- [ ] **Step 1: 准备讲义素材**

读以下文件并准备讲解要点：
- 根 `package.json:6-19` —— workspaces 字段、`dev` 脚本怎么用 concurrently 同时跑前后端
- `backend/package.json:6-12` —— `dev` = `ts-node-dev src/server.ts`，`build` = `tsc`
- `frontend/package.json:5-9` —— `dev` = `next dev`（默认端口 3000）
- `backend/src/server.ts` —— 后端端口、MongoDB 连接 URI、需要哪些环境变量

- [ ] **Step 2: 输出讲义**

按以下结构发给学习者：
1. **monorepo 是什么** —— 一个仓库管两个 npm 项目（frontend / backend）；workspaces 让根目录的 npm 命令能同时操作两边
2. **`npm run dev` 做了什么** —— concurrently 同时启 `npm run dev:backend` 和 `npm run dev:frontend`，前端 3000、后端 3001
3. **MongoDB 的角色** —— 后端用 mongoose 连一个本地或云端 MongoDB，存用户/收藏/歌词；前端不直接连数据库
4. **`.env` 的角色** —— 后端从 `.env` 读 `MONGODB_URI`、`JWT_SECRET` 这类机密；项目里没有 `.env` 是因为它被 .gitignore 了，需要学习者自己创建
5. **跑通的最小操作清单**（编号步骤）：
   - 装 Node.js 18+ 和 MongoDB（或注册一个 MongoDB Atlas 免费账号）
   - 在仓库根目录执行 `npm run install:all`
   - 在 `backend/` 下创建 `.env`，填 `MONGODB_URI=...` 和 `JWT_SECRET=任意字符串`
   - 在仓库根目录执行 `npm run dev`
   - 看终端是否同时出现「前端 3000 ✅」「后端 3001 ✅」「MongoDB connected」
   - 浏览器访问 http://localhost:3000

- [ ] **Step 3: 抛诊断题**

用 AskUserQuestion 问：「后端起来了但前端访问 API 报错」最先看哪里？4 个选项：
A. `frontend/src/services/api.ts`（API 基址写错？）
B. `backend/src/server.ts`（CORS 设置？端口？）
C. MongoDB 连接（数据库挂了？）
D. `.env` 文件（环境变量没读到？）

- [ ] **Step 4: 公布答案**

参考思路：先看浏览器控制台错误信息——
- 如果是 CORS 错误 → B
- 如果是 404 → A（基址错）
- 如果是 500 → 后端日志 → 多半是 D 或 C
关键观念：**先看错误信息再下手**，不要凭感觉乱猜。

- [ ] **Step 5: GATE — 等待学习者回复**

预期回复：「懂了」/「卡在 X」/「没跑起来，X 报错」
- 「懂了」→ 进 Task 1
- 卡环境 → 帮排查具体报错；不要进下一章
- 卡概念 → 针对单点补讲

---

### Task 1: 第 1–3 章打包发 *(快过批次 1)*

**Files:**
- Read: `docs/architecture.md`
- Read: `frontend/src/app/layout.tsx:1-18`、`frontend/src/app/page.tsx:1-61`
- Read: `frontend/src/store/playerStore.ts:1-127`

- [ ] **Step 1: 第 1 章 · 整体地图**

讲解点：
- 把 `docs/architecture.md` 那张 5 方块大图重画一次（用文字版方框图）：浏览器 ↔ Next 前端 ↔ Express 后端 ↔ MongoDB；旁挂 IndexedDB
- 关键箭头：
  - 浏览器 → 前端：用户操作
  - 前端 → 后端：HTTP 请求（axios/fetch）
  - 后端 → MongoDB：mongoose 读写
  - 前端 → IndexedDB：直接在浏览器里存音频文件
- **谁存什么**：
  - MongoDB 存「跨设备数据」：用户、收藏、歌词
  - IndexedDB 存「本地大文件」：音频文件本身（mp3 二进制不上服务器）

- [ ] **Step 2: 第 2 章 · 前端入口**

讲解点：
- App Router 背景：`app/layout.tsx` = 包住所有页面的外壳；`app/page.tsx` = 路由 `/` 这个页面
- 打开 `app/page.tsx`，逐段说明它从 `components/` 目录拼了哪 6 个组件、布局是什么样
- 关键观念：**所有 UI 都是 page.tsx 里的组件树，找 UI bug 从这里反向查**

- [ ] **Step 3: 第 3 章 · 状态中枢**

讲解点：
- Zustand 背景：`create((set) => ({...}))` 创建一个全局状态；任何组件用 `usePlayerStore()` 都能读写
- 列出 `playerStore.ts` 里的所有字段，分两栏：「字段 → 谁读 / 谁写」
  - 例：`currentSong` 字段，由 Player/Lyrics/Equalizer 读、由 Playlist/FileUploader 写
- 关键观念：**store 是数据源，UI 只是它的镜子**——UI 不更新通常先怀疑 store 没更新

- [ ] **Step 4: 三章合并诊断题**

用 AskUserQuestion 问：「点了下一首歌，但 UI 上歌名没换、声音也没换」最先去看 store 里的哪个字段？4 个选项：
A. `currentSong` 没被更新
B. `isPlaying` 没切换
C. `playlist` 数组本身错了
D. `currentIndex` 没换

- [ ] **Step 5: 公布答案**

A 最常见：「下一首」逻辑通常是 `currentIndex++` → 派生出新的 `currentSong`；如果 currentSong 没变，UI 自然不刷新。但**正确顺序是先打开 store 看 setCurrentSong 这类 action 有没有被调用**——观察"事件流"而不是凭直觉。

- [ ] **Step 6: GATE — 等待批次 1 反馈**

「三章都懂」→ 进 Task 2；任何一章卡 → 单独补讲那一章再继续。

---

### Task 2: 第 4 章 · 音频引擎 *(详讲)*

**Files:**
- Read: `frontend/src/hooks/useAudioPlayer.ts:1-287`（这是项目最复杂的文件）
- Read: `frontend/src/components/Player.tsx:1-147`
- Read: `frontend/src/components/Equalizer.tsx:1-103`

- [ ] **Step 1: 准备背景知识**

要补的最小背景（每点 1–2 句即可）：
- `<audio>` 元素：HTML 自带的播放器，有 `play() / pause() / currentTime / duration / src` 这些 API
- HTMLAudioElement 的事件：`timeupdate`（进度变化）、`ended`（播完）、`canplay`（缓冲就绪）
- Web Audio API：`AudioContext` + `AnalyserNode` 可以从音频流里实时读频谱数据，画 Equalizer 用它

- [ ] **Step 2: 讲解 useAudioPlayer.ts（核心）**

按以下顺序讲：
1. 它管理什么 —— 一个 `<audio>` ref，订阅 store 的 `currentSong/isPlaying`，把"状态"翻译成"实际播放动作"
2. 关键 useEffect：当 `currentSong` 变 → 给 `<audio>.src` 赋新值；当 `isPlaying` 变 → 调 play/pause
3. 关键事件监听：`timeupdate` 同步进度回 store；`ended` 触发"自动下一首"
4. AudioContext 怎么把 audio 接到 AnalyserNode —— Equalizer 拿这个 analyser 读频谱

- [ ] **Step 3: 讲解 Player.tsx & Equalizer.tsx**

- Player.tsx：UI 控制条（播/停/上下首/进度条/音量），所有按钮其实都在改 store
- Equalizer.tsx：用 `requestAnimationFrame` 循环从 analyser 拉数据画频谱

- [ ] **Step 4: 画一条完整调用链**

按下播放键 → 听到声音的 7 步链：
1. Player.tsx 的播放按钮 onClick
2. → 调 store 的 togglePlay action
3. → store 把 isPlaying 翻成 true
4. → useAudioPlayer 的 useEffect 监听到 isPlaying 变
5. → 调 audioRef.current.play()
6. → 浏览器加载/解码 audio.src 指向的资源
7. → 出声 + timeupdate 事件触发 → 进度同步回 store → UI 进度条移动

- [ ] **Step 5: 抛诊断题**

用 AskUserQuestion 问：「按播放键没声音但歌曲信息显示了」会从这条 7 步链的哪一环开始查？4 个选项：
A. 第 1–3 环（按钮/store）
B. 第 4–5 环（useAudioPlayer 的 effect）
C. 第 6 环（audio.src 资源加载）
D. 第 7 环（事件回调）

- [ ] **Step 6: 公布答案**

最佳答案是 C：「歌曲信息显示了」说明 store 已经更新且 UI 渲染正常，问题在「实际加载/播放」这一环。常见原因：
- src 是个 blob URL 但 IndexedDB 里没那个文件了
- audio 元素被浏览器自动播放策略拦截（首次需要用户交互）
- 文件格式浏览器不支持
排查时打开浏览器控制台看 audio 元素的 error 事件。

- [ ] **Step 7: GATE — 等待"懂了/卡在X"**

---

### Task 3: 第 5–6 章打包发 *(快过批次 2)*

**Files:**
- Read: `frontend/src/utils/indexedDB.ts:1-75`
- Read: `frontend/src/components/FileUploader.tsx:1-145`
- Read: `frontend/src/components/Playlist.tsx:1-120`
- Read: `backend/src/server.ts:1-25`
- Read: `backend/src/middleware/auth.ts:1-18`
- Read: `backend/src/utils/jwt.ts:1-16`

- [ ] **Step 1: 第 5 章 · 本地存储与文件**

讲解点：
- IndexedDB 背景：浏览器内置的、能存大二进制文件的数据库；`indexedDB.ts` 是项目对它的薄包装
- 拖一首 mp3 进去的链路：
  1. FileUploader 接住 File 对象
  2. 调 `indexedDB.ts` 的 saveFile() 存进 IndexedDB（key = 文件名/id）
  3. 读出来时变成 Blob → `URL.createObjectURL(blob)` → 得到 blob URL
  4. blob URL 写进 store 的 `currentSong.url`
  5. useAudioPlayer 把它丢给 `<audio>.src`
- 关键观念：**音频文件不上服务器**，刷新后数据靠 IndexedDB 自己活下来；如果 IndexedDB 被清空，歌单就空了

- [ ] **Step 2: 第 6 章 · 后端骨架**

讲解点：
- Express 背景：`app.use(middleware)` = 装一道关卡；`app.use('/api/x', router)` = 把这条路径交给某个路由文件处理
- 走读 server.ts：
  - cors() 让前端 3000 能访问后端 3001
  - express.json() 解析 JSON body
  - mongoose.connect() 连数据库
  - 三条 `app.use('/api/auth' | '/api/favorites' | '/api/lyrics', ...)` 挂载路由
- 走读 middleware/auth.ts：从请求头拿 `Authorization: Bearer <token>` → 用 jwt.verify 解码 → 把 userId 挂到 req 上 → 放行；失败返 401
- 走读 utils/jwt.ts：sign/verify 两个函数包装 jsonwebtoken 库

- [ ] **Step 3: 两章合并诊断题**

用 AskUserQuestion 问：「调用收藏接口报 401 未授权」从哪个文件开始查？4 个选项：
A. `frontend/src/services/api.ts`（前端是不是没带 token？）
B. `backend/src/middleware/auth.ts`（中间件解码失败？）
C. `backend/src/utils/jwt.ts`（密钥不对？）
D. `backend/src/routes/favorites.ts`（路由配置错？）

- [ ] **Step 4: 公布答案**

正确顺序是 A → B → C：
- 先看前端有没有把 token 放进 Authorization header（常见：登录后没存 token 或没读出来）
- 再看后端中间件是否抛错、抛的什么错（token 过期？签名不对？）
- 最后才怀疑 JWT_SECRET 配置
D 几乎不会是 401 的原因（路由配错通常是 404）

- [ ] **Step 5: GATE — 等待批次 2 反馈**

---

### Task 4: 第 7 章 · 三条业务线 *(详讲)*

**Files:**
- Read: `frontend/src/services/api.ts:1-87`
- Read: `backend/src/routes/auth.ts:1-60`
- Read: `backend/src/routes/favorites.ts:1-59`
- Read: `backend/src/routes/lyrics.ts:1-26`
- Read: `backend/src/models/User.ts:1-17`
- Read: `frontend/src/components/Favorites.tsx:1-94`
- Read: `frontend/src/components/Lyrics.tsx:1-178`

- [ ] **Step 1: 框架讲解 — 一条业务线长什么样**

模板：用户操作（前端组件）→ 调 services/api.ts 里的某函数 → axios 发请求 → 后端路由文件接到 → （可能过 auth 中间件）→ 调用 Mongoose Model 读写 MongoDB → 返回 JSON → 前端拿到数据 → 更新 store / 渲染

- [ ] **Step 2: 业务线 ① auth（注册/登录）**

走读：
- 前端：登录表单（如果有）→ `services/api.ts` 的 login/register
- 后端：`routes/auth.ts` 的 POST /register、POST /login
  - register：bcrypt.hash 密码 → User.create → 返 token
  - login：User.findOne → bcrypt.compare → 返 token
- Model：`models/User.ts`（username/email/password 字段）
- 关键观念：登录成功后 token 存哪？前端要存（通常是 localStorage），后续请求才能带上

- [ ] **Step 3: 业务线 ② favorites（收藏）**

走读：
- 前端：`components/Favorites.tsx` 按钮点击 → `services/api.ts` 的 addFavorite/removeFavorite
- 后端：`routes/favorites.ts`：GET / POST / DELETE，全部走 auth 中间件 → 操作当前用户的 favorites 字段
- 数据形态：收藏存在 User 文档的 `favorites` 数组里（看 User.ts）
- 关键观念：所有 favorites 操作都需要 token；没登录就用不了

- [ ] **Step 4: 业务线 ③ lyrics（歌词）**

走读：
- 前端：`components/Lyrics.tsx` 当前歌曲变化时调 `services/api.ts` 的 fetchLyrics
- 后端：`routes/lyrics.ts`：GET /:songId（不需要 auth？看路由配置）
- 关键观念：歌词是按歌名/songId 查的；如果没匹配到，前端要有"无歌词"兜底

- [ ] **Step 5: 抛诊断题**

用 AskUserQuestion 问：「收藏成功（toast 提示成功了）但刷新后又丢了」前后端两侧分别先看哪里？4 个选项：
A. 前端 Favorites.tsx（toast 是不是假的，根本没发请求？）
B. 后端 routes/favorites.ts 的 POST 处理（写库失败但返了 200？）
C. 前端读取逻辑（写成功了，但刷新后没正确读）
D. User 模型 favorites 字段（schema 配置错了，存进去丢了）

- [ ] **Step 6: 公布答案**

排查应该 A→B→C→D 顺序：
- 先打开 Network 面板看请求真发了吗、状态码什么、响应什么 → 排除 A
- 看后端日志/数据库直接查这条用户记录，favorites 字段真有新元素吗 → 排除 B/D
- 都对的话就是 C：刷新后页面没正确从后端拉回收藏列表
关键观念：**沿着数据流向排查**，不要看到"刷新后丢了"就猜数据库。

- [ ] **Step 7: GATE — 等待"懂了/卡在X"**

---

### Task 5: 第 8 章 · bug 演练（验收章）*(详讲)*

**Files (题目素材):**
- 当前 git status 的 7 个被修改文件（学习者将逐个面对）：
  - `backend/src/server.ts`
  - `frontend/src/components/Equalizer.tsx`
  - `frontend/src/components/Lyrics.tsx`
  - `frontend/src/components/Player.tsx`
  - `frontend/src/hooks/useAudioPlayer.ts`
  - `frontend/src/services/api.ts`
  - `frontend/src/store/playerStore.ts`

- [ ] **Step 1: 教练预先看 diff 准备题面**

执行：`cd "C:/Users/86133/Desktop/音乐播放器" && git diff <每个文件>`
对每个文件，提炼出一句"症状描述"作为题目。例：
- 「歌词显示位置错了 / 不滚动」→ Lyrics.tsx
- 「均衡器卡顿/不动」→ Equalizer.tsx
- 「换歌后进度条不复位」→ useAudioPlayer.ts / playerStore.ts
- 等等
**注意**：题面只描述症状，不暴露文件名。

- [ ] **Step 2: 出题环节（7 道）**

对每道题，按以下流程：
1. 用 AskUserQuestion 给出"症状描述"，让学习者**先报答案**：哪个文件 + 大致位置（函数名/段落即可）
2. 选项不够用时让学习者用"其他"自由回答
3. 学习者答完后，教练对照真实 diff 公布答案，按以下规则打分：
   - 文件名对 = 0.5 分
   - 文件名 + 位置都对 = 1 分
   - 文件名错 = 0 分
4. 累计得分

- [ ] **Step 3: 验收判定**

总分 ≥ 4.2 / 7 → 达成"能定位 bug"目标 → 进 Step 5
总分 < 4.2 / 7 → 进 Step 4

- [ ] **Step 4: 回炉环节（仅在不达标时）**

按答错题目反推所属章节，重讲那一章对应段落。讲完再出 1–2 道"同章节但不同症状"的补充题，验证。

- [ ] **Step 5: 收尾**

向学习者总结：
- 你在哪些方面表现稳（哪些章节命中率高）
- 哪些方面建议日后多看（命中率低或回炉过的章节）
- 给一份"长期参考清单"：列出每章对应文件，作为日后真碰到 bug 时的速查表

- [ ] **Step 6: 把验收结果记入 spec 同目录的 retro**

创建 `docs/superpowers/specs/2026-06-13-music-player-onboarding-retro.md`，记：
- 完成日期
- 验收得分（X / 7）
- 是否回炉、回炉了哪几章
- 学习者后续建议自查的薄弱点
提交：
```bash
cd "C:/Users/86133/Desktop/音乐播放器"
git add docs/superpowers/specs/2026-06-13-music-player-onboarding-retro.md
git commit -m "docs: add onboarding retro for music player project"
```

- [ ] **Step 7: GATE — 计划完成确认**

向用户确认整个学习地图已交付完毕；询问是否需要进入"应用阶段"（用学到的能力实际处理一个真实 bug 或继续开发）。

---

## 计划自检

按 spec 6 节逐项核对：

| spec 要求 | 对应 Task |
|---|---|
| 第 0 章 跑起来（详讲） | Task 0 |
| 第 1 章 整体地图（快过） | Task 1 Step 1 |
| 第 2 章 前端入口（快过） | Task 1 Step 2 |
| 第 3 章 状态中枢（快过） | Task 1 Step 3 |
| 第 4 章 音频引擎（详讲） | Task 2 |
| 第 5 章 本地存储与文件（快过） | Task 3 Step 1 |
| 第 6 章 后端骨架（快过） | Task 3 Step 2 |
| 第 7 章 三条业务线（详讲） | Task 4 |
| 第 8 章 bug 演练（详讲，验收） | Task 5 |
| 命中判定 0.5 / 1 分制 | Task 5 Step 2/3 |
| 命中率 ≥ 60% | Task 5 Step 3 |
| 不达标回炉对应章节 | Task 5 Step 4 |
| 章节末诊断题"先猜后公布" | Task 0/1/2/3/4 各 Step 3-4 |
| 详讲一章一互动 / 快过几章一批 | Task 0、2、4、5 独立；Task 1、3 合批 |

无遗漏。

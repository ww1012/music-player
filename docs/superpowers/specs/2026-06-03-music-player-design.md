
# 音乐播放器设计文档

## 1. 项目概述

本项目是一个基于 Next.js + Express 的混合架构音乐播放器，支持本地音乐导入播放，采用深色主题设计。

## 2. 需求分析

### 2.1 功能需求

| 功能模块 | 功能描述 | 优先级 |
|---------|---------|-------|
| 播放器核心 | 播放/暂停、进度条、音量控制 | 高 |
| 播放列表 | 歌曲列表管理、搜索过滤 | 高 |
| 文件上传 | 拖拽上传、点击选择 | 高 |
| 播放模式 | 单曲循环、列表循环、随机播放 | 中 |
| 歌词显示 | 歌词滚动、同步高亮 | 中 |
| 音效均衡器 | 预设音效、自定义调节 | 中 |
| 收藏功能 | 收藏歌曲、跨设备同步 | 中 |

### 2.2 非功能需求

- UI风格：深色主题，紫色系配色
- 响应式设计：支持桌面端和移动端
- 隐私保护：临时音乐本地存储，不上传服务器

## 3. 架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端层 (Next.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Player UI   │  │  Playlist    │  │  File Uploader      │ │
│  │  (播放控制)   │  │  (播放列表)   │  │  (文件上传/拖拽)     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘ │
│         │                 │                     │              │
│         ▼                 ▼                     ▼              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   Player Store (状态管理)                 │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        后端层 (Express)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Auth API    │  │  Music API   │  │  Lyrics API         │ │
│  │  (用户认证)   │  │  (收藏管理)   │  │  (歌词解析/搜索)     │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         存储层                                  │
│  ┌──────────────┐              ┌──────────────────────┐        │
│  │  MongoDB     │              │  Browser IndexedDB   │        │
│  │  (收藏/用户)  │              │  (临时音乐文件)       │        │
│  └──────────────┘              └──────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 技术栈

| 层次 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js | 14.x |
| UI样式 | Tailwind CSS | 3.x |
| 状态管理 | React Context + useReducer | - |
| 音频处理 | Web Audio API | - |
| 后端框架 | Express.js | 4.x |
| 数据库 | MongoDB | 6.x |
| 身份认证 | JWT | - |

## 4. 核心组件设计

### 4.1 播放器核心组件 (Player)

**功能**:
- 播放/暂停控制
- 进度条拖动
- 音量控制 + 静音
- 播放模式切换（单曲/列表/随机）
- 上一首/下一首

**Props**:
```typescript
interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  playbackMode: 'single' | 'list' | 'random';
  onPlayPause: () => void;
  onProgressChange: (progress: number) => void;
  onVolumeChange: (volume: number) => void;
  onModeChange: (mode: 'single' | 'list' | 'random') => void;
  onPrev: () => void;
  onNext: () => void;
}
```

### 4.2 播放列表组件 (Playlist)

**功能**:
- 歌曲列表展示（封面、歌名、歌手、时长）
- 点击切歌
- 删除/收藏操作
- 搜索过滤

**Props**:
```typescript
interface PlaylistProps {
  songs: Song[];
  currentSongId: string | null;
  onSelectSong: (song: Song) => void;
  onDeleteSong: (songId: string) => void;
  onToggleFavorite: (songId: string) => void;
}
```

### 4.3 文件上传组件 (FileUploader)

**功能**:
- 拖拽上传区域
- 点击选择文件
- 支持 MP3/WAV/OGG 格式
- 批量上传支持

**Props**:
```typescript
interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
}
```

### 4.4 歌词显示组件 (Lyrics)

**功能**:
- 歌词滚动显示
- 歌词搜索功能
- 歌词同步高亮

**Props**:
```typescript
interface LyricsProps {
  lyrics: string[];
  currentLine: number;
}
```

### 4.5 音效均衡器组件 (Equalizer)

**功能**:
- 预设音效（摇滚/流行/古典等）
- 自定义频段调节
- 音效开关

**Props**:
```typescript
interface EqualizerProps {
  enabled: boolean;
  frequencies: number[];
  preset: string | null;
  onToggle: () => void;
  onFrequencyChange: (index: number, value: number) => void;
  onPresetChange: (preset: string) => void;
}
```

## 5. 数据模型

### 5.1 Song（歌曲）

```typescript
interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover?: string;
  fileUrl: string;
  isFavorite: boolean;
  addedAt: Date;
}
```

### 5.2 User（用户）

```typescript
interface User {
  id: string;
  email: string;
  password: string;
  favorites: string[]; // song ids
  createdAt: Date;
}
```

## 6. API 接口设计

### 6.1 认证接口

| 接口 | 方法 | 功能 |
|------|------|------|
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/me` | GET | 获取当前用户信息 |

**POST /api/auth/login**:
- 请求体: `{ email: string, password: string }`
- 响应: `{ success: boolean, token: string, user: User }`

**POST /api/auth/register**:
- 请求体: `{ email: string, password: string }`
- 响应: `{ success: boolean, message: string }`

### 6.2 音乐收藏接口

| 接口 | 方法 | 功能 |
|------|------|------|
| `/api/music/favorites` | GET | 获取收藏列表 |
| `/api/music/favorites` | POST | 添加收藏 |
| `/api/music/favorites/:id` | DELETE | 删除收藏 |

**GET /api/music/favorites**:
- 响应: `{ success: boolean, favorites: Song[] }`

**POST /api/music/favorites**:
- 请求体: `{ song: SongMetadata }`
- 响应: `{ success: boolean, message: string }`

**DELETE /api/music/favorites/:id**:
- 响应: `{ success: boolean, message: string }`

### 6.3 歌词接口

| 接口 | 方法 | 功能 |
|------|------|------|
| `/api/lyrics/search` | GET | 搜索歌词 |

**GET /api/lyrics/search**:
- 参数: `q` (搜索关键词), `artist` (歌手名)
- 响应: `{ success: boolean, lyrics: string }`

## 7. 数据流程

### 7.1 本地音乐导入流程

```
用户选择/拖拽文件 
  → FileReader读取文件
  → 提取元数据(歌名/歌手/封面)
  → IndexedDB存储文件Blob
  → 更新播放列表状态
```

### 7.2 播放流程

```
点击播放
  → 创建AudioContext
  → 从IndexedDB读取文件
  → 创建Blob URL
  → HTML5 Audio元素播放
  → 更新播放状态
```

### 7.3 收藏流程

```
点击收藏
  → 检查是否登录
  → 上传音乐元数据到服务器
  → MongoDB存储收藏记录
  → 返回成功状态
  → 更新本地状态
```

## 8. UI设计规范

### 8.1 颜色方案

| 颜色 | 用途 |
|------|------|
| `#1a1a2e` | 主背景色 |
| `#16213e` | 次背景色 |
| `#9b59b6` | 主色调（正常状态） |
| `#8e44ad` | 主色调（悬停状态） |
| `#ecf0f1` | 文字颜色 |
| `#bdc3c7` | 次要文字颜色 |

### 8.2 组件样式

- **播放器卡片**: 圆角 16px，阴影效果
- **进度条**: 高度 4px，紫色发光效果
- **按钮**: 圆形设计，hover 时放大效果
- **歌词区域**: 半透明背景 (`rgba(255,255,255,0.1)`)

## 9. 部署与集成

### 9.1 开发环境

```bash
# 前端
cd frontend
npm install
npm run dev

# 后端
cd backend
npm install
npm run dev
```

### 9.2 生产环境

- 前端: Vercel 部署
- 后端: Docker + Nginx
- 数据库: MongoDB Atlas

## 10. 安全性考虑

- 用户密码使用 bcrypt 加密存储
- JWT token 设置过期时间
- 文件上传限制大小和类型
- 防止 XSS 和 CSRF 攻击
- 本地音乐不上传服务器，保护隐私

---

**文档版本**: v1.0  
**创建日期**: 2026-06-03  
**状态**: 待审核

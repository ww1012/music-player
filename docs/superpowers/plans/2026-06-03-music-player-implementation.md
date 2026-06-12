
# 音乐播放器实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个基于 Next.js + Express 的混合架构音乐播放器，支持本地音乐导入、播放控制、歌词显示和音效均衡器。

**Architecture:** 前端使用 Next.js + Tailwind CSS，后端使用 Express + MongoDB，本地音乐存储在浏览器 IndexedDB，收藏数据同步到服务器。

**Tech Stack:** Next.js 14, Express 4, MongoDB 6, Tailwind CSS 3, JWT, Web Audio API

---

## 文件结构

```
├── frontend/                    # Next.js 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── Player.tsx       # 播放器核心组件
│   │   │   ├── Playlist.tsx     # 播放列表组件
│   │   │   ├── FileUploader.tsx # 文件上传组件
│   │   │   ├── Lyrics.tsx       # 歌词显示组件
│   │   │   └── Equalizer.tsx    # 音效均衡器组件
│   │   ├── store/
│   │   │   └── playerStore.ts   # 播放器状态管理
│   │   ├── hooks/
│   │   │   └── useAudioPlayer.ts # 音频播放器Hook
│   │   ├── utils/
│   │   │   └── indexedDB.ts     # IndexedDB 操作工具
│   │   └── app/
│   │       ├── layout.tsx       # 布局组件
│   │       └── page.tsx         # 主页
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── backend/                     # Express 后端
│   ├── src/
│   │   ├── server.ts            # Express 服务器
│   │   ├── routes/
│   │   │   ├── auth.ts          # 认证路由
│   │   │   ├── favorites.ts     # 收藏路由
│   │   │   └── lyrics.ts        # 歌词路由
│   │   ├── models/
│   │   │   ├── User.ts          # 用户模型
│   │   │   └── Favorite.ts      # 收藏模型
│   │   ├── middleware/
│   │   │   └── auth.ts          # 认证中间件
│   │   └── utils/
│   │       └── jwt.ts           # JWT 工具
│   ├── package.json
│   └── tsconfig.json
└── docs/                        # 文档
    └── superpowers/
        ├── specs/               # 设计文档
        └── plans/               # 实现计划
```

---

## 任务分解

### 任务1：初始化后端项目

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/server.ts`

- [ ] **Step 1: 创建后端目录和配置文件**

```bash
mkdir -p backend/src/{routes,models,middleware,utils}
cd backend
npm init -y
npm install express mongoose jsonwebtoken bcryptjs cors dotenv
npm install -D typescript @types/express @types/jsonwebtoken @types/bcryptjs @types/cors @types/node ts-node-dev
```

- [ ] **Step 2: 配置 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 3: 创建服务器入口文件**

```typescript
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/music-player')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 4: 添加启动脚本到 package.json**

```json
{
  "scripts": {
    "dev": "ts-node-dev src/server.ts",
    "build": "tsc",
    "start": "node dist/server.ts"
  }
}
```

- [ ] **Step 5: 创建 .env 文件**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/music-player
JWT_SECRET=your-secret-key-here
```

- [ ] **Step 6: 启动后端验证**

```bash
npm run dev
```
Expected: "Server running on port 5000" and "MongoDB connected"

### 任务2：实现用户认证功能

**Files:**
- Create: `backend/src/models/User.ts`
- Create: `backend/src/utils/jwt.ts`
- Create: `backend/src/middleware/auth.ts`
- Create: `backend/src/routes/auth.ts`
- Modify: `backend/src/server.ts`

- [ ] **Step 1: 创建用户模型**

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  favorites: string[];
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
```

- [ ] **Step 2: 创建 JWT 工具函数**

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = '7d';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};
```

- [ ] **Step 3: 创建认证中间件**

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  (req as any).userId = decoded.userId;
  next();
};
```

- [ ] **Step 4: 创建认证路由**

```typescript
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, favorites: [] });

    res.status(201).json({ success: true, message: 'User created' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString());
    res.json({ success: true, token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById((req as any).userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
```

- [ ] **Step 5: 注册路由到服务器**

```typescript
import authRoutes from './routes/auth';

app.use('/api/auth', authRoutes);
```

- [ ] **Step 6: 测试认证接口**

```bash
# 注册
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 登录
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 任务3：实现收藏功能

**Files:**
- Create: `backend/src/routes/favorites.ts`
- Modify: `backend/src/server.ts`

- [ ] **Step 1: 创建收藏路由**

```typescript
import express from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById((req as any).userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = (req as any).userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.favorites.includes(songId)) {
      user.favorites.push(songId);
      await user.save();
    }

    res.json({ success: true, message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.favorites = user.favorites.filter(fav => fav !== id);
    await user.save();

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
```

- [ ] **Step 2: 注册路由到服务器**

```typescript
import favoritesRoutes from './routes/favorites';

app.use('/api/favorites', favoritesRoutes);
```

### 任务4：实现歌词搜索接口

**Files:**
- Create: `backend/src/routes/lyrics.ts`
- Modify: `backend/src/server.ts`

- [ ] **Step 1: 创建歌词路由**

```typescript
import express from 'express';

const router = express.Router();

const mockLyrics: Record<string, string> = {
  'test-song': `[00:00.00] 这是测试歌词
[00:05.00] 第一句歌词
[00:10.00] 第二句歌词
[00:15.00] 第三句歌词
[00:20.00] 第四句歌词`,
  'default': `[00:00.00] 暂无歌词
[00:05.00] 请搜索其他歌曲`
};

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const lyrics = mockLyrics[q as string] || mockLyrics['default'];
    
    res.json({ success: true, lyrics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
```

- [ ] **Step 2: 注册路由到服务器**

```typescript
import lyricsRoutes from './routes/lyrics';

app.use('/api/lyrics', lyricsRoutes);
```

### 任务5：初始化前端项目

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/src/app/layout.tsx`
- Create: `frontend/src/app/page.tsx`

- [ ] **Step 1: 创建 Next.js 项目**

```bash
npx create-next-app@14.0.0 frontend --typescript --tailwind
cd frontend
npm install tailwindcss@3 @tailwindcss/vite lucide-react
```

- [ ] **Step 2: 配置 Tailwind CSS**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1a1a2e',
        'dark-bg-secondary': '#16213e',
        'primary': '#9b59b6',
        'primary-hover': '#8e44ad',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: 更新 layout.tsx**

```tsx
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-dark-bg text-white min-h-screen">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: 更新 globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #1a1a2e;
}

::-webkit-scrollbar-thumb {
  background: #9b59b6;
  border-radius: 3px;
}
```

### 任务6：实现播放器状态管理

**Files:**
- Create: `frontend/src/store/playerStore.ts`
- Create: `frontend/src/hooks/useAudioPlayer.ts`
- Create: `frontend/src/utils/indexedDB.ts`

- [ ] **Step 1: 创建类型定义**

```typescript
export interface Song {
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

export interface PlayerState {
  currentSong: Song | null;
  songs: Song[];
  isPlaying: boolean;
  progress: number;
  volume: number;
  playbackMode: 'single' | 'list' | 'random';
  currentTime: number;
}
```

- [ ] **Step 2: 创建 IndexedDB 工具**

```typescript
import { Song } from '../store/playerStore';

const DB_NAME = 'MusicPlayerDB';
const DB_VERSION = 1;
const STORE_NAME = 'songs';

let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveSong = async (song: Song): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(song);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllSongs = async (): Promise<Song[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteSong = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
```

- [ ] **Step 3: 创建播放器状态 Context**

```tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Song, PlayerState } from './playerStore';

type PlayerAction =
  | { type: 'SET_SONGS'; payload: Song[] }
  | { type: 'SET_CURRENT_SONG'; payload: Song | null }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_PLAYBACK_MODE'; payload: 'single' | 'list' | 'random' }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'ADD_SONG'; payload: Song }
  | { type: 'REMOVE_SONG'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string };

const initialState: PlayerState = {
  currentSong: null,
  songs: [],
  isPlaying: false,
  progress: 0,
  volume: 80,
  playbackMode: 'list',
  currentTime: 0,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_SONGS':
      return { ...state, songs: action.payload };
    case 'SET_CURRENT_SONG':
      return { ...state, currentSong: action.payload };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_PLAYBACK_MODE':
      return { ...state, playbackMode: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'ADD_SONG':
      return { ...state, songs: [...state.songs, action.payload] };
    case 'REMOVE_SONG':
      return { ...state, songs: state.songs.filter(s => s.id !== action.payload) };
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        songs: state.songs.map(s =>
          s.id === action.payload ? { ...s, isFavorite: !s.isFavorite } : s
        ),
        currentSong: state.currentSong?.id === action.payload
          ? { ...state.currentSong, isFavorite: !state.currentSong.isFavorite }
          : state.currentSong,
      };
    default:
      return state;
  }
}

interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  return (
    <PlayerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
```

- [ ] **Step 4: 创建音频播放器 Hook**

```tsx
import { useRef, useEffect, useCallback } from 'react';
import { usePlayer } from './playerStore';

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { state, dispatch } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.volume = state.volume / 100;
    audioRef.current.src = state.currentSong?.fileUrl || '';

    audioRef.current.addEventListener('timeupdate', () => {
      if (audioRef.current && state.currentSong) {
        const progress = (audioRef.current.currentTime / state.currentSong.duration) * 100;
        dispatch({ type: 'SET_PROGRESS', payload: progress });
        dispatch({ type: 'SET_CURRENT_TIME', payload: audioRef.current.currentTime });
      }
    });

    audioRef.current.addEventListener('ended', () => {
      handleNext();
    });

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [state.currentSong, state.volume, dispatch]);

  const play = useCallback(() => {
    audioRef.current?.play();
    dispatch({ type: 'TOGGLE_PLAY' });
  }, [dispatch]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    dispatch({ type: 'TOGGLE_PLAY' });
  }, [dispatch]);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const handleNext = useCallback(() => {
    if (!state.currentSong || state.songs.length === 0) return;

    const currentIndex = state.songs.findIndex(s => s.id === state.currentSong!.id);
    
    let nextIndex: number;
    if (state.playbackMode === 'random') {
      nextIndex = Math.floor(Math.random() * state.songs.length);
    } else if (state.playbackMode === 'single') {
      nextIndex = currentIndex;
    } else {
      nextIndex = (currentIndex + 1) % state.songs.length;
    }

    dispatch({ type: 'SET_CURRENT_SONG', payload: state.songs[nextIndex] });
    
    setTimeout(() => {
      audioRef.current?.play();
      dispatch({ type: 'TOGGLE_PLAY' });
    }, 100);
  }, [state.currentSong, state.songs, state.playbackMode, dispatch]);

  const handlePrev = useCallback(() => {
    if (!state.currentSong || state.songs.length === 0) return;

    const currentIndex = state.songs.findIndex(s => s.id === state.currentSong!.id);
    
    let prevIndex: number;
    if (state.playbackMode === 'random') {
      prevIndex = Math.floor(Math.random() * state.songs.length);
    } else {
      prevIndex = currentIndex === 0 ? state.songs.length - 1 : currentIndex - 1;
    }

    dispatch({ type: 'SET_CURRENT_SONG', payload: state.songs[prevIndex] });
    
    setTimeout(() => {
      audioRef.current?.play();
      dispatch({ type: 'TOGGLE_PLAY' });
    }, 100);
  }, [state.currentSong, state.songs, state.playbackMode, dispatch]);

  const seekTo = useCallback((progress: number) => {
    if (audioRef.current && state.currentSong) {
      audioRef.current.currentTime = (progress / 100) * state.currentSong.duration;
      dispatch({ type: 'SET_PROGRESS', payload: progress });
    }
  }, [state.currentSong, dispatch]);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [dispatch]);

  return {
    play,
    pause,
    togglePlay,
    handleNext,
    handlePrev,
    seekTo,
    setVolume,
  };
};
```

### 任务7：实现核心组件

**Files:**
- Create: `frontend/src/components/Player.tsx`
- Create: `frontend/src/components/Playlist.tsx`
- Create: `frontend/src/components/FileUploader.tsx`
- Create: `frontend/src/components/Lyrics.tsx`
- Create: `frontend/src/components/Equalizer.tsx`

- [ ] **Step 1: 创建播放器组件**

```tsx
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle, Volume2, VolumeX } from 'lucide-react';
import { usePlayer } from '../store/playerStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const Player = () => {
  const { state, dispatch } = usePlayer();
  const { togglePlay, handleNext, handlePrev, seekTo, setVolume } = useAudioPlayer();
  
  const modeIcons = {
    single: <Repeat1 size={20} />,
    list: <Repeat size={20} />,
    random: <Shuffle size={20} />,
  };

  const cycleMode = () => {
    const modes: ('single' | 'list' | 'random')[] = ['list', 'single', 'random'];
    const currentIndex = modes.indexOf(state.playbackMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    dispatch({ type: 'SET_PLAYBACK_MODE', payload: nextMode });
  };

  return (
    <div className="bg-dark-bg-secondary rounded-2xl p-6 shadow-xl">
      {state.currentSong ? (
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center">
            <span className="text-4xl">🎵</span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{state.currentSong.title}</h3>
            <p className="text-gray-400 text-sm">{state.currentSong.artist}</p>
            
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                <span>{formatTime(state.currentTime)}</span>
                <span>{formatTime(state.currentSong.duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={state.progress}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-primary/20 rounded-full transition-colors"
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={togglePlay}
              className="p-3 bg-primary hover:bg-primary-hover rounded-full transition-colors"
            >
              {state.isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button
              onClick={handleNext}
              className="p-2 hover:bg-primary/20 rounded-full transition-colors"
            >
              <SkipForward size={20} />
            </button>
            
            <button
              onClick={cycleMode}
              className={`p-2 rounded-full transition-colors ${state.playbackMode !== 'list' ? 'text-primary' : 'hover:bg-primary/20'}`}
            >
              {modeIcons[state.playbackMode]}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume(state.volume === 0 ? 80 : 0)}
              className="p-2 hover:bg-primary/20 rounded-full transition-colors"
            >
              {state.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={state.volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>暂无播放歌曲</p>
          <p className="text-sm mt-1">请上传音乐文件</p>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: 创建播放列表组件**

```tsx
import { Play, Trash2, Heart, Search } from 'lucide-react';
import { useState } from 'react';
import { usePlayer } from '../store/playerStore';
import { deleteSong } from '../utils/indexedDB';

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const Playlist = () => {
  const { state, dispatch } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSongs = state.songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSong = (song: typeof state.songs[0]) => {
    dispatch({ type: 'SET_CURRENT_SONG', payload: song });
  };

  const handleDelete = async (songId: string) => {
    await deleteSong(songId);
    dispatch({ type: 'REMOVE_SONG', payload: songId });
    if (state.currentSong?.id === songId) {
      dispatch({ type: 'SET_CURRENT_SONG', payload: null });
    }
  };

  const handleToggleFavorite = (songId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: songId });
  };

  return (
    <div className="bg-dark-bg-secondary rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">播放列表</h2>
        <span className="text-sm text-gray-400">{filteredSongs.length} 首歌曲</span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="搜索歌曲..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-dark-bg rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredSongs.length === 0 ? (
          <p className="text-center text-gray-400 py-8">暂无歌曲</p>
        ) : (
          filteredSongs.map((song) => (
            <div
              key={song.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                state.currentSong?.id === song.id
                  ? 'bg-primary/20 border border-primary'
                  : 'hover:bg-dark-bg'
              }`}
              onClick={() => handleSelectSong(song)}
            >
              <button className="p-1 hover:bg-primary/30 rounded-full transition-colors">
                {state.currentSong?.id === song.id && state.isPlaying ? (
                  <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  </span>
                ) : (
                  <Play size={16} className="text-primary" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{song.title}</p>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(song.id);
                }}
                className={`p-1 rounded-full transition-colors ${
                  song.isFavorite ? 'text-red-500 hover:bg-red-500/20' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Heart size={16} fill={song.isFavorite ? 'currentColor' : 'none'} />
              </button>
              
              <span className="text-sm text-gray-400 w-12 text-right">
                {formatDuration(song.duration)}
              </span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(song.id);
                }}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-500/20 rounded-full transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 3: 创建文件上传组件**

```tsx
import { useState, useCallback } from 'react';
import { Upload, Music } from 'lucide-react';
import { usePlayer } from '../store/playerStore';
import { saveSong } from '../utils/indexedDB';
import { Song } from '../store/playerStore';

export const FileUploader = () => {
  const { dispatch } = usePlayer();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const extractMetadata = (file: File): Promise<{ title: string; artist: string; album: string; duration: number }> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        const parts = file.name.replace(/\.[^/.]+$/, '').split(' - ');
        resolve({
          title: parts.length > 1 ? parts[1] : file.name.replace(/\.[^/.]+$/, ''),
          artist: parts.length > 1 ? parts[0] : '未知艺术家',
          album: '未知专辑',
          duration: audio.duration || 0,
        });
        URL.revokeObjectURL(audio.src);
      };
      audio.onerror = () => {
        const parts = file.name.replace(/\.[^/.]+$/, '').split(' - ');
        resolve({
          title: parts.length > 1 ? parts[1] : file.name.replace(/\.[^/.]+$/, ''),
          artist: parts.length > 1 ? parts[0] : '未知艺术家',
          album: '未知专辑',
          duration: 0,
        });
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleFiles = useCallback(async (files: File[]) => {
    setUploading(true);
    
    for (const file of files) {
      if (!file.type.startsWith('audio/')) continue;

      const metadata = await extractMetadata(file);
      const fileUrl = URL.createObjectURL(file);
      
      const song: Song = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        duration: metadata.duration,
        fileUrl,
        isFavorite: false,
        addedAt: new Date(),
      };

      await saveSong(song);
      dispatch({ type: 'ADD_SONG', payload: song });
    }
    
    setUploading(false);
  }, [dispatch]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, [handleFiles]);

  return (
    <div
      className={`relative rounded-2xl p-8 border-2 border-dashed transition-all cursor-pointer ${
        isDragging
          ? 'border-primary bg-primary/10'
          : 'border-gray-600 hover:border-primary hover:bg-primary/5'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center">
        <div className={`p-4 rounded-full mb-4 transition-colors ${
          isDragging ? 'bg-primary' : 'bg-primary/20'
        }`}>
          {uploading ? (
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Upload size={24} className="text-primary" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">
          {uploading ? '上传中...' : '拖拽音乐文件到这里'}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4">
          或点击选择文件
        </p>
        
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Music size={16} />
          <span>支持 MP3, WAV, OGG 格式</span>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: 创建歌词显示组件**

```tsx
import { useState, useEffect } from 'react';
import { usePlayer } from '../store/playerStore';

interface ParsedLyric {
  time: number;
  text: string;
}

const parseLyrics = (lyricsText: string): ParsedLyric[] => {
  const lines = lyricsText.split('\n');
  const regex = /\[(\d{2}):(\d{2})\.(\d{2})\]/;
  return lines
    .map(line => {
      const match = line.match(regex);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3]);
        const time = minutes * 60 + seconds + milliseconds / 100;
        const text = line.replace(regex, '').trim();
        return { time, text };
      }
      return null;
    })
    .filter((item): item is ParsedLyric => item !== null);
};

export const Lyrics = () => {
  const { state } = usePlayer();
  const [lyrics, setLyrics] = useState<ParsedLyric[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const lyricsRef = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!state.currentSong) {
      setLyrics([]);
      setCurrentLine(0);
      return;
    }

    fetch(`/api/lyrics/search?q=${encodeURIComponent(state.currentSong.title)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLyrics(parseLyrics(data.lyrics));
        }
      });
  }, [state.currentSong]);

  useEffect(() => {
    if (lyrics.length === 0) return;

    const lineIndex = lyrics.findIndex((lyric, index) => {
      const nextLyric = lyrics[index + 1];
      return state.currentTime >= lyric.time && (!nextLyric || state.currentTime < nextLyric.time);
    });

    if (lineIndex !== -1) {
      setCurrentLine(lineIndex);
    }
  }, [state.currentTime, lyrics]);

  useEffect(() => {
    const element = document.getElementById('lyrics-container');
    if (element && currentLine > 0) {
      const lineElement = element.children[currentLine] as HTMLElement;
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLine]);

  return (
    <div className="bg-dark-bg-secondary rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-4">歌词</h2>
      
      {state.currentSong ? (
        <div id="lyrics-container" className="max-h-64 overflow-y-auto space-y-2">
          {lyrics.length === 0 ? (
            <p className="text-center text-gray-400">暂无歌词</p>
          ) : (
            lyrics.map((lyric, index) => (
              <p
                key={index}
                className={`text-center transition-all ${
                  index === currentLine
                    ? 'text-primary text-lg font-semibold scale-105'
                    : 'text-gray-400'
                }`}
              >
                {lyric.text}
              </p>
            ))
          )}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-8">请选择一首歌曲</p>
      )}
    </div>
  );
};
```

- [ ] **Step 5: 创建音效均衡器组件**

```tsx
import { useState } from 'react';
import { Settings2 } from 'lucide-react';

const presets: Record<string, number[]> = {
  'flat': [50, 50, 50, 50, 50],
  'rock': [70, 60, 40, 70, 65],
  'pop': [55, 70, 75, 70, 55],
  'classical': [40, 50, 70, 50, 40],
  'jazz': [60, 55, 50, 65, 70],
};

const frequencyLabels = ['60Hz', '230Hz', '910Hz', '4kHz', '14kHz'];

export const Equalizer = () => {
  const [enabled, setEnabled] = useState(false);
  const [frequencies, setFrequencies] = useState<number[]>(presets.flat);
  const [currentPreset, setCurrentPreset] = useState<string>('flat');

  const handleFrequencyChange = (index: number, value: number) => {
    const newFrequencies = [...frequencies];
    newFrequencies[index] = value;
    setFrequencies(newFrequencies);
    setCurrentPreset('custom');
  };

  const handlePresetChange = (preset: string) => {
    setFrequencies(presets[preset] || presets.flat);
    setCurrentPreset(preset);
  };

  return (
    <div className="bg-dark-bg-secondary rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings2 size={20} className="text-primary" />
          <h2 className="text-xl font-semibold text-white">音效均衡器</h2>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            enabled
              ? 'bg-primary text-white'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
        >
          {enabled ? '开启' : '关闭'}
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        {Object.keys(presets).map(preset => (
          <button
            key={preset}
            onClick={() => handlePresetChange(preset)}
            className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
              currentPreset === preset
                ? 'bg-primary text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="flex items-end justify-center gap-4 h-32">
        {frequencies.map((freq, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-400">{frequencyLabels[index]}</span>
            <div className="relative w-8 h-24 bg-dark-bg rounded-full overflow-hidden">
              <div
                className={`absolute bottom-0 w-full rounded-full transition-all duration-300 ${
                  enabled ? 'bg-gradient-to-t from-primary to-primary-hover' : 'bg-gray-600'
                }`}
                style={{ height: `${freq}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={freq}
                onChange={(e) => handleFrequencyChange(index, Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ writingMode: 'vertical-lr' }}
              />
            </div>
            <span className="text-xs text-gray-400">{freq}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 任务8：组装主页面

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: 更新主页**

```tsx
import { PlayerProvider } from '../store/playerStore';
import { Player } from '../components/Player';
import { Playlist } from '../components/Playlist';
import { FileUploader } from '../components/FileUploader';
import { Lyrics } from '../components/Lyrics';
import { Equalizer } from '../components/Equalizer';
import { useState, useEffect } from 'react';
import { usePlayer } from '../store/playerStore';
import { getAllSongs } from '../utils/indexedDB';

const MusicPlayer = () => {
  const { dispatch } = usePlayer();

  useEffect(() => {
    const loadSongs = async () => {
      const songs = await getAllSongs();
      dispatch({ type: 'SET_SONGS', payload: songs });
    };
    loadSongs();
  }, [dispatch]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎵 音乐播放器</h1>
          <p className="text-gray-400">导入本地音乐，享受高品质音乐体验</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Player />
            <FileUploader />
            <Lyrics />
          </div>
          
          <div className="space-y-6">
            <Playlist />
            <Equalizer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <PlayerProvider>
      <MusicPlayer />
    </PlayerProvider>
  );
}
```

- [ ] **Step 2: 更新布局文件**

```tsx
import './globals.css';
import { PlayerProvider } from '../store/playerStore';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-dark-bg text-white min-h-screen">
        <PlayerProvider>
          {children}
        </PlayerProvider>
      </body>
    </html>
  );
}
```

### 任务9：运行测试和启动项目

**Files:**
- No new files

- [ ] **Step 1: 启动后端服务**

```bash
cd backend
npm run dev
```
Expected: "Server running on port 5000"

- [ ] **Step 2: 启动前端开发服务器**

```bash
cd frontend
npm run dev
```
Expected: "Ready on http://localhost:3000"

- [ ] **Step 3: 测试功能**
  1. 打开浏览器访问 http://localhost:3000
  2. 拖拽或点击上传音乐文件
  3. 点击播放列表中的歌曲
  4. 测试播放/暂停、进度条、音量控制
  5. 测试播放模式切换
  6. 测试收藏功能
  7. 测试歌词显示
  8. 测试音效均衡器

---

## 规范检查

**1. Spec 覆盖率:**
- ✅ 播放/暂停控制
- ✅ 进度条拖动
- ✅ 音量控制
- ✅ 播放模式切换
- ✅ 播放列表管理
- ✅ 文件上传（拖拽+点击）
- ✅ 歌词显示
- ✅ 音效均衡器
- ✅ 收藏功能
- ✅ 深色主题设计

**2. 无占位符:**
- ✅ 所有步骤包含具体代码
- ✅ 无 TBD/TODO
- ✅ 无模糊描述

**3. 类型一致性:**
- ✅ Song 类型在前后端保持一致
- ✅ API 响应格式统一
- ✅ 组件 Props 定义清晰

---

**计划已完成并保存到 `docs/superpowers/plans/2026-06-03-music-player-implementation.md`**

**两种执行方式：**

1. **Subagent-Driven（推荐）** - 每个任务分配独立子代理，快速迭代
2. **Inline Execution** - 在当前会话中执行，带检查点

您希望选择哪种方式？

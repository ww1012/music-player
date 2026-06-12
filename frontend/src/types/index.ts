// 音频文件类型
export interface AudioFile {
  id: string;
  name: string;
  artist?: string;
  album?: string;
  duration: number;
  url: string;
  cover?: string;
}

// 播放状态
export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  isShuffling: boolean;
}

// 歌词行
export interface LyricLine {
  time: number;
  text: string;
}

// 用户
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

// 收藏
export interface Favorite {
  id: string;
  userId: string;
  audioId: string;
  createdAt: Date;
}

// 播放列表
export interface Playlist {
  id: string;
  name: string;
  audios: AudioFile[];
  createdAt: Date;
  updatedAt: Date;
}

// API 响应
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

import { ApiResponse, User, Favorite, LyricLine } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 通用请求函数
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || '请求失败',
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: '网络错误',
    };
  }
}

// 认证相关 API
export const authApi = {
  register: (username: string, email: string, password: string) =>
    fetchApi<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),
    
  login: (email: string, password: string) =>
    fetchApi<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    
  getProfile: () =>
    fetchApi<User>('/auth/profile'),
};

// 收藏相关 API
export const favoritesApi = {
  getFavorites: () =>
    fetchApi<Favorite[]>('/favorites'),
    
  addFavorite: (audioId: string) =>
    fetchApi<Favorite>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ audioId }),
    }),
    
  removeFavorite: (audioId: string) =>
    fetchApi<void>(`/favorites/${audioId}`, {
      method: 'DELETE',
    }),
};

// 歌词相关 API
export const lyricsApi = {
  getLyrics: (audioId: string) =>
    fetchApi<LyricLine[]>(`/lyrics/${audioId}`),
    
  uploadLyrics: (audioId: string, lyrics: LyricLine[]) =>
    fetchApi<void>(`/lyrics/${audioId}`, {
      method: 'POST',
      body: JSON.stringify({ lyrics }),
    }),
};

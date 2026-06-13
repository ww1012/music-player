'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover?: string;
  fileUrl: string;
  fileData: string;
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
  equalizerEnabled: boolean;
  // 5 段（60Hz / 230Hz / 910Hz / 4kHz / 14kHz），0-100 范围，50=中性
  equalizerBands: number[];
}

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
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_EQUALIZER_ENABLED'; payload: boolean }
  | { type: 'SET_EQUALIZER_BANDS'; payload: number[] };

const initialState: PlayerState = {
  currentSong: null,
  songs: [],
  isPlaying: false,
  progress: 0,
  volume: 80,
  playbackMode: 'list',
  currentTime: 0,
  equalizerEnabled: false,
  equalizerBands: [50, 50, 50, 50, 50],
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_SONGS':
      return { ...state, songs: action.payload };
    case 'SET_CURRENT_SONG': {
      const isSameSong = state.currentSong?.id === action.payload?.id;
      return {
        ...state,
        currentSong: action.payload,
        // 只有真正切歌时才把进度归零，重新选中正在播的歌不应让进度条跳回 0
        progress: isSameSong ? state.progress : 0,
        currentTime: isSameSong ? state.currentTime : 0,
      };
    }
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
    case 'SET_EQUALIZER_ENABLED':
      return { ...state, equalizerEnabled: action.payload };
    case 'SET_EQUALIZER_BANDS':
      return { ...state, equalizerBands: action.payload };
    default:
      return state;
  }
}

interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  return React.createElement(
    PlayerContext.Provider,
    { value: { state, dispatch } },
    children
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

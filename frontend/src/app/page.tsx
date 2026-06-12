'use client';

import { Player } from '../components/Player';
import { Playlist } from '../components/Playlist';
import { Favorites } from '../components/Favorites';
import { FileUploader } from '../components/FileUploader';
import { Lyrics } from '../components/Lyrics';
import { Equalizer } from '../components/Equalizer';
import { useEffect } from 'react';
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
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
            <span className="inline-block animate-pulse">🎵</span> 音乐播放器
          </h1>
          <p className="text-gray-400">导入本地音乐，享受高品质音乐体验</p>
        </header>

        {/* 播放器区域 - 全宽 */}
        <div className="mb-6">
          <Player />
        </div>

        {/* 主要内容区域 - 两列布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧 */}
          <div className="space-y-6">
            <Lyrics />
            <Equalizer />
            <FileUploader />
          </div>
          
          {/* 右侧 */}
          <div className="space-y-6">
            <Favorites />
            <Playlist />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return <MusicPlayer />;
}

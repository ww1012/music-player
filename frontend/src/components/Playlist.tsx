import { Play, Trash2, Heart, Search } from 'lucide-react';
import { useState } from 'react';
import { usePlayer } from '../store/playerStore';
import { deleteSong, updateSong } from '../utils/indexedDB';

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

  const handleToggleFavorite = async (songId: string) => {
    const song = state.songs.find(s => s.id === songId);
    if (song) {
      const updatedSong = { ...song, isFavorite: !song.isFavorite };
      await updateSong(updatedSong);
      dispatch({ type: 'TOGGLE_FAVORITE', payload: songId });
    }
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

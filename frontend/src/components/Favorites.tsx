import { Play, Heart, Music } from 'lucide-react';
import { usePlayer } from '../store/playerStore';
import { updateSong } from '../utils/indexedDB';

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const Favorites = () => {
  const { state, dispatch } = usePlayer();

  const favoriteSongs = state.songs.filter(song => song.isFavorite);

  const handleSelectSong = (song: typeof state.songs[0]) => {
    dispatch({ type: 'SET_CURRENT_SONG', payload: song });
  };

  const handleRemoveFavorite = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const song = state.songs.find(s => s.id === songId);
    if (song) {
      const updatedSong = { ...song, isFavorite: false };
      await updateSong(updatedSong);
      dispatch({ type: 'TOGGLE_FAVORITE', payload: songId });
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 rounded-2xl p-6 shadow-xl border border-gray-700/30 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-2xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-red-500" fill="currentColor" />
            <h2 className="text-xl font-bold text-white tracking-wide">我的收藏</h2>
          </div>
          <span className="text-sm text-gray-400">{favoriteSongs.length} 歌曲</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {favoriteSongs.length === 0 ? (
            <div className="text-center py-8">
              <Music size={32} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400 font-medium">暂无收藏歌曲</p>
              <p className="text-sm text-gray-500 mt-2">点击歌曲列表中的爱心图标添加收藏</p>
            </div>
          ) : (
            favoriteSongs.map((song) => (
              <div
                key={song.id}
                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${state.currentSong?.id === song.id
                    ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50'
                    : 'bg-gray-800/30 hover:bg-gray-700/50'
                  }`}
                onClick={() => handleSelectSong(song)}
              >
                <button className="relative p-2 rounded-full bg-gray-800/50 group-hover:bg-red-500/20 transition-colors">
                  {state.currentSong?.id === song.id && state.isPlaying ? (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                  ) : (
                    <Play size={16} className="text-gray-300 group-hover:text-red-400 transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate transition-colors ${state.currentSong?.id === song.id ? 'text-red-400' : 'text-white group-hover:text-red-300'
                    }`}>
                    {song.title}
                  </p>
                  <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                </div>

                <button
                  onClick={(e) => handleRemoveFavorite(song.id, e)}
                  className="p-2 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                >
                  <Heart size={16} fill="currentColor" />
                </button>

                <span className="text-sm text-gray-400 w-12 text-right font-mono">
                  {formatDuration(song.duration)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
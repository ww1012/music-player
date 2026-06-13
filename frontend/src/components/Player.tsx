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
    <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 rounded-2xl p-6 shadow-2xl border border-gray-700/30 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl pointer-events-none" />
      
      {state.currentSong ? (
        <div className="relative flex items-center gap-6">
          <div className="relative w-24 h-24">
            <div className={`absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-500 ${state.isPlaying ? 'animate-pulse' : ''}`}>
              <div className="absolute inset-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-4xl">🎵</span>
              </div>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/50 to-pink-500/50 rounded-xl blur-md opacity-50" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white tracking-wide">{state.currentSong.title}</h3>
            <p className="text-gray-400 text-sm mt-1 font-medium">{state.currentSong.artist}</p>
            
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span className="font-mono text-gray-300">{formatTime(state.currentTime)}</span>
                <span className="font-mono text-gray-500">{formatTime(state.currentSong.duration)}</span>
              </div>
              <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transition-all duration-100"
                  style={{ width: `${state.progress}%` }}
                />
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/30 to-transparent rounded-full transition-all duration-100"
                  style={{ width: `${state.progress}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.progress}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-purple-500/50 opacity-0 transition-opacity duration-200"
                  style={{ left: `calc(${state.progress}% - 8px)` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="group relative p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <SkipBack size={20} className="text-gray-300 group-hover:text-white transition-colors" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button
              onClick={togglePlay}
              className="group relative p-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
            >
              {state.isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-0.5" />}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`absolute inset-0 rounded-full bg-purple-500/50 blur-xl opacity-0 transition-opacity duration-300 ${state.isPlaying ? 'opacity-50' : ''}`} />
            </button>
            
            <button
              onClick={handleNext}
              className="group relative p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <SkipForward size={20} className="text-gray-300 group-hover:text-white transition-colors" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button
              onClick={cycleMode}
              className={`group relative p-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${state.playbackMode !== 'list' ? 'bg-primary/20 text-primary' : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white'}`}
            >
              {modeIcons[state.playbackMode]}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setVolume(state.volume === 0 ? 80 : 0)}
              className="group relative p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {state.volume === 0 ? <VolumeX size={20} className="text-gray-400" /> : <Volume2 size={20} className="text-gray-300 group-hover:text-white transition-colors" />}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="relative w-24 h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100"
                style={{ width: `${state.volume}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={state.volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-4">
            <span className="text-3xl opacity-50">🎵</span>
          </div>
          <p className="text-gray-400 font-medium">暂无播放歌曲</p>
          <p className="text-sm text-gray-500 mt-1">请上传音乐文件开始播放</p>
        </div>
      )}
    </div>
  );
};

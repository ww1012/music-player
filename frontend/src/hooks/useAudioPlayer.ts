import { useRef, useEffect, useCallback } from 'react';
import { usePlayer } from '../store/playerStore';

const EQ_FREQUENCIES = [60, 230, 910, 4000, 14000];
const bandValueToGainDb = (value: number): number => ((value - 50) / 50) * 12;

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const prevSongIdRef = useRef<string | null>(null);
  const wasPlayingRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodesRef = useRef<BiquadFilterNode[]>([]);
  const { state, dispatch } = usePlayer();

  // 清理 Blob URL
  const cleanupBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  // 懒构造 audio + 均衡器滤波链：source → 5 个 peaking filter → destination
  const ensureAudioGraph = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    if (audioContextRef.current || typeof window === 'undefined') {
      return;
    }
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;

    const ctx: AudioContext = new Ctx();
    const source = ctx.createMediaElementSource(audioRef.current);
    const filters = EQ_FREQUENCIES.map(freq => {
      const f = ctx.createBiquadFilter();
      f.type = 'peaking';
      f.frequency.value = freq;
      f.Q.value = 1;
      f.gain.value = 0;
      return f;
    });

    // 串联：source -> f0 -> f1 -> ... -> destination
    source.connect(filters[0]);
    for (let i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i + 1]);
    }
    filters[filters.length - 1].connect(ctx.destination);

    audioContextRef.current = ctx;
    sourceNodeRef.current = source;
    filterNodesRef.current = filters;
  }, []);

  // 音频加载和自动播放
  useEffect(() => {
    ensureAudioGraph();
    const audio = audioRef.current;
    if (!audio) return;

    const currentSong = state.currentSong;

    if (!currentSong) {
      audio.pause();
      audio.src = '';
      cleanupBlobUrl();
      prevSongIdRef.current = null;
      return;
    }

    const songId = currentSong.id;

    // 只有歌曲 ID 变化时才重新加载
    if (prevSongIdRef.current !== songId) {
      wasPlayingRef.current = state.isPlaying || songId !== prevSongIdRef.current;

      // 停止当前播放
      audio.pause();
      cleanupBlobUrl();

      // 加载新歌曲
      if (currentSong.fileData) {
        try {
          const byteString = atob(currentSong.fileData.split(',')[1]);
          const mimeType = currentSong.fileData.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeType });
          const blobUrl = URL.createObjectURL(blob);
          blobUrlRef.current = blobUrl;
          audio.src = blobUrl;

          // 如果之前在播放或切换了歌曲，自动播放
          if (wasPlayingRef.current) {
            // AudioContext 在用户交互前是 suspended，第一次播放时需要 resume
            if (audioContextRef.current?.state === 'suspended') {
              audioContextRef.current.resume().catch(() => {});
            }
            audio.play().catch(err => console.error('Auto-play failed:', err));
            if (!state.isPlaying) {
              dispatch({ type: 'TOGGLE_PLAY' });
            }
          }
        } catch (err) {
          console.error('Failed to load audio:', err);
        }
      }

      prevSongIdRef.current = songId;
    }

    // 事件处理
    const handleTimeUpdate = () => {
      if (audio && currentSong) {
        const duration = audio.duration || currentSong.duration;
        if (duration > 0 && audio.currentTime > 0) {
          const progress = (audio.currentTime / duration) * 100;
          dispatch({ type: 'SET_PROGRESS', payload: progress });
          dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
        }
      }
    };

    const handleEnded = () => {
      // 播放结束后自动切换下一首
      if (state.playbackMode === 'single') {
        audio.currentTime = 0;
        audio.play().catch(err => console.error('Replay failed:', err));
      } else if (state.songs.length > 0) {
        const currentIndex = state.songs.findIndex(s => s.id === currentSong!.id);
        let nextIndex: number;
        if (state.playbackMode === 'random') {
          nextIndex = Math.floor(Math.random() * state.songs.length);
        } else {
          nextIndex = (currentIndex + 1) % state.songs.length;
        }
        dispatch({ type: 'SET_CURRENT_SONG', payload: state.songs[nextIndex] });
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', audio.error);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [state.currentSong, state.isPlaying, state.playbackMode, dispatch, cleanupBlobUrl]);

  // 音量控制
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume / 100;
    }
  }, [state.volume]);

  // 同步均衡器到滤波链：关闭时所有 gain=0（peaking 0dB 等同直通）
  useEffect(() => {
    const filters = filterNodesRef.current;
    if (filters.length === 0) return;
    filters.forEach((f, i) => {
      const gainDb = state.equalizerEnabled
        ? bandValueToGainDb(state.equalizerBands[i] ?? 50)
        : 0;
      f.gain.value = gainDb;
    });
  }, [state.equalizerEnabled, state.equalizerBands]);

  // 切换到下一首
  const goToNext = useCallback(() => {
    if (!state.currentSong || state.songs.length === 0) return;

    const currentIndex = state.songs.findIndex(s => s.id === state.currentSong!.id);

    let nextIndex: number;
    if (state.playbackMode === 'random') {
      nextIndex = Math.floor(Math.random() * state.songs.length);
    } else {
      nextIndex = (currentIndex + 1) % state.songs.length;
    }

    dispatch({ type: 'SET_CURRENT_SONG', payload: state.songs[nextIndex] });
  }, [state.currentSong, state.songs, state.playbackMode, dispatch]);

  // 切换到上一首
  const goToPrev = useCallback(() => {
    if (!state.currentSong || state.songs.length === 0) return;

    const currentIndex = state.songs.findIndex(s => s.id === state.currentSong!.id);

    let prevIndex: number;
    if (state.playbackMode === 'random') {
      prevIndex = Math.floor(Math.random() * state.songs.length);
    } else {
      prevIndex = currentIndex === 0 ? state.songs.length - 1 : currentIndex - 1;
    }

    dispatch({ type: 'SET_CURRENT_SONG', payload: state.songs[prevIndex] });
  }, [state.currentSong, state.songs, state.playbackMode, dispatch]);

  // 播放
  const play = useCallback(() => {
    if (audioRef.current && state.currentSong) {
      // AudioContext 在用户交互前是 suspended，需要 resume 才有声音
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      audioRef.current.play().catch(err => console.error('Play failed:', err));
      if (!state.isPlaying) {
        dispatch({ type: 'TOGGLE_PLAY' });
      }
    }
  }, [state.currentSong, state.isPlaying, dispatch]);

  // 暂停
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (state.isPlaying) {
        dispatch({ type: 'TOGGLE_PLAY' });
      }
    }
  }, [state.isPlaying, dispatch]);

  // 切换播放/暂停
  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  // 跳转到进度
  const seekTo = useCallback((progress: number) => {
    if (audioRef.current && state.currentSong) {
      const duration = audioRef.current.duration || state.currentSong.duration;
      if (duration > 0) {
        audioRef.current.currentTime = (progress / 100) * duration;
      }
    }
  }, [state.currentSong]);

  // 设置音量
  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  }, [dispatch]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        // HTMLMediaElement 一旦被 createMediaElementSource 接过就永久绑定，
        // 必须丢弃元素本身，下次 mount 时 new Audio() 重建，否则 Strict Mode
        // 双挂载会撞 InvalidStateError。
        audioRef.current = null;
      }
      cleanupBlobUrl();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
        sourceNodeRef.current = null;
        filterNodesRef.current = [];
      }
    };
  }, [cleanupBlobUrl]);

  return {
    play,
    pause,
    togglePlay,
    handleNext: goToNext,
    handlePrev: goToPrev,
    seekTo,
    setVolume,
  };
};
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(async (files: File[]) => {
    setUploading(true);
    
    for (const file of files) {
      if (!file.type.startsWith('audio/')) continue;

      const metadata = await extractMetadata(file);
      const fileData = await fileToBase64(file);
      const fileUrl = URL.createObjectURL(file);
      
      const song: Song = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        duration: metadata.duration,
        fileUrl,
        fileData,
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

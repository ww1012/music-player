import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../store/playerStore';
import { FileText, Upload } from 'lucide-react';

interface ParsedLyric {
  time: number;
  text: string;
}

const parseLyrics = (lyricsText: string): ParsedLyric[] => {
  const lines = lyricsText.split('\n');
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
  return lines
    .map(line => {
      const match = line.match(regex);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3]);
        const time = minutes * 60 + seconds + milliseconds / (match[3].length === 2 ? 100 : 1000);
        const text = line.replace(regex, '').trim();
        return { time, text };
      }
      return null;
    })
    .filter((item): item is ParsedLyric => item !== null && item.text !== '');
};

export const Lyrics = () => {
  const { state } = usePlayer();
  const [lyrics, setLyrics] = useState<ParsedLyric[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLyricsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setLyrics(parseLyrics(text));
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (!state.currentSong) {
      setLyrics([]);
      setCurrentLine(0);
      return;
    }

    setIsLoading(true);
    
    fetch(`http://localhost:5000/api/lyrics/search?q=${encodeURIComponent(state.currentSong.title)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.lyrics) {
          const parsed = parseLyrics(data.lyrics);
          if (parsed.length > 0) {
            setLyrics(parsed);
          } else {
            setLyrics([]);
          }
        }
      })
      .catch(() => {
        setLyrics([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [state.currentSong]);

  useEffect(() => {
    if (lyrics.length === 0) return;

    const lineIndex = lyrics.findIndex((lyric, index) => {
      const nextLyric = lyrics[index + 1];
      return state.currentTime >= lyric.time && (!nextLyric || state.currentTime < nextLyric.time);
    });

    if (lineIndex !== -1 && lineIndex !== currentLine) {
      setCurrentLine(lineIndex);
    }
  }, [state.currentTime, lyrics]);

  useEffect(() => {
    if (containerRef.current && currentLine >= 0) {
      const lineElements = containerRef.current.querySelectorAll('.lyric-line');
      const currentElement = lineElements[currentLine] as HTMLElement;
      const container = containerRef.current;
      if (currentElement) {
        const containerHeight = container.clientHeight;
        const lineTop = currentElement.offsetTop;
        const lineHeight = currentElement.offsetHeight;
        container.scrollTo({
          top: lineTop - containerHeight / 2 + lineHeight / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [currentLine]);

  return (
    <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 rounded-2xl p-6 shadow-xl border border-gray-700/30 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-wide">歌词</h2>
          <label className="group relative cursor-pointer">
            <input
              type="file"
              accept=".lrc,.txt"
              onChange={handleLyricsUpload}
              className="hidden"
            />
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105">
              <Upload size={16} className="text-gray-300 group-hover:text-white transition-colors" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">上传歌词</span>
            </div>
          </label>
        </div>
        
        {state.currentSong ? (
          <div 
            ref={containerRef}
            className="max-h-64 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : lyrics.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={32} className="mx-auto text-gray-500 mb-3" />
                <p className="text-gray-400 font-medium">暂无歌词</p>
                <p className="text-sm text-gray-500 mt-2">上传 .lrc 歌词文件以同步显示</p>
              </div>
            ) : (
              lyrics.map((lyric, index) => (
                <p
                  key={index}
                  className={`lyric-line text-center transition-all duration-300 ${
                    index === currentLine
                      ? 'text-primary text-lg font-semibold scale-105 opacity-100'
                      : 'text-gray-400 opacity-60'
                  }`}
                >
                  {lyric.text}
                </p>
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText size={32} className="mx-auto text-gray-500 mb-3" />
            <p className="text-gray-400 font-medium">请选择一首歌曲</p>
          </div>
        )}
      </div>
    </div>
  );
};

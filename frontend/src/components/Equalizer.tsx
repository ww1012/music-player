import { useState } from 'react';
import { Settings2 } from 'lucide-react';

const presets: Record<string, number[]> = {
  'flat': [50, 50, 50, 50, 50],
  'rock': [70, 60, 40, 70, 65],
  'pop': [55, 70, 75, 70, 55],
  'classical': [40, 50, 70, 50, 40],
  'jazz': [60, 55, 50, 65, 70],
};

const frequencyLabels = ['60Hz', '230Hz', '910Hz', '4kHz', '14kHz'];

export const Equalizer = () => {
  const [enabled, setEnabled] = useState(false);
  const [frequencies, setFrequencies] = useState<number[]>(presets.flat);
  const [currentPreset, setCurrentPreset] = useState<string>('flat');

  const handleFrequencyChange = (index: number, value: number) => {
    const newFrequencies = [...frequencies];
    newFrequencies[index] = value;
    setFrequencies(newFrequencies);
    setCurrentPreset('custom');
  };

  const handlePresetChange = (preset: string) => {
    setFrequencies(presets[preset] || presets.flat);
    setCurrentPreset(preset);
  };

  return (
    <div className="bg-dark-bg-secondary rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings2 size={20} className="text-primary" />
          <h2 className="text-xl font-semibold text-white">音效均衡器</h2>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            enabled
              ? 'bg-primary text-white'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
        >
          {enabled ? '开启' : '关闭'}
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        {Object.keys(presets).map(preset => (
          <button
            key={preset}
            onClick={() => handlePresetChange(preset)}
            className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
              currentPreset === preset
                ? 'bg-primary text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="flex items-end justify-center gap-4 h-32">
        {frequencies.map((freq, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-400">{frequencyLabels[index]}</span>
            <div className="relative w-8 h-24 bg-dark-bg rounded-full overflow-hidden">
              <div
                className={`absolute bottom-0 w-full rounded-full transition-all duration-300 ${
                  enabled ? 'bg-gradient-to-t from-primary to-primary-hover' : 'bg-gray-600'
                }`}
                style={{ height: `${freq}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={freq}
                onChange={(e) => handleFrequencyChange(index, Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ writingMode: 'vertical-lr' }}
              />
            </div>
            <span className="text-xs text-gray-400">{freq}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

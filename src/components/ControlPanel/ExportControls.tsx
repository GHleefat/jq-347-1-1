import { RefObject } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useKaleidoscopeStore } from '@/hooks/useKaleidoscopeStore';
import { ExportResolution, ExportFormat, RESOLUTION_MAP } from '@/types';
import { cn } from '@/lib/utils';
import { KaleidoscopePatternHandle } from '@/components/PatternPreview/KaleidoscopePattern';

const resolutions: ExportResolution[] = ['1080p', '2k', '4k'];
const formats: ExportFormat[] = ['png', 'jpg'];

interface ExportControlsProps {
  patternRef: RefObject<KaleidoscopePatternHandle>;
}

export default function ExportControls({ patternRef }: ExportControlsProps) {
  const exportConfig = useKaleidoscopeStore((s) => s.exportConfig);
  const isExporting = useKaleidoscopeStore((s) => s.isExporting);
  const updateExportConfig = useKaleidoscopeStore((s) => s.updateExportConfig);

  const handleExport = async () => {
    if (isExporting || !patternRef.current) return;
    await patternRef.current.exportImage();
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs font-medium text-white/70 font-body block mb-2">分辨率</span>
        <div className="grid grid-cols-3 gap-2">
          {resolutions.map((res) => (
            <button
              key={res}
              onClick={() => updateExportConfig({ resolution: res })}
              className={cn(
                'py-2 rounded-xl border text-xs font-medium transition-all duration-300 font-display',
                exportConfig.resolution === res
                  ? 'bg-gradient-to-r from-kaleido-purple/30 to-kaleido-blue/30 border-kaleido-purple text-white shadow-glow-purple'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
              )}
            >
              {RESOLUTION_MAP[res].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-medium text-white/70 font-body block mb-2">格式</span>
        <div className="grid grid-cols-2 gap-2">
          {formats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => updateExportConfig({ format: fmt })}
              className={cn(
                'py-2 rounded-xl border text-xs font-medium uppercase transition-all duration-300 font-display tracking-wider',
                exportConfig.format === fmt
                  ? 'bg-gradient-to-r from-kaleido-pink/30 to-kaleido-purple/30 border-kaleido-pink text-white shadow-glow-pink'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
              )}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {exportConfig.format === 'jpg' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/70 font-body">质量</span>
            <span className="text-xs font-mono text-kaleido-blue bg-kaleido-blue/10 px-2 py-0.5 rounded-md">
              {exportConfig.quality.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.01}
            value={exportConfig.quality}
            onChange={(e) => updateExportConfig({ quality: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={isExporting}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-300 relative overflow-hidden',
          'bg-gradient-to-r from-kaleido-pink via-kaleido-purple to-kaleido-blue',
          'text-white shadow-glow-strong hover:shadow-[0_0_50px_rgba(185,103,255,0.7),0_0_80px_rgba(0,240,255,0.4)]',
          'active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed'
        )}
      >
        <span
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full animate-[shimmer_2s_infinite]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'shimmer 2s infinite',
          }}
        />
        {isExporting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            导出中...
          </>
        ) : (
          <>
            <Download size={16} />
            导出图像
          </>
        )}
      </button>

      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

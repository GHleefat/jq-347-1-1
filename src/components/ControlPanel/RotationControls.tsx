import { RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import { useKaleidoscopeStore } from '@/hooks/useKaleidoscopeStore';
import { cn } from '@/lib/utils';

export default function RotationControls() {
  const rotationConfig = useKaleidoscopeStore((s) => s.rotationConfig);
  const updateRotationConfig = useKaleidoscopeStore((s) => s.updateRotationConfig);

  const handleReset = () => {
    updateRotationConfig({
      speed: 0.3,
      direction: 1,
      autoRotate: true,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/70 font-body">自动旋转</span>
        <button
          onClick={() => updateRotationConfig({ autoRotate: !rotationConfig.autoRotate })}
          className={cn(
            'relative w-12 h-6 rounded-full transition-all duration-300',
            rotationConfig.autoRotate
              ? 'bg-gradient-to-r from-kaleido-purple to-kaleido-pink shadow-glow-pink'
              : 'bg-white/10'
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md',
              rotationConfig.autoRotate ? 'left-6' : 'left-0.5'
            )}
          />
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-white/70 font-body">旋转速度</span>
          <span className="text-xs font-mono text-kaleido-blue bg-kaleido-blue/10 px-2 py-0.5 rounded-md">
            {rotationConfig.speed.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={rotationConfig.speed}
          onChange={(e) => updateRotationConfig({ speed: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <span className="text-xs font-medium text-white/70 font-body block mb-2">旋转方向</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateRotationConfig({ direction: 1 })}
            className={cn(
              'flex items-center justify-center gap-2 py-2 rounded-xl border transition-all duration-300 font-body text-xs',
              rotationConfig.direction === 1
                ? 'bg-gradient-to-r from-kaleido-purple/30 to-kaleido-blue/30 border-kaleido-purple text-white shadow-glow-purple'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
            )}
          >
            <ArrowRight size={14} />
            顺时针
          </button>
          <button
            onClick={() => updateRotationConfig({ direction: -1 })}
            className={cn(
              'flex items-center justify-center gap-2 py-2 rounded-xl border transition-all duration-300 font-body text-xs',
              rotationConfig.direction === -1
                ? 'bg-gradient-to-r from-kaleido-pink/30 to-kaleido-purple/30 border-kaleido-pink text-white shadow-glow-pink'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
            )}
          >
            <ArrowLeft size={14} />
            逆时针
          </button>
        </div>
      </div>

      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 py-2 glass-button text-xs"
      >
        <RefreshCw size={14} />
        重置旋转
      </button>
    </div>
  );
}

import { useRef } from 'react';
import { KaleidoscopeScene } from '@/components/KaleidoscopeScene/KaleidoscopeScene';
import { KaleidoscopePattern, KaleidoscopePatternHandle } from '@/components/PatternPreview/KaleidoscopePattern';
import ControlPanel from '@/components/ControlPanel/ControlPanel';
import ObjectToolbar from '@/components/ObjectToolbar/ObjectToolbar';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const patternRef = useRef<KaleidoscopePatternHandle>(null);

  return (
    <div className="relative w-full h-full bg-kaleido-bg overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(185, 103, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(0, 240, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(255, 45, 149, 0.05) 0%, transparent 60%)
          `,
        }}
      />

      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-kaleido-pink via-kaleido-purple to-kaleido-blue flex items-center justify-center shadow-glow-strong">
          <Sparkles size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-kaleido-pink via-kaleido-purple to-kaleido-blue bg-clip-text text-transparent">
            虚拟万花筒
          </h1>
          <p className="text-xs text-white/40 font-body">Kaleidoscope Studio</p>
        </div>
      </div>

      <div className="absolute inset-0">
        <KaleidoscopeScene className="w-full h-full" />
      </div>

      <div className="absolute top-1/2 left-8 -translate-y-1/2 z-10">
        <div className="flex flex-col items-center gap-4">
          <KaleidoscopePattern ref={patternRef} size={420} />
          <div className="text-center">
            <p className="font-display text-sm text-white/60 tracking-wider">
              万花筒图案
            </p>
            <p className="text-xs text-white/30 mt-1 font-body">
              实时预览对称花纹
            </p>
          </div>
        </div>
      </div>

      <ControlPanel patternRef={patternRef} />
      <ObjectToolbar />

      <div className="absolute bottom-4 left-4 z-10 text-xs text-white/30 font-body">
        <p>拖拽场景旋转视角 · 滚轮缩放</p>
      </div>
    </div>
  );
}

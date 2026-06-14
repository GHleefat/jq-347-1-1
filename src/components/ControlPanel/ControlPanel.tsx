import { useState, ReactNode, RefObject } from 'react';
import { ChevronDown, Layers, RotateCw, Box, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import MirrorControls from './MirrorControls';
import RotationControls from './RotationControls';
import ObjectControls from './ObjectControls';
import ExportControls from './ExportControls';
import { KaleidoscopePatternHandle } from '@/components/PatternPreview/KaleidoscopePattern';

interface SectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

interface ControlPanelProps {
  patternRef: RefObject<KaleidoscopePatternHandle>;
}

function CollapsibleSection({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span className="text-kaleido-purple group-hover:text-kaleido-pink transition-colors">
            {icon}
          </span>
          <span className="font-display text-sm font-semibold text-white/90 tracking-wide">
            {title}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-white/60 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 pb-4 pt-1">{children}</div>
      </div>
    </div>
  );
}

export default function ControlPanel({ patternRef }: ControlPanelProps) {
  return (
    <div className="absolute top-4 right-4 bottom-24 w-80 glass-panel neon-border overflow-hidden flex flex-col z-20">
      <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-kaleido-purple/10 to-kaleido-blue/10">
        <h2 className="font-display text-lg font-bold bg-gradient-to-r from-kaleido-pink via-kaleido-purple to-kaleido-blue bg-clip-text text-transparent neon-text">
          控制面板
        </h2>
        <p className="text-xs text-white/40 mt-1 font-body">
          调整万花筒参数与物体属性
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <CollapsibleSection
          title="镜片设置"
          icon={<Layers size={18} />}
          defaultOpen
        >
          <MirrorControls />
        </CollapsibleSection>

        <CollapsibleSection
          title="旋转控制"
          icon={<RotateCw size={18} />}
          defaultOpen
        >
          <RotationControls />
        </CollapsibleSection>

        <CollapsibleSection
          title="物体属性"
          icon={<Box size={18} />}
          defaultOpen
        >
          <ObjectControls />
        </CollapsibleSection>

        <CollapsibleSection
          title="导出设置"
          icon={<Download size={18} />}
          defaultOpen
        >
          <ExportControls patternRef={patternRef} />
        </CollapsibleSection>
      </div>
    </div>
  );
}

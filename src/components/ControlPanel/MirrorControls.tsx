import { useKaleidoscopeStore } from '@/hooks/useKaleidoscopeStore';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

function SliderRow({ label, value, min, max, step = 1, unit = '', onChange }: SliderRowProps) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/70 font-body">{label}</span>
        <span className="text-xs font-mono text-kaleido-blue bg-kaleido-blue/10 px-2 py-0.5 rounded-md">
          {value.toFixed(step < 1 ? 2 : 0)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

export default function MirrorControls() {
  const mirrorConfig = useKaleidoscopeStore((s) => s.mirrorConfig);
  const updateMirrorConfig = useKaleidoscopeStore((s) => s.updateMirrorConfig);

  return (
    <div className="space-y-2">
      <SliderRow
        label="镜片数量"
        value={mirrorConfig.count}
        min={3}
        max={12}
        step={1}
        onChange={(v) => updateMirrorConfig({ count: Math.round(v) })}
      />
      <SliderRow
        label="镜面角度"
        value={mirrorConfig.angle}
        min={0}
        max={360}
        step={1}
        unit="°"
        onChange={(v) => updateMirrorConfig({ angle: Math.round(v) })}
      />
      <SliderRow
        label="反射强度"
        value={mirrorConfig.reflectivity}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => updateMirrorConfig({ reflectivity: v })}
      />
    </div>
  );
}

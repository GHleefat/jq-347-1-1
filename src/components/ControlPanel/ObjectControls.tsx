import { MousePointer2, Trash2 } from 'lucide-react';
import { useKaleidoscopeStore } from '@/hooks/useKaleidoscopeStore';
import { PRESET_COLORS, OBJECT_TYPES } from '@/types';
import { cn } from '@/lib/utils';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

function SliderRow({ label, value, min, max, step = 0.01, onChange }: SliderRowProps) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/70 font-body">{label}</span>
        <span className="text-xs font-mono text-kaleido-blue bg-kaleido-blue/10 px-2 py-0.5 rounded-md">
          {value.toFixed(2)}
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

export default function ObjectControls() {
  const objects = useKaleidoscopeStore((s) => s.objects);
  const selectedObjectId = useKaleidoscopeStore((s) => s.selectedObjectId);
  const updateObject = useKaleidoscopeStore((s) => s.updateObject);
  const removeObject = useKaleidoscopeStore((s) => s.removeObject);

  const selectedObject = objects.find((o) => o.id === selectedObjectId);
  const objectTypeLabel = OBJECT_TYPES.find((t) => t.type === selectedObject?.type)?.label || '';

  if (!selectedObject) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
          <MousePointer2 size={24} className="text-white/30" />
        </div>
        <p className="text-sm text-white/50 font-body">点击场景中的物体</p>
        <p className="text-xs text-white/30 font-body mt-1">即可编辑其属性</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
        <div
          className="w-8 h-8 rounded-lg shadow-lg"
          style={{ backgroundColor: selectedObject.color, boxShadow: `0 0 15px ${selectedObject.emissive}80` }}
        />
        <div>
          <p className="text-sm font-semibold text-white font-display">{objectTypeLabel}</p>
          <p className="text-xs text-white/40 font-body font-mono">{selectedObject.id.slice(0, 8)}...</p>
        </div>
      </div>

      <div>
        <span className="text-xs font-medium text-white/70 font-body block mb-2">颜色选择</span>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => updateObject(selectedObject.id, { color, emissive: color })}
              className={cn(
                'w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-110',
                selectedObject.color === color
                  ? 'border-white scale-110 shadow-lg'
                  : 'border-transparent'
              )}
              style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}60` }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/50 font-body">自定义:</label>
          <input
            type="color"
            value={selectedObject.color}
            onChange={(e) => updateObject(selectedObject.id, { color: e.target.value, emissive: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20"
          />
          <span className="text-xs font-mono text-white/50">{selectedObject.color}</span>
        </div>
      </div>

      <SliderRow
        label="缩放"
        value={selectedObject.scale}
        min={0.1}
        max={1}
        step={0.01}
        onChange={(v) => updateObject(selectedObject.id, { scale: v })}
      />
      <SliderRow
        label="发光强度"
        value={selectedObject.emissiveIntensity}
        min={0}
        max={2}
        step={0.01}
        onChange={(v) => updateObject(selectedObject.id, { emissiveIntensity: v })}
      />
      <SliderRow
        label="粗糙度"
        value={selectedObject.roughness}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => updateObject(selectedObject.id, { roughness: v })}
      />
      <SliderRow
        label="金属度"
        value={selectedObject.metalness}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => updateObject(selectedObject.id, { metalness: v })}
      />

      <button
        onClick={() => removeObject(selectedObject.id)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-95"
      >
        <Trash2 size={14} />
        删除物体
      </button>
    </div>
  );
}

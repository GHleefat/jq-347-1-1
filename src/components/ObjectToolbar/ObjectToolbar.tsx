import { ReactNode, useCallback } from "react";
import { RefreshCw, Grab } from "lucide-react";
import { useKaleidoscopeStore } from "@/hooks/useKaleidoscopeStore";
import { OBJECT_TYPES, ObjectType } from "@/types";
import { randomColor, randomRange } from "@/utils/geometry";

function SphereIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="2" />
      <ellipse
        cx="20"
        cy="20"
        rx="15"
        ry="5"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <path
        d="M20 5 C12 12, 12 28, 20 35"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <path
        d="M20 5 C28 12, 28 28, 20 35"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 5 L35 13 L35 28 L20 36 L5 28 L5 13 Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M5 13 L20 21 L35 13" stroke="currentColor" strokeWidth="2" />
      <path d="M20 21 L20 36" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function OctahedronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 4 L35 20 L20 36 L5 20 Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M5 20 L35 20" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 4 L20 36"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  );
}

function TorusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="20"
        cy="20"
        rx="15"
        ry="8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="7"
        ry="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M5 20 C5 12, 13 8, 20 8" stroke="currentColor" strokeWidth="2" />
      <path
        d="M35 20 C35 28, 27 32, 20 32"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function ConeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 4 L32 32 L8 32 Z" stroke="currentColor" strokeWidth="2" />
      <ellipse
        cx="20"
        cy="32"
        rx="12"
        ry="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M20 4 L20 32"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

function TetrahedronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 4 L34 32 L6 32 Z" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 4 L20 32"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <path
        d="M6 32 L25 18"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  );
}

function IcosahedronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="20"
        cy="20"
        r="15"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.3"
      />
      <path
        d="M20 5 L33 13 L28 29 L12 29 L7 13 Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M20 5 L12 29" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 5 L28 29" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 13 L33 13"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <path
        d="M20 5 L20 36"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

function DodecahedronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="20"
        cy="20"
        r="15"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.3"
      />
      <path
        d="M20 5 L31 10 L35 22 L27 33 L13 33 L5 22 L9 10 Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M20 5 L20 33"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <path
        d="M9 10 L31 10"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M5 22 L35 22"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M9 10 L27 33"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.3"
      />
      <path
        d="M31 10 L13 33"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.3"
      />
    </svg>
  );
}

const iconMap: Record<
  ObjectType,
  (props: { className?: string }) => ReactNode
> = {
  sphere: SphereIcon,
  box: BoxIcon,
  octahedron: OctahedronIcon,
  torus: TorusIcon,
  cone: ConeIcon,
  tetrahedron: TetrahedronIcon,
  icosahedron: IcosahedronIcon,
  dodecahedron: DodecahedronIcon,
};

const colorMap: Record<ObjectType, string> = {
  sphere: "#ff2d95",
  box: "#00f0ff",
  octahedron: "#b967ff",
  torus: "#ffd700",
  cone: "#39ff14",
  tetrahedron: "#ff6b35",
  icosahedron: "#8338ec",
  dodecahedron: "#3a86ff",
};

interface ToolButtonProps {
  label: string;
  type: ObjectType;
  Icon: (props: { className?: string }) => ReactNode;
  onClick: () => void;
}

function ToolButton({ label, type, Icon, onClick }: ToolButtonProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("application/kaleido-object", type);
      e.dataTransfer.effectAllowed = "copy";

      const dragIcon = document.createElement("div");
      dragIcon.style.width = "64px";
      dragIcon.style.height = "64px";
      dragIcon.style.borderRadius = "16px";
      dragIcon.style.background = `linear-gradient(135deg, ${colorMap[type]}40, ${colorMap[type]}20)`;
      dragIcon.style.border = `2px solid ${colorMap[type]}`;
      dragIcon.style.boxShadow = `0 0 20px ${colorMap[type]}80`;
      dragIcon.style.position = "absolute";
      dragIcon.style.top = "-1000px";
      dragIcon.style.display = "flex";
      dragIcon.style.alignItems = "center";
      dragIcon.style.justifyContent = "center";
      dragIcon.innerHTML = `
      <div style="font-family: Orbitron, sans-serif; font-size: 10px; color: ${colorMap[type]}; font-weight: bold;">
        ${label}
      </div>
    `;
      document.body.appendChild(dragIcon);
      e.dataTransfer.setDragImage(dragIcon, 32, 32);
      setTimeout(() => document.body.removeChild(dragIcon), 0);
    },
    [type, label],
  );

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <button
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 hover:bg-white/10 cursor-grab active:cursor-grabbing"
      title={`${label}（点击添加，或拖拽到场景/图案中）`}
    >
      <div
        className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 group-hover:shadow-glow-purple transition-all duration-300 relative overflow-hidden"
        style={{
          borderColor: `${colorMap[type]}30`,
        }}
      >
        <Icon className="w-8 h-8 text-white/80 group-hover:text-white transition-colors duration-300 relative z-10" />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colorMap[type]}30 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
          style={{
            background: `linear-gradient(90deg, transparent, ${colorMap[type]}20, transparent)`,
          }}
        />
      </div>

      <div className="flex items-center gap-1 mt-1.5">
        <Grab
          size={9}
          className="text-kaleido-green/50 opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <span className="text-[10px] text-white/50 font-body group-hover:text-white/80 transition-colors duration-300">
          {label}
        </span>
      </div>

      <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-kaleido-bg-light/95 border border-white/20 text-xs text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 shadow-glow-purple">
        <div className="flex items-center gap-1.5">
          <span style={{ color: colorMap[type] }}>{label}</span>
          <span className="text-white/40">·</span>
          <span className="text-kaleido-green">拖拽到场景</span>
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-kaleido-bg-light/95 border-r border-b border-white/20 rotate-45" />
      </div>
    </button>
  );
}

export default function ObjectToolbar() {
  const addObject = useKaleidoscopeStore((s) => s.addObject);
  const resetScene = useKaleidoscopeStore((s) => s.resetScene);

  const handleAddObject = (type: ObjectType) => {
    const color = randomColor();
    addObject({
      type,
      position: [
        randomRange(-0.5, 0.5),
        randomRange(-0.5, 0.5),
        randomRange(-0.5, 0.5),
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ],
      scale: randomRange(0.25, 0.45),
      color,
      emissive: color,
      emissiveIntensity: randomRange(0.3, 0.7),
      roughness: randomRange(0.2, 0.5),
      metalness: randomRange(0.4, 0.8),
    });
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
      <div className="glass-panel neon-border px-4 py-3 flex items-center gap-2">
        <div className="flex flex-col items-center mr-2 pr-3 border-r border-white/10">
          <Grab size={14} className="text-kaleido-green mb-0.5" />
          <span className="text-[9px] text-white/40 font-display tracking-wider">
            DRAG
          </span>
        </div>

        {OBJECT_TYPES.map(({ type, label }) => {
          const Icon = iconMap[type];
          return (
            <ToolButton
              key={type}
              label={label}
              type={type}
              Icon={Icon}
              onClick={() => handleAddObject(type)}
            />
          );
        })}

        <div className="w-px h-10 bg-white/10 mx-2" />

        <button
          onClick={resetScene}
          className="group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 hover:bg-white/10"
          title="重置场景"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-kaleido-pink/10 to-kaleido-orange/10 border border-kaleido-pink/20 group-hover:border-kaleido-pink/50 group-hover:shadow-glow-pink transition-all duration-300">
            <RefreshCw className="w-6 h-6 text-kaleido-pink/80 group-hover:text-kaleido-pink group-hover:rotate-180 transition-all duration-500" />
          </div>
          <span className="text-[10px] text-white/50 mt-1.5 font-body group-hover:text-kaleido-pink transition-colors duration-300">
            重置
          </span>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-kaleido-bg-light/95 border border-white/20 text-xs text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50">
            重置场景
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-kaleido-bg-light/95 border-r border-b border-white/20 rotate-45" />
          </div>
        </button>
      </div>
    </div>
  );
}

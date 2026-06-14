import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import KaleidoObjects from "./KaleidoObjects";
import CylinderBody from "./CylinderBody";
import { useKaleidoscopeStore } from "@/hooks/useKaleidoscopeStore";
import type { ObjectType } from "@/types";
import { randomColor, randomRange } from "@/utils/geometry";

function SceneContent() {
  const groupRef = useRef<THREE.Group>(null);
  const { rotationConfig, mirrorConfig } = useKaleidoscopeStore();

  useFrame((_, delta) => {
    if (groupRef.current && rotationConfig.autoRotate) {
      groupRef.current.rotation.z +=
        delta * rotationConfig.speed * rotationConfig.direction;
    }
  });

  const mirrorAngleRad = (mirrorConfig.angle * Math.PI) / 180;

  return (
    <group ref={groupRef} rotation={[0, 0, mirrorAngleRad]}>
      <ambientLight intensity={0.3} />
      <pointLight
        position={[0, 0, 3]}
        intensity={2}
        color="#b967ff"
        distance={10}
      />
      <pointLight
        position={[3, 0, -2]}
        intensity={1.5}
        color="#00f0ff"
        distance={10}
      />
      <pointLight
        position={[-3, 2, 1]}
        intensity={1.5}
        color="#ff2d95"
        distance={10}
      />
      <pointLight
        position={[0, -3, 0]}
        intensity={1}
        color="#ffd700"
        distance={8}
      />

      <KaleidoObjects />
      <CylinderBody />
    </group>
  );
}

interface KaleidoscopeSceneProps {
  className?: string;
  onDropObject?: (type: ObjectType, position: [number, number, number]) => void;
}

export function KaleidoscopeScene({
  className,
  onDropObject,
}: KaleidoscopeSceneProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const addObject = useKaleidoscopeStore((s) => s.addObject);

  const get3DPosition = useCallback(
    (clientX: number, clientY: number): [number, number, number] => {
      if (!wrapperRef.current) return [0, 0, 0];
      const rect = wrapperRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
      const y = (-(clientY - rect.top) / rect.height + 0.5) * 2;
      const radius = Math.sqrt(x * x + y * y);
      const maxRadius = 1.8;
      if (radius > maxRadius) {
        const angle = Math.atan2(y, x);
        return [
          Math.cos(angle) * maxRadius * 0.6,
          Math.sin(angle) * maxRadius * 0.6,
          (Math.random() - 0.5) * 1.5,
        ];
      }
      return [x * 1.4, y * 1.4, (Math.random() - 0.5) * 1.5];
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const objectType = e.dataTransfer.getData(
        "application/kaleido-object",
      ) as ObjectType;
      if (objectType) {
        const pos = get3DPosition(e.clientX, e.clientY);
        if (onDropObject) {
          onDropObject(objectType, pos);
        } else {
          const color = randomColor();
          addObject({
            type: objectType,
            position: pos,
            rotation: [
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI,
            ],
            scale: randomRange(0.3, 0.5),
            color,
            emissive: color,
            emissiveIntensity: randomRange(0.4, 0.8),
            roughness: randomRange(0.2, 0.5),
            metalness: randomRange(0.4, 0.8),
          });
        }
      }
    },
    [addObject, get3DPosition, onDropObject],
  );

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full h-full transition-all duration-300 ${isDragOver ? "ring-4 ring-kaleido-green/60 ring-inset" : ""} ${className || ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: isDragOver
          ? `
            radial-gradient(circle at 50% 50%, rgba(57, 255, 20, 0.15) 0%, transparent 60%)
          `
          : "transparent",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.setClearColor("#050810", 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <fog attach="fog" args={["#050810", 5, 15]} />

        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        <SceneContent />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={12}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />

        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {isDragOver && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="text-center animate-pulse bg-kaleido-bg/60 backdrop-blur-md rounded-3xl px-8 py-6 border-2 border-dashed border-kaleido-green/60">
            <div className="text-6xl mb-3">✨🎨✨</div>
            <p className="font-display text-2xl text-kaleido-green neon-text font-bold tracking-wider">
              释放以添加物体
            </p>
            <p className="text-sm text-white/60 mt-2 font-body">
              物体将放置到万花筒内部此位置
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default KaleidoscopeScene;

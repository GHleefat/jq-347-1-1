import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
  useMemo,
} from "react";
import { Canvas, useFrame, useThree, createPortal } from "@react-three/fiber";
import * as THREE from "three";
import { useKaleidoscopeStore } from "@/hooks/useKaleidoscopeStore";
import type { KaleidoObject, ObjectType } from "@/types";
import { RESOLUTION_MAP } from "@/types";

export interface KaleidoscopePatternHandle {
  exportImage: (options?: {
    width?: number;
    height?: number;
    format?: "png" | "jpg";
    quality?: number;
  }) => Promise<string | null>;
  getCanvas: () => HTMLCanvasElement | null;
  getSceneDropPosition: (
    clientX: number,
    clientY: number,
  ) => [number, number, number];
}

interface KaleidoscopePatternProps {
  className?: string;
  size?: number;
  onDropObject?: (type: ObjectType, position: [number, number, number]) => void;
}

const ObjectGeometry = ({ type }: { type: ObjectType }) => {
  switch (type) {
    case "sphere":
      return <sphereGeometry args={[1, 32, 32]} />;
    case "box":
      return <boxGeometry args={[1, 1, 1]} />;
    case "octahedron":
      return <octahedronGeometry args={[1, 0]} />;
    case "torus":
      return <torusGeometry args={[0.7, 0.28, 16, 64]} />;
    case "cone":
      return <coneGeometry args={[1, 1.6, 32]} />;
    case "tetrahedron":
      return <tetrahedronGeometry args={[1, 0]} />;
    case "icosahedron":
      return <icosahedronGeometry args={[1, 0]} />;
    case "dodecahedron":
      return <dodecahedronGeometry args={[1, 0]} />;
    default:
      return <sphereGeometry args={[1, 32, 32]} />;
  }
};

function RenderObjects() {
  const objects = useKaleidoscopeStore((s) => s.objects);
  const rotationConfig = useKaleidoscopeStore((s) => s.rotationConfig);
  const mirrorConfig = useKaleidoscopeStore((s) => s.mirrorConfig);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && rotationConfig.autoRotate) {
      groupRef.current.rotation.z +=
        delta * rotationConfig.speed * rotationConfig.direction * 0.5;
    }
  });

  const mirrorAngleRad = (mirrorConfig.angle * Math.PI) / 180;

  return (
    <group ref={groupRef} rotation={[0, 0, mirrorAngleRad]}>
      <ambientLight intensity={0.4} />
      <pointLight
        position={[0, 0, 4]}
        intensity={3}
        color="#b967ff"
        distance={15}
      />
      <pointLight
        position={[4, 0, -2]}
        intensity={2}
        color="#00f0ff"
        distance={15}
      />
      <pointLight
        position={[-4, 3, 1]}
        intensity={2}
        color="#ff2d95"
        distance={15}
      />
      <pointLight
        position={[0, -4, 0]}
        intensity={1.5}
        color="#ffd700"
        distance={12}
      />
      <pointLight
        position={[0, 0, -4]}
        intensity={1.5}
        color="#39ff14"
        distance={15}
      />

      {objects.map((obj) => (
        <SingleObjectMesh key={obj.id} obj={obj} />
      ))}
    </group>
  );
}

function SingleObjectMesh({ obj }: { obj: KaleidoObject }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialSeed = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() + initialSeed.current;
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.007;
      meshRef.current.position.z = obj.position[2] + Math.sin(t * 1.2) * 0.05;
    }
  });

  const basePos: [number, number, number] = [
    obj.position[0],
    obj.position[1],
    obj.position[2],
  ];
  const baseRot: [number, number, number] = [
    obj.rotation[0],
    obj.rotation[1],
    obj.rotation[2],
  ];

  return (
    <mesh ref={meshRef} position={basePos} rotation={baseRot} scale={obj.scale}>
      <ObjectGeometry type={obj.type} />
      <meshStandardMaterial
        color={obj.color}
        emissive={obj.emissive}
        emissiveIntensity={obj.emissiveIntensity}
        roughness={obj.roughness}
        metalness={obj.metalness}
      />
    </mesh>
  );
}

const kaleidoscopeVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const kaleidoscopeFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uMirrorCount;
  uniform float uTime;
  uniform float uGlowIntensity;
  varying vec2 vUv;

  #define PI 3.14159265359

  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 uv = vUv - center;

    float r = length(uv) * 2.0;
    float theta = atan(uv.y, uv.x);

    float sectorAngle = (2.0 * PI) / uMirrorCount;
    float sectorIndex = floor(theta / sectorAngle);
    float sectorTheta = mod(theta, sectorAngle);

    float isOdd = mod(sectorIndex, 2.0);
    if (isOdd > 0.5) {
      sectorTheta = sectorAngle - sectorTheta;
    }

    float sampleTheta = sectorTheta + (floor(uMirrorCount / 2.0) * sectorAngle);
    sampleTheta += uTime * 0.05;

    float sampleR = clamp(r, 0.0, 0.98);
    vec2 sampleUv = vec2(
      0.5 + sampleR * 0.5 * cos(sampleTheta),
      0.5 + sampleR * 0.5 * sin(sampleTheta)
    );

    vec4 color = texture2D(uTexture, sampleUv);

    float aberration = 0.002 * uGlowIntensity;
    vec2 offsetR = vec2(aberration * cos(sampleTheta), aberration * sin(sampleTheta));
    vec2 offsetB = vec2(-aberration * cos(sampleTheta), -aberration * sin(sampleTheta));
    float rChannel = texture2D(uTexture, sampleUv + offsetR).r;
    float bChannel = texture2D(uTexture, sampleUv + offsetB).b;
    color.r = mix(color.r, rChannel, 0.5);
    color.b = mix(color.b, bChannel, 0.5);

    float edgeDist = 1.0 - smoothstep(0.92, 1.0, r);
    color.rgb *= mix(0.6, 1.0, edgeDist);

    float vignette = 1.0 - smoothstep(0.85, 1.1, r);
    color.rgb *= mix(0.7, 1.0, vignette);

    float glow = smoothstep(0.95, 1.0, r);
    vec3 glowColor = mix(vec3(0.729, 0.404, 1.0), vec3(0.0, 0.941, 1.0), sin(uTime * 2.0) * 0.5 + 0.5);
    color.rgb = mix(color.rgb, glowColor, glow * 0.6 * uGlowIntensity);

    float alpha = smoothstep(1.0, 0.96, r);
    gl_FragColor = vec4(color.rgb, alpha);
  }
`;

interface KaleidoscopeShaderProps {
  renderTarget: THREE.WebGLRenderTarget;
}

function KaleidoscopeShaderMesh({ renderTarget }: KaleidoscopeShaderProps) {
  const mirrorCount = useKaleidoscopeStore((s) => s.mirrorConfig.count);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  const uniforms = useMemo(
    () => ({
      uTexture: { value: renderTarget.texture },
      uMirrorCount: { value: mirrorCount },
      uTime: { value: 0 },
      uGlowIntensity: { value: 0.8 },
    }),
    [renderTarget, mirrorCount],
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uMirrorCount.value = mirrorCount;
    }
  }, [mirrorCount]);

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={kaleidoscopeVertexShader}
        fragmentShader={kaleidoscopeFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

interface InnerSceneRendererProps {
  renderTarget: THREE.WebGLRenderTarget;
}

function InnerSceneRenderer({ renderTarget }: InnerSceneRendererProps) {
  const { scene, gl, camera } = useThree();
  const virtualScene = useRef(new THREE.Scene());
  const virtualCamera = useRef(
    new THREE.OrthographicCamera(-1.5, 1.5, 1.5, -1.5, 0.1, 100),
  );

  useEffect(() => {
    virtualCamera.current.position.set(0, 0, 8);
    virtualCamera.current.lookAt(0, 0, 0);
  }, []);

  useFrame(() => {
    virtualScene.current.background = new THREE.Color("#050810");
    gl.setRenderTarget(renderTarget);
    gl.render(virtualScene.current, virtualCamera.current);
    gl.setRenderTarget(null);
  });

  return createPortal(<RenderObjects />, virtualScene.current);
}

export const KaleidoscopePattern = forwardRef<
  KaleidoscopePatternHandle,
  KaleidoscopePatternProps
>(({ className, size = 420, onDropObject }, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { exportConfig, setExporting } = useKaleidoscopeStore();

  const [renderTarget] = useState(() => {
    const rt = new THREE.WebGLRenderTarget(1024, 1024, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    });
    rt.texture.generateMipmaps = true;
    return rt;
  });

  const getSceneDropPosition = useCallback(
    (clientX: number, clientY: number): [number, number, number] => {
      if (!canvasWrapperRef.current) return [0, 0, 0];
      const rect = canvasWrapperRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
      const y = (-(clientY - rect.top) / rect.height + 0.5) * 2;
      const radius = Math.sqrt(x * x + y * y);
      if (radius > 0.9) {
        const angle = Math.atan2(y, x);
        return [
          Math.cos(angle) * 0.8,
          Math.sin(angle) * 0.8,
          (Math.random() - 0.5) * 0.8,
        ];
      }
      return [x * 1.0, y * 1.0, (Math.random() - 0.5) * 0.8];
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
      if (objectType && onDropObject) {
        const pos = getSceneDropPosition(e.clientX, e.clientY);
        onDropObject(objectType, pos);
      }
    },
    [onDropObject, getSceneDropPosition],
  );

  const exportImage = useCallback(
    async (options?: {
      width?: number;
      height?: number;
      format?: "png" | "jpg";
      quality?: number;
    }): Promise<string | null> => {
      const canvas = canvasWrapperRef.current?.querySelector("canvas");
      if (!canvas) {
        console.error("Canvas not found");
        return null;
      }

      setExporting(true);

      try {
        const width =
          options?.width || RESOLUTION_MAP[exportConfig.resolution].width;
        const height =
          options?.height || RESOLUTION_MAP[exportConfig.resolution].height;
        const format = options?.format || exportConfig.format;
        const quality = options?.quality ?? exportConfig.quality;

        const sourceSize = Math.min(canvas.width, canvas.height);
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = width;
        exportCanvas.height = height;
        const ctx = exportCanvas.getContext("2d");

        if (!ctx) throw new Error("Could not get 2D context");

        const bgGradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          0,
          width / 2,
          height / 2,
          Math.max(width, height) / 2,
        );
        bgGradient.addColorStop(0, "#0a0e27");
        bgGradient.addColorStop(1, "#050810");
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        const sx = (canvas.width - sourceSize) / 2;
        const sy = (canvas.height - sourceSize) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const outputSize = Math.min(width, height);
        const dx = (width - outputSize) / 2;
        const dy = (height - outputSize) / 2;

        ctx.drawImage(
          canvas,
          sx,
          sy,
          sourceSize,
          sourceSize,
          dx,
          dy,
          outputSize,
          outputSize,
        );

        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const dataUrl = exportCanvas.toDataURL(mimeType, quality);

        const link = document.createElement("a");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        link.download = `kaleidoscope-${RESOLUTION_MAP[exportConfig.resolution].label}-${timestamp}.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return dataUrl;
      } catch (error) {
        console.error("Export failed:", error);
        return null;
      } finally {
        setTimeout(() => setExporting(false), 500);
      }
    },
    [exportConfig, setExporting],
  );

  useImperativeHandle(
    ref,
    () => ({
      exportImage,
      getCanvas: () =>
        canvasWrapperRef.current?.querySelector("canvas") || null,
      getSceneDropPosition,
    }),
    [exportImage, getSceneDropPosition],
  );

  return (
    <div
      ref={wrapperRef}
      className={`relative rounded-full overflow-hidden transition-all duration-300 ${className || ""} ${
        isDragOver ? "ring-4 ring-kaleido-green/60 scale-105" : ""
      }`}
      style={{
        width: size,
        height: size,
        boxShadow: isDragOver
          ? `
              0 0 40px rgba(57, 255, 20, 0.5),
              0 0 80px rgba(57, 255, 20, 0.2),
              inset 0 0 30px rgba(57, 255, 20, 0.1)
            `
          : `
              0 0 30px rgba(185, 103, 255, 0.4),
              0 0 60px rgba(0, 240, 255, 0.2),
              inset 0 0 30px rgba(0, 0, 0, 0.5)
            `,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div ref={canvasWrapperRef} className="w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 2], fov: 0 }}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          dpr={[1, 2]}
        >
          <color attach="background" args={["#050810"]} />
          <InnerSceneRenderer renderTarget={renderTarget} />
          <KaleidoscopeShaderMesh renderTarget={renderTarget} />
        </Canvas>
      </div>

      {isDragOver && (
        <div className="absolute inset-0 rounded-full pointer-events-none flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="text-center animate-pulse">
            <div className="text-4xl mb-2">✨</div>
            <p className="font-display text-lg text-kaleido-green neon-text font-bold">
              释放以添加物体
            </p>
          </div>
        </div>
      )}

      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, transparent 55%, rgba(5, 8, 16, 0.5) 100%)",
        }}
      />
    </div>
  );
});

KaleidoscopePattern.displayName = "KaleidoscopePattern";

export default KaleidoscopePattern;

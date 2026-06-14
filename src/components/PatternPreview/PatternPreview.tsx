import { useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

export interface PatternPreviewHandle {
  exportImage: (options?: ExportOptions) => Promise<string | null>;
  getCanvas: () => HTMLCanvasElement | null;
}

export interface ExportOptions {
  width?: number;
  height?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
}

export interface PatternPreviewProps {
  renderTargetTexture: THREE.Texture | null;
  mirrorCount?: number;
  mirrorAngle?: number;
  glowColor?: string;
  glowIntensity?: number;
  className?: string;
  size?: number;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uMirrorCount;
  uniform float uMirrorAngle;
  uniform float uGlowIntensity;
  uniform vec3 uGlowColor;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 centered = vUv - 0.5;

    float r = length(centered) * 2.0;
    float theta = atan(centered.y, centered.x);

    float segmentAngle = (2.0 * 3.14159265359) / uMirrorCount;
    float normalizedAngle = mod(theta, segmentAngle);

    float segmentIndex = floor(theta / segmentAngle);
    if (mod(segmentIndex, 2.0) == 1.0) {
      normalizedAngle = segmentAngle - normalizedAngle;
    }

    float finalTheta = normalizedAngle + uMirrorAngle;

    vec2 cartesian;
    cartesian.x = r * cos(finalTheta);
    cartesian.y = r * sin(finalTheta);
    vec2 sampleUv = cartesian * 0.5 + 0.5;

    float chromaOffset = 0.003;
    vec2 offsetR = vec2(chromaOffset * cos(finalTheta), chromaOffset * sin(finalTheta));
    vec2 offsetB = vec2(-chromaOffset * cos(finalTheta), -chromaOffset * sin(finalTheta));

    float colorR = texture2D(uTexture, sampleUv + offsetR).r;
    float colorG = texture2D(uTexture, sampleUv).g;
    float colorB = texture2D(uTexture, sampleUv + offsetB).b;
    vec3 color = vec3(colorR, colorG, colorB);
    float alpha = texture2D(uTexture, sampleUv).a;

    float circleMask = 1.0 - smoothstep(0.95, 1.0, r);
    float edgeGlow = smoothstep(0.85, 1.0, r) * uGlowIntensity;
    float innerGlow = (1.0 - smoothstep(0.0, 0.3, r)) * uGlowIntensity * 0.3;

    vec3 finalColor = color + uGlowColor * (edgeGlow + innerGlow);
    float finalAlpha = alpha * circleMask;

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

interface KaleidoMaterialProps {
  texture: THREE.Texture | null;
  mirrorCount: number;
  mirrorAngle: number;
  glowColor: string;
  glowIntensity: number;
}

function KaleidoMaterial({ texture, mirrorCount, mirrorAngle, glowColor, glowIntensity }: KaleidoMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture ?? new THREE.Texture() },
      uMirrorCount: { value: mirrorCount },
      uMirrorAngle: { value: mirrorAngle },
      uGlowIntensity: { value: glowIntensity },
      uGlowColor: { value: new THREE.Color(glowColor) },
      uTime: { value: 0 },
    }),
    []
  );

  useEffect(() => {
    if (materialRef.current) {
      if (texture) {
        materialRef.current.uniforms.uTexture.value = texture;
      }
      materialRef.current.uniforms.uMirrorCount.value = mirrorCount;
      materialRef.current.uniforms.uMirrorAngle.value = mirrorAngle;
      materialRef.current.uniforms.uGlowIntensity.value = glowIntensity;
      materialRef.current.uniforms.uGlowColor.value = new THREE.Color(glowColor);
      materialRef.current.needsUpdate = true;
    }
  }, [texture, mirrorCount, mirrorAngle, glowColor, glowIntensity, uniforms]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      transparent
      depthWrite={false}
    />
  );
}

interface GlowRingProps {
  color: string;
  intensity: number;
}

function GlowRing({ color, intensity }: GlowRingProps) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
      ringRef.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <>
      <mesh ref={ringRef} position={[0, 0, -0.1]}>
        <ringGeometry args={[0.98, 1.0, 128]} />
        <meshBasicMaterial color={color} transparent opacity={intensity * 0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -0.2]}>
        <ringGeometry args={[0.95, 1.05, 128]} />
        <meshBasicMaterial color={color} transparent opacity={intensity * 0.3} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

interface SceneRendererProps {
  texture: THREE.Texture | null;
  mirrorCount: number;
  mirrorAngle: number;
  glowColor: string;
  glowIntensity: number;
}

function SceneRenderer({ texture, mirrorCount, mirrorAngle, glowColor, glowIntensity }: SceneRendererProps) {
  return (
    <>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <KaleidoMaterial
          texture={texture}
          mirrorCount={mirrorCount}
          mirrorAngle={mirrorAngle}
          glowColor={glowColor}
          glowIntensity={glowIntensity}
        />
      </mesh>
      <GlowRing color={glowColor} intensity={glowIntensity} />
    </>
  );
}

function ExportRenderer({
  texture,
  mirrorCount,
  mirrorAngle,
  glowColor,
  glowIntensity,
  exportWidth,
  exportHeight,
  onImageReady,
}: {
  texture: THREE.Texture | null;
  mirrorCount: number;
  mirrorAngle: number;
  glowColor: string;
  glowIntensity: number;
  exportWidth: number;
  exportHeight: number;
  onImageReady: (dataUrl: string | null) => void;
}) {
  const { gl } = useThree();
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const rendered = useRef(false);

  useEffect(() => {
    const renderTarget = new THREE.WebGLRenderTarget(exportWidth, exportHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    });
    renderTargetRef.current = renderTarget;
    rendered.current = false;

    return () => {
      renderTarget.dispose();
    };
  }, [exportWidth, exportHeight]);

  useFrame(() => {
    if (renderTargetRef.current && !rendered.current && texture) {
      rendered.current = true;

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const scene = new THREE.Scene();

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uMirrorCount: { value: mirrorCount },
          uMirrorAngle: { value: mirrorAngle },
          uGlowIntensity: { value: glowIntensity },
          uGlowColor: { value: new THREE.Color(glowColor) },
          uTime: { value: 0 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      });

      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(quad);

      const ringMaterial1 = new THREE.MeshBasicMaterial({
        color: new THREE.Color(glowColor),
        transparent: true,
        opacity: glowIntensity * 0.8,
        side: THREE.DoubleSide,
      });
      const ring1 = new THREE.Mesh(new THREE.RingGeometry(0.98, 1.0, 128), ringMaterial1);
      ring1.position.z = -0.1;
      scene.add(ring1);

      const ringMaterial2 = new THREE.MeshBasicMaterial({
        color: new THREE.Color(glowColor),
        transparent: true,
        opacity: glowIntensity * 0.3,
        side: THREE.DoubleSide,
      });
      const ring2 = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.05, 128), ringMaterial2);
      ring2.position.z = -0.2;
      scene.add(ring2);

      gl.setRenderTarget(renderTargetRef.current);
      gl.setClearColor(0x000000, 0);
      gl.clear(true, true, true);
      gl.render(scene, camera);
      gl.setRenderTarget(null);

      const pixels = new Uint8Array(exportWidth * exportHeight * 4);
      gl.readRenderTargetPixels(renderTargetRef.current, 0, 0, exportWidth, exportHeight, pixels);

      const canvas = document.createElement('canvas');
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.createImageData(exportWidth, exportHeight);
        for (let i = 0; i < pixels.length; i += 4) {
          const row = Math.floor(i / 4 / exportWidth);
          const flippedRow = exportHeight - 1 - row;
          const srcIdx = i;
          const dstIdx = flippedRow * exportWidth * 4 + (i % (exportWidth * 4));
          imageData.data[dstIdx] = pixels[srcIdx];
          imageData.data[dstIdx + 1] = pixels[srcIdx + 1];
          imageData.data[dstIdx + 2] = pixels[srcIdx + 2];
          imageData.data[dstIdx + 3] = pixels[srcIdx + 3];
        }
        ctx.putImageData(imageData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        onImageReady(dataUrl);
      } else {
        onImageReady(null);
      }

      material.dispose();
      ringMaterial1.dispose();
      ringMaterial2.dispose();
      quad.geometry.dispose();
      ring1.geometry.dispose();
      ring2.geometry.dispose();
    }
  });

  return null;
}

export const PatternPreview = forwardRef<PatternPreviewHandle, PatternPreviewProps>(
  (
    {
      renderTargetTexture,
      mirrorCount = 6,
      mirrorAngle = 0,
      glowColor = '#00f0ff',
      glowIntensity = 0.8,
      className,
      size = 300,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const exportStateRef = useRef<{
      active: boolean;
      options: ExportOptions;
      resolve: ((value: string | null) => void) | null;
    }>({ active: false, options: {}, resolve: null });

    useImperativeHandle(ref, () => ({
      exportImage: async (options: ExportOptions = {}): Promise<string | null> => {
        return new Promise((resolve) => {
          exportStateRef.current = {
            active: true,
            options,
            resolve,
          };
        });
      },
      getCanvas: () => canvasRef.current,
    }));

    const safeMirrorCount = Math.max(3, Math.min(12, mirrorCount));
    const safeMirrorAngle = (mirrorAngle * Math.PI) / 180;

    const handleExportReady = (dataUrl: string | null) => {
      if (exportStateRef.current.resolve) {
        const format = exportStateRef.current.options.format ?? 'png';
        const quality = exportStateRef.current.options.quality ?? 0.95;

        if (format === 'jpeg' && dataUrl) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              const jpegUrl = canvas.toDataURL('image/jpeg', quality);
              exportStateRef.current.resolve?.(jpegUrl);
            } else {
              exportStateRef.current.resolve?.(dataUrl);
            }
            exportStateRef.current = { active: false, options: {}, resolve: null };
          };
          img.onerror = () => {
            exportStateRef.current.resolve?.(dataUrl);
            exportStateRef.current = { active: false, options: {}, resolve: null };
          };
          img.src = dataUrl;
        } else {
          exportStateRef.current.resolve?.(dataUrl);
          exportStateRef.current = { active: false, options: {}, resolve: null };
        }
      }
    };

    return (
      <div
        ref={containerRef}
        className={cn('relative overflow-hidden rounded-full', className)}
        style={{ width: size, height: size }}
      >
        <Canvas
          ref={(canvas) => {
            canvasRef.current = canvas;
          }}
          orthographic
          camera={{ position: [0, 0, 1], zoom: 1 }}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <SceneRenderer
            texture={renderTargetTexture}
            mirrorCount={safeMirrorCount}
            mirrorAngle={safeMirrorAngle}
            glowColor={glowColor}
            glowIntensity={glowIntensity}
          />
          {exportStateRef.current.active && renderTargetTexture && (
            <ExportRenderer
              texture={renderTargetTexture}
              mirrorCount={safeMirrorCount}
              mirrorAngle={safeMirrorAngle}
              glowColor={glowColor}
              glowIntensity={glowIntensity}
              exportWidth={exportStateRef.current.options.width ?? 1024}
              exportHeight={exportStateRef.current.options.height ?? 1024}
              onImageReady={handleExportReady}
            />
          )}
        </Canvas>
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 ${20 * glowIntensity}px ${glowColor}, 0 0 ${40 * glowIntensity}px ${glowColor}40, inset 0 0 ${30 * glowIntensity}px ${glowColor}20`,
          }}
        />
      </div>
    );
  }
);

PatternPreview.displayName = 'PatternPreview';

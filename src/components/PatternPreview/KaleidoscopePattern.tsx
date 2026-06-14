import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useKaleidoscopeStore } from '@/hooks/useKaleidoscopeStore';
import { RESOLUTION_MAP } from '@/types';

export interface KaleidoscopePatternHandle {
  exportImage: (options?: {
    width?: number;
    height?: number;
    format?: 'png' | 'jpg';
    quality?: number;
  }) => Promise<string | null>;
  getCanvas: () => HTMLCanvasElement | null;
}

interface KaleidoscopePatternProps {
  className?: string;
  size?: number;
}

export const KaleidoscopePattern = forwardRef<KaleidoscopePatternHandle, KaleidoscopePatternProps>(
  ({ className, size = 400 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const timeRef = useRef<number>(0);

    const { objects, mirrorConfig, rotationConfig, exportConfig, setExporting } = useKaleidoscopeStore();

    const drawShape = useCallback(
      (
        ctx: CanvasRenderingContext2D,
        type: string,
        x: number,
        y: number,
        scale: number,
        rotation: number,
        color: string,
        emissive: string,
        emissiveIntensity: number
      ) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        const glowRadius = 15 + emissiveIntensity * 25;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        gradient.addColorStop(0, emissive + Math.floor(emissiveIntensity * 200).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, emissive + '00');

        ctx.shadowColor = emissive;
        ctx.shadowBlur = 10 + emissiveIntensity * 20;
        ctx.fillStyle = color;
        ctx.strokeStyle = emissive;
        ctx.lineWidth = 1.5;

        switch (type) {
          case 'sphere':
            ctx.beginPath();
            ctx.arc(0, 0, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = gradient;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(0, 0, glowRadius / scale, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'box':
            ctx.fillRect(-1, -1, 2, 2);
            ctx.strokeRect(-1, -1, 2, 2);
            break;

          case 'octahedron':
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
              const r = i % 2 === 0 ? 1.2 : 0.6;
              const px = Math.cos(angle) * r;
              const py = Math.sin(angle) * r;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

          case 'torus':
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.arc(0, 0, 1, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;

          case 'cone':
            ctx.beginPath();
            ctx.moveTo(0, -1.2);
            ctx.lineTo(1, 1);
            ctx.lineTo(-1, 1);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

          case 'tetrahedron':
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
              const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
              const px = Math.cos(angle) * 1.2;
              const py = Math.sin(angle) * 1.2;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

          case 'icosahedron':
            ctx.beginPath();
            for (let i = 0; i < 20; i++) {
              const angle = (i / 20) * Math.PI * 2;
              const r = i % 2 === 0 ? 1.2 : 0.9;
              const px = Math.cos(angle) * r;
              const py = Math.sin(angle) * r;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

          case 'dodecahedron':
            ctx.beginPath();
            for (let i = 0; i < 12; i++) {
              const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
              const r = 1.1;
              const px = Math.cos(angle) * r;
              const py = Math.sin(angle) * r;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        }

        ctx.restore();
      },
      []
    );

    const renderKaleidoscope = useCallback(
      (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) / 2;

        ctx.fillStyle = '#050810';
        ctx.fillRect(0, 0, width, height);

        const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        bgGradient.addColorStop(0, 'rgba(18, 24, 61, 0.8)');
        bgGradient.addColorStop(0.7, 'rgba(10, 14, 39, 0.9)');
        bgGradient.addColorStop(1, 'rgba(5, 8, 16, 1)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 0.98, 0, Math.PI * 2);
        ctx.clip();

        const mirrorCount = mirrorConfig.count;
        const mirrorAngleRad = (mirrorConfig.angle * Math.PI) / 180;
        const sectorAngle = (Math.PI * 2) / mirrorCount;

        const baseRotation = rotationConfig.autoRotate
          ? time * rotationConfig.speed * rotationConfig.direction * 0.5
          : mirrorAngleRad;

        for (let sector = 0; sector < mirrorCount; sector++) {
          const sectorBaseAngle = sector * sectorAngle + baseRotation;

          for (const obj of objects) {
            const objScale = (obj.scale * maxRadius) / 4;
            const objX = obj.position[0] * (maxRadius / 3);
            const objY = obj.position[1] * (maxRadius / 3);
            const objRotation =
              obj.rotation[0] + obj.rotation[1] + time * 0.3 + (obj.position[2] * 0.5);

            const pulseOffset = Math.sin(time * 1.5 + obj.position[2] * 2) * 0.05 + 1;

            let drawX = objX * pulseOffset;
            let drawY = objY * pulseOffset;

            const angle1 = sectorBaseAngle;
            const cos1 = Math.cos(angle1);
            const sin1 = Math.sin(angle1);
            const rotX1 = drawX * cos1 - drawY * sin1;
            const rotY1 = drawX * sin1 + drawY * cos1;

            drawShape(
              ctx,
              obj.type,
              centerX + rotX1,
              centerY + rotY1,
              objScale * pulseOffset,
              objRotation + angle1,
              obj.color,
              obj.emissive,
              obj.emissiveIntensity
            );

            const angle2 = sectorBaseAngle + sectorAngle;
            const reflectX = drawX;
            const reflectY = -drawY;
            const cos2 = Math.cos(angle2);
            const sin2 = Math.sin(angle2);
            const rotX2 = reflectX * cos2 - reflectY * sin2;
            const rotY2 = reflectX * sin2 + reflectY * cos2;

            drawShape(
              ctx,
              obj.type,
              centerX + rotX2,
              centerY + rotY2,
              objScale * pulseOffset,
              -objRotation + angle2,
              obj.color,
              obj.emissive,
              obj.emissiveIntensity
            );
          }
        }

        ctx.restore();

        const ringGradient = ctx.createRadialGradient(
          centerX, centerY, maxRadius * 0.92,
          centerX, centerY, maxRadius
        );
        ringGradient.addColorStop(0, 'rgba(185, 103, 255, 0)');
        ringGradient.addColorStop(0.5, `rgba(185, 103, 255, ${0.3 + Math.sin(time * 2) * 0.1})`);
        ringGradient.addColorStop(0.7, `rgba(0, 240, 255, ${0.4 + Math.sin(time * 2 + 1) * 0.1})`);
        ringGradient.addColorStop(1, 'rgba(255, 45, 149, 0)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
        ctx.strokeStyle = ringGradient;
        ctx.lineWidth = maxRadius * 0.08;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 0.99, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.5 + Math.sin(time * 3) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      },
      [objects, mirrorConfig, rotationConfig, drawShape]
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const animate = () => {
        timeRef.current += 0.016;
        const dpr = window.devicePixelRatio || 1;
        renderKaleidoscope(ctx, canvas.width / dpr, canvas.height / dpr, timeRef.current);
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [renderKaleidoscope]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }, [size]);

    const exportImage = useCallback(
      async (
        options?: {
          width?: number;
          height?: number;
          format?: 'png' | 'jpg';
          quality?: number;
        }
      ): Promise<string | null> => {
        setExporting(true);

        try {
          const width = options?.width || RESOLUTION_MAP[exportConfig.resolution].width;
          const height = options?.height || RESOLUTION_MAP[exportConfig.resolution].height;
          const format = options?.format || exportConfig.format;
          const quality = options?.quality ?? exportConfig.quality;

          const exportCanvas = document.createElement('canvas');
          exportCanvas.width = width;
          exportCanvas.height = height;
          const ctx = exportCanvas.getContext('2d');

          if (!ctx) {
            throw new Error('Could not get 2D context');
          }

          const bgGradient = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, Math.max(width, height) / 2
          );
          bgGradient.addColorStop(0, '#0a0e27');
          bgGradient.addColorStop(1, '#050810');
          ctx.fillStyle = bgGradient;
          ctx.fillRect(0, 0, width, height);

          renderKaleidoscope(ctx, width, height, timeRef.current);

          const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
          const dataUrl = exportCanvas.toDataURL(mimeType, quality);

          const link = document.createElement('a');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          link.download = `kaleidoscope-${RESOLUTION_MAP[exportConfig.resolution].label}-${timestamp}.${format}`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          return dataUrl;
        } catch (error) {
          console.error('Export failed:', error);
          return null;
        } finally {
          setTimeout(() => setExporting(false), 500);
        }
      },
      [exportConfig, renderKaleidoscope, setExporting]
    );

    useImperativeHandle(
      ref,
      () => ({
        exportImage,
        getCanvas: () => canvasRef.current,
      }),
      [exportImage]
    );

    return (
      <div
        className={`relative rounded-full overflow-hidden ${className || ''}`}
        style={{
          width: size,
          height: size,
          boxShadow: `
            0 0 30px rgba(185, 103, 255, 0.4),
            0 0 60px rgba(0, 240, 255, 0.2),
            inset 0 0 30px rgba(0, 0, 0, 0.5)
          `,
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-full"
        />
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, transparent 60%, rgba(5, 8, 16, 0.4) 100%)',
          }}
        />
      </div>
    );
  }
);

KaleidoscopePattern.displayName = 'KaleidoscopePattern';

export default KaleidoscopePattern;

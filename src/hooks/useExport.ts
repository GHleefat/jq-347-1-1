import { useRef, useCallback } from 'react';
import { useKaleidoscopeStore } from './useKaleidoscopeStore';
import { RESOLUTION_MAP } from '@/types';

interface ExportOptions {
  width?: number;
  height?: number;
  format?: 'png' | 'jpg';
  quality?: number;
}

export const useExport = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { exportConfig, setExporting } = useKaleidoscopeStore();

  const setCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);

  const exportImage = useCallback(async (options?: ExportOptions): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas not available for export');
      return null;
    }

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

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
      gradient.addColorStop(0, '#0a0e27');
      gradient.addColorStop(1, '#050810');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const size = Math.min(width, height);
      const offsetX = (width - size) / 2;
      const offsetY = (height - size) / 2;

      ctx.drawImage(canvas, offsetX, offsetY, size, size);

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
  }, [exportConfig, setExporting]);

  return {
    setCanvas,
    exportImage,
  };
};

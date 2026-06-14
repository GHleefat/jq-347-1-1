export type ObjectType = 'sphere' | 'box' | 'octahedron' | 'torus' | 'cone' | 'tetrahedron' | 'icosahedron' | 'dodecahedron';

export interface KaleidoObject {
  id: string;
  type: ObjectType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  emissive: string;
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
}

export interface MirrorConfig {
  count: number;
  angle: number;
  reflectivity: number;
}

export interface RotationConfig {
  speed: number;
  direction: 1 | -1;
  autoRotate: boolean;
}

export type ExportResolution = '1080p' | '2k' | '4k';
export type ExportFormat = 'png' | 'jpg';

export interface ExportConfig {
  resolution: ExportResolution;
  format: ExportFormat;
  quality: number;
}

export interface KaleidoscopeState {
  objects: KaleidoObject[];
  selectedObjectId: string | null;
  mirrorConfig: MirrorConfig;
  rotationConfig: RotationConfig;
  exportConfig: ExportConfig;
  isExporting: boolean;
  addObject: (obj: Omit<KaleidoObject, 'id'>) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<KaleidoObject>) => void;
  selectObject: (id: string | null) => void;
  updateMirrorConfig: (config: Partial<MirrorConfig>) => void;
  updateRotationConfig: (config: Partial<RotationConfig>) => void;
  updateExportConfig: (config: Partial<ExportConfig>) => void;
  setExporting: (value: boolean) => void;
  resetScene: () => void;
}

export const PRESET_COLORS = [
  '#ff2d95',
  '#00f0ff',
  '#b967ff',
  '#ffd700',
  '#39ff14',
  '#ff6b35',
  '#ff006e',
  '#8338ec',
  '#3a86ff',
  '#fb5607',
  '#ffbe0b',
  '#06ffa5',
];

export const OBJECT_TYPES: { type: ObjectType; label: string }[] = [
  { type: 'sphere', label: '球体' },
  { type: 'box', label: '立方体' },
  { type: 'octahedron', label: '八面体' },
  { type: 'torus', label: '圆环' },
  { type: 'cone', label: '圆锥' },
  { type: 'tetrahedron', label: '四面体' },
  { type: 'icosahedron', label: '二十面体' },
  { type: 'dodecahedron', label: '十二面体' },
];

export const RESOLUTION_MAP: Record<ExportResolution, { width: number; height: number; label: string }> = {
  '1080p': { width: 1920, height: 1920, label: '1080p' },
  '2k': { width: 2560, height: 2560, label: '2K' },
  '4k': { width: 3840, height: 3840, label: '4K' },
};

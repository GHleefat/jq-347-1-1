import { create } from 'zustand';
import type { KaleidoscopeState, KaleidoObject, PRESET_COLORS } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 11);

const colors: string[] = [
  '#ff2d95', '#00f0ff', '#b967ff', '#ffd700', '#39ff14', '#ff6b35',
  '#ff006e', '#8338ec', '#3a86ff', '#fb5607',
];

const createDefaultObjects = (): KaleidoObject[] => {
  const types: KaleidoObject['type'][] = ['sphere', 'octahedron', 'torus', 'icosahedron', 'box', 'dodecahedron'];
  return Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 0.8 + Math.random() * 0.6;
    return {
      id: generateId(),
      type: types[i % types.length],
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.random() - 0.5) * 1.5,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      scale: 0.25 + Math.random() * 0.25,
      color: colors[i % colors.length],
      emissive: colors[i % colors.length],
      emissiveIntensity: 0.4 + Math.random() * 0.4,
      roughness: 0.2 + Math.random() * 0.3,
      metalness: 0.5 + Math.random() * 0.3,
    };
  });
};

export const useKaleidoscopeStore = create<KaleidoscopeState>((set) => ({
  objects: createDefaultObjects(),
  selectedObjectId: null,
  mirrorConfig: {
    count: 6,
    angle: 0,
    reflectivity: 0.95,
  },
  rotationConfig: {
    speed: 0.3,
    direction: 1,
    autoRotate: true,
  },
  exportConfig: {
    resolution: '1080p',
    format: 'png',
    quality: 0.95,
  },
  isExporting: false,

  addObject: (obj) =>
    set((state) => ({
      objects: [...state.objects, { ...obj, id: generateId() }],
    })),

  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((o) => o.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
    })),

  updateObject: (id, updates) =>
    set((state) => ({
      objects: state.objects.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      ),
    })),

  selectObject: (id) => set({ selectedObjectId: id }),

  updateMirrorConfig: (config) =>
    set((state) => ({
      mirrorConfig: { ...state.mirrorConfig, ...config },
    })),

  updateRotationConfig: (config) =>
    set((state) => ({
      rotationConfig: { ...state.rotationConfig, ...config },
    })),

  updateExportConfig: (config) =>
    set((state) => ({
      exportConfig: { ...state.exportConfig, ...config },
    })),

  setExporting: (value) => set({ isExporting: value }),

  resetScene: () =>
    set({
      objects: createDefaultObjects(),
      selectedObjectId: null,
      mirrorConfig: { count: 6, angle: 0, reflectivity: 0.95 },
      rotationConfig: { speed: 0.3, direction: 1, autoRotate: true },
    }),
}));

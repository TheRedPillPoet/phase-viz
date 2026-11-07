import type { StateCreator } from 'zustand';
import type { AppState, VisualSlice } from './types';
import {
  DEFAULT_IMAGE_FX_LAYER_ORDER,
  DEFAULT_VISUALIZER_LAYER_ORDER,
} from './types';
import { DEFAULT_SCENE_PARAMETERS } from '../engine/parameterConfig';

export const createVisualSlice: StateCreator<AppState, [], [], VisualSlice> = (set) => ({
  displayMode: 'visualizer3d',
  aspectRatio: '16:9',
  sceneParameters: { ...DEFAULT_SCENE_PARAMETERS },
  preset: 'neon',
  presetRevision: 0,
  effects: {
    bloom: false,
    chromaticAberration: false,
    rgbSplit: false,
    datamosh: false,
    strongDatamosh: false,
    blockDatamosh: false,
    glitchDatamosh: false,
    meltingDatamosh: false,
    glitchNoise: false,
    cameraShake: false,
  },
  particleSettings: {
    countScale: 1,
    sizeScale: 1,
    shape: 'circle',
  },
  visualizerSettings: {
    cameraDistance: 5,
    morphIntensity: 1.35,
  },
  visualizerLayerOrder: DEFAULT_VISUALIZER_LAYER_ORDER,
  waveSettings: {
    type: 'horizontal',
    backgroundMode: 'solid',
  },
  imageFxSettings: {
    preset: 'clean',
    glow: 0.28,
    blur: 0.12,
    rgbShift: 0.1,
    noise: 0.08,
    distortion: 0.08,
    pulse: 0.2,
  },
  imageFxLayerOrder: DEFAULT_IMAGE_FX_LAYER_ORDER,
  setDisplayMode: (displayMode) => set({ displayMode }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setSceneParameter: (key, value) =>
    set((state) => ({
      sceneParameters: { ...state.sceneParameters, [key]: value },
    })),
  setPreset: (preset) => set((s) => ({ preset, presetRevision: s.presetRevision + 1 })),
  toggleEffect: (e) =>
    set((s) => ({ effects: { ...s.effects, [e]: !s.effects[e] } })),
  setParticleCountScale: (countScale) =>
    set((s) => ({ particleSettings: { ...s.particleSettings, countScale } })),
  setParticleSizeScale: (sizeScale) =>
    set((s) => ({ particleSettings: { ...s.particleSettings, sizeScale } })),
  setParticleShape: (shape) =>
    set((s) => ({ particleSettings: { ...s.particleSettings, shape } })),
  setCameraDistance: (cameraDistance) =>
    set((s) => ({ visualizerSettings: { ...s.visualizerSettings, cameraDistance } })),
  setMorphIntensity: (morphIntensity) =>
    set((s) => ({ visualizerSettings: { ...s.visualizerSettings, morphIntensity } })),
  moveVisualizerLayer: (layer, direction) =>
    set((s) => {
      const order = [...s.visualizerLayerOrder];
      const index = order.indexOf(layer);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return {};
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      return { visualizerLayerOrder: order };
    }),
  resetVisualizerLayerOrder: () => set({ visualizerLayerOrder: [...DEFAULT_VISUALIZER_LAYER_ORDER] }),
  setWaveType: (type) =>
    set((s) => ({ waveSettings: { ...s.waveSettings, type } })),
  setWaveBackgroundMode: (backgroundMode) =>
    set((s) => ({ waveSettings: { ...s.waveSettings, backgroundMode } })),
  setImageFxPreset: (preset, values) =>
    set({ imageFxSettings: { preset, ...values } }),
  setImageFxEffect: (key, value) =>
    set((s) => ({ imageFxSettings: { ...s.imageFxSettings, [key]: value } })),
  moveImageFxLayer: (layer, direction) =>
    set((s) => {
      const order = [...s.imageFxLayerOrder];
      const index = order.indexOf(layer);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return {};
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      return { imageFxLayerOrder: order };
    }),
  resetImageFxLayerOrder: () => set({ imageFxLayerOrder: [...DEFAULT_IMAGE_FX_LAYER_ORDER] }),
});

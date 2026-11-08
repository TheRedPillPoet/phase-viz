import type { PresetId, SceneParameterKey } from '../state/types';

export interface SceneParameterConfig {
  key: SceneParameterKey;
  label: string;
  uniform: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  precision: number;
}

export const DEFAULT_SCENE_PARAMETERS = {
  matrixDensity: 92,
  matrixSpeed: 1.8,
  matrixReactivity: 1,
  voidEnergy: 1.1,
  voidParticleDensity: 1,
  voidRibbonWeight: 1,
  voidMotionSpeed: 1,
  voidBassReactivity: 1,
  hauntedParticleDensity: 1.15,
  hauntedWispIntensity: 1.15,
  hauntedTrailPersistence: 0.22,
  hauntedSpectralBrightness: 1.1,
  hauntedAudioReactivity: 1,
  awakeningLightLeak: 0.035,
  awakeningRayDensity: 19,
  awakeningExpansionScale: 1,
} satisfies Record<SceneParameterKey, number>;

export const SCENE_PARAMETER_CONFIG: Partial<Record<PresetId, readonly SceneParameterConfig[]>> = {
  matrix: [
    { key: 'matrixDensity', label: 'Glyph Density', uniform: 'u_density', min: 30, max: 180, step: 1, defaultValue: DEFAULT_SCENE_PARAMETERS.matrixDensity, precision: 0 },
    { key: 'matrixSpeed', label: 'Fall Speed', uniform: 'u_speed', min: 0.2, max: 4, step: 0.05, defaultValue: DEFAULT_SCENE_PARAMETERS.matrixSpeed, precision: 2 },
    { key: 'matrixReactivity', label: 'Bass Reactivity', uniform: 'u_reactivity', min: 0, max: 2, step: 0.05, defaultValue: DEFAULT_SCENE_PARAMETERS.matrixReactivity, precision: 2 },
  ],
  void: [
    { key: 'voidEnergy', label: 'Vortex Intensity', uniform: 'u_energy', min: 0.2, max: 1.6, step: 0.01, defaultValue: DEFAULT_SCENE_PARAMETERS.voidEnergy, precision: 2 },
    { key: 'voidParticleDensity', label: 'Particle Density', uniform: 'u_density', min: 0.3, max: 1.5, step: 0.01, defaultValue: DEFAULT_SCENE_PARAMETERS.voidParticleDensity, precision: 2 },
    { key: 'voidRibbonWeight', label: 'Ribbon Weight', uniform: 'u_weight', min: 0.5, max: 1.8, step: 0.01, defaultValue: DEFAULT_SCENE_PARAMETERS.voidRibbonWeight, precision: 2 },
    { key: 'voidMotionSpeed', label: 'Rotation Speed', uniform: 'u_speed', min: 0.25, max: 2, step: 0.05, defaultValue: DEFAULT_SCENE_PARAMETERS.voidMotionSpeed, precision: 2 },
    { key: 'voidBassReactivity', label: 'Bass Reactivity', uniform: 'u_bassReactivity', min: 0, max: 2, step: 0.05, defaultValue: DEFAULT_SCENE_PARAMETERS.voidBassReactivity, precision: 2 },
  ],
  haunted: [
    { key: 'hauntedParticleDensity', label: 'Spectral Particle Density', uniform: 'u_particleDensity', min: 0.3, max: 1.5, step: 0.01, defaultValue: DEFAULT_SCENE_PARAMETERS.hauntedParticleDensity, precision: 2 },
    { key: 'hauntedWispIntensity', label: 'Ghostly Wisp Intensity', uniform: 'u_wispIntensity', min: 0, max: 2, step: 0.01, defaultValue: DEFAULT_SCENE_PARAMETERS.hauntedWispIntensity, precision: 2 },
    { key: 'hauntedTrailPersistence', label: 'Spectral Trail Persistence', uniform: 'u_trailPersistence', min: 0, max: 0.7, step: 0.01, defaultValue: DEFAULT_SCENE_PARAMETERS.hauntedTrailPersistence, precision: 2 },
    { key: 'hauntedSpectralBrightness', label: 'Spectral Brightness', uniform: 'u_spectralBrightness', min: 0.5, max: 1.8, step: 0.01, defaultValue: DEFAULT_SCENE_PARAMETERS.hauntedSpectralBrightness, precision: 2 },
    { key: 'hauntedAudioReactivity', label: 'Audio Reactivity', uniform: 'u_audioReactivity', min: 0, max: 2, step: 0.05, defaultValue: DEFAULT_SCENE_PARAMETERS.hauntedAudioReactivity, precision: 2 },
  ],
  awakening: [
    { key: 'awakeningLightLeak', label: 'Light Leak', uniform: 'u_lightLeakIntensity', min: 0, max: 0.3, step: 0.005, defaultValue: DEFAULT_SCENE_PARAMETERS.awakeningLightLeak, precision: 3 },
    { key: 'awakeningRayDensity', label: 'Radial Ray Density', uniform: 'u_rayDensity', min: 6, max: 48, step: 1, defaultValue: DEFAULT_SCENE_PARAMETERS.awakeningRayDensity, precision: 0 },
    { key: 'awakeningExpansionScale', label: 'Geometric Expansion', uniform: 'u_expansionScale', min: 0.5, max: 1.8, step: 0.02, defaultValue: DEFAULT_SCENE_PARAMETERS.awakeningExpansionScale, precision: 2 },
  ],
};

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
  voidHorizonGlow: 0.12,
  voidRingVisibility: 1,
  voidFovPulse: 0.018,
  hauntedGrainOpacity: 0.1,
  hauntedChromaticAberration: 0.0007,
  hauntedTrailDecay: 0.16,
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
    { key: 'voidHorizonGlow', label: 'Horizon Glow', uniform: 'u_horizonGlow', min: 0, max: 0.5, step: 0.01, defaultValue: DEFAULT_SCENE_PARAMETERS.voidHorizonGlow, precision: 2 },
    { key: 'voidRingVisibility', label: 'Wireframe Ring', uniform: 'u_ringVisibility', min: 0, max: 1, step: 0.01, defaultValue: DEFAULT_SCENE_PARAMETERS.voidRingVisibility, precision: 2 },
    { key: 'voidFovPulse', label: 'FOV Pulse', uniform: 'u_fovPulse', min: 0, max: 0.08, step: 0.002, defaultValue: DEFAULT_SCENE_PARAMETERS.voidFovPulse, precision: 3 },
  ],
  haunted: [
    { key: 'hauntedGrainOpacity', label: 'Film Grain', uniform: 'u_grainOpacity', min: 0, max: 0.3, step: 0.005, defaultValue: DEFAULT_SCENE_PARAMETERS.hauntedGrainOpacity, precision: 3 },
    { key: 'hauntedChromaticAberration', label: 'Chromatic Aberration', uniform: 'u_chromaticAberration', min: 0, max: 0.004, step: 0.0001, defaultValue: DEFAULT_SCENE_PARAMETERS.hauntedChromaticAberration, precision: 4 },
    { key: 'hauntedTrailDecay', label: 'Motion Trail Persistence', uniform: 'u_trailDecay', min: 0, max: 0.63, step: 0.01, defaultValue: DEFAULT_SCENE_PARAMETERS.hauntedTrailDecay, precision: 2 },
  ],
  awakening: [
    { key: 'awakeningLightLeak', label: 'Light Leak', uniform: 'u_lightLeakIntensity', min: 0, max: 0.3, step: 0.005, defaultValue: DEFAULT_SCENE_PARAMETERS.awakeningLightLeak, precision: 3 },
    { key: 'awakeningRayDensity', label: 'Radial Ray Density', uniform: 'u_rayDensity', min: 6, max: 48, step: 1, defaultValue: DEFAULT_SCENE_PARAMETERS.awakeningRayDensity, precision: 0 },
    { key: 'awakeningExpansionScale', label: 'Geometric Expansion', uniform: 'u_expansionScale', min: 0.5, max: 1.8, step: 0.02, defaultValue: DEFAULT_SCENE_PARAMETERS.awakeningExpansionScale, precision: 2 },
  ],
};

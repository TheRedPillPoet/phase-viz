import { IMAGE_FX_PRESETS } from '../../visual/imageFxPresets';
import { PRESETS } from '../../visual/presets';
import { PHASE_VIZ_PRESET_SCHEMA_VERSION, type PhaseVizPreset } from './PresetSchema';

export const builtinPresets: PhaseVizPreset[] = [
  ...Object.values(PRESETS).map((preset): PhaseVizPreset => ({
    schemaVersion: PHASE_VIZ_PRESET_SCHEMA_VERSION,
    id: `builtin.visualizer3d.${preset.id}`,
    name: preset.label,
    description: preset.description,
    mode: 'visualizer3d',
    visual: {
      legacyPresetId: preset.id,
      geometryMode: preset.geometryMode,
      ...(preset.backgroundEffect ? { backgroundEffect: preset.backgroundEffect } : {}),
      ...(preset.postEffect ? { postEffect: preset.postEffect } : {}),
      particleCount: preset.particleCount,
      particleSize: preset.particleSize,
      noiseScale: preset.noiseScale,
      reactionSpeed: preset.reactionSpeed,
      colors: {
        background: `#${preset.backgroundColor.getHexString()}`,
        particle: `#${preset.particleColor.getHexString()}`,
        accent: `#${preset.accentColor.getHexString()}`,
      },
    },
    effects: {
      glitch: preset.useGlitch,
      rgbSplit: preset.useRgbSplit,
      scanlines: preset.useScanlines,
      bloomStrength: preset.bloomStrength,
      bloomRadius: preset.bloomRadius,
    },
  })),
  ...Object.entries(IMAGE_FX_PRESETS).map(([id, values]): PhaseVizPreset => ({
    schemaVersion: PHASE_VIZ_PRESET_SCHEMA_VERSION,
    id: `builtin.imageFx.${id}`,
    name: `Image FX ${id}`,
    mode: 'imageFx',
    visual: values,
  })),
];

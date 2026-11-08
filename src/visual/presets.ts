import * as THREE from 'three';
import { BRAND } from '../brand/tokens';

export type PresetId =
  | 'minimal'
  | 'neon'
  | 'glitch'
  | 'organic'
  | 'matrix'
  | 'void'
  | 'haunted'
  | 'awakening';

export interface PresetConfig {
  id: PresetId;
  label: string;
  description: string;
  particleCount: number;
  backgroundColor: THREE.Color;
  particleColor: THREE.Color;
  accentColor: THREE.Color;
  bloomStrength: number;
  bloomRadius: number;
  useGlitch: boolean;
  useRgbSplit: boolean;
  useScanlines: boolean;
  particleSize: number;
  geometryMode: 'particles' | 'sphere' | 'torus' | 'wave';
  noiseScale: number;
  reactionSpeed: number;
  backgroundEffect?: 'matrixRain' | 'voidScene';
  postEffect?: 'hauntedScene' | 'awakeningScene';
}

export const PRESETS: Record<PresetId, PresetConfig> = {
  minimal: {
    id: 'minimal',
    label: 'Minimal Geometry',
    description: 'Clean fine particles',
    particleCount: 9000,
    backgroundColor: new THREE.Color(0x050505),
    particleColor: new THREE.Color(0xffffff),
    accentColor: new THREE.Color(0xcccccc),
    bloomStrength: 0,
    bloomRadius: 0,
    useGlitch: false,
    useRgbSplit: false,
    useScanlines: false,
    particleSize: 0.36,
    geometryMode: 'sphere',
    noiseScale: 0.5,
    reactionSpeed: 0.3,
  },
  neon: {
    id: 'neon',
    label: 'Neon Particle Storm',
    description: 'Mid-density, optimized',
    particleCount: 22000,
    backgroundColor: new THREE.Color(0x000510),
    particleColor: new THREE.Color(0x00ffff),
    accentColor: new THREE.Color(0xff00ff),
    bloomStrength: 0,
    bloomRadius: 0,
    useGlitch: false,
    useRgbSplit: true,
    useScanlines: false,
    particleSize: 0.34,
    geometryMode: 'particles',
    noiseScale: 1.0,
    reactionSpeed: 1.0,
  },
  glitch: {
    id: 'glitch',
    label: 'Digital Glitch',
    description: 'Digital noise, RGB split',
    particleCount: 24000,
    backgroundColor: new THREE.Color(0x000000),
    particleColor: new THREE.Color(0xff3300),
    accentColor: new THREE.Color(0x00ff44),
    bloomStrength: 0,
    bloomRadius: 0,
    useGlitch: true,
    useRgbSplit: true,
    useScanlines: true,
    particleSize: 0.38,
    geometryMode: 'wave',
    noiseScale: 2.0,
    reactionSpeed: 2.0,
  },
  organic: {
    id: 'organic',
    label: 'Ambient Organic',
    description: 'Fluid motion, slow reaction',
    particleCount: 22000,
    backgroundColor: new THREE.Color(0x020810),
    particleColor: new THREE.Color(0x44aaff),
    accentColor: new THREE.Color(0x88ffcc),
    bloomStrength: 0,
    bloomRadius: 0,
    useGlitch: false,
    useRgbSplit: false,
    useScanlines: false,
    particleSize: 0.32,
    geometryMode: 'torus',
    noiseScale: 0.3,
    reactionSpeed: 0.15,
  },
  matrix: {
    id: 'matrix',
    label: 'Matrix Rain',
    description: 'Procedural digital glyph streams',
    particleCount: 0,
    backgroundColor: new THREE.Color(BRAND.color.deepBlack),
    particleColor: new THREE.Color(BRAND.color.digitalGreen),
    accentColor: new THREE.Color(BRAND.color.silverBlue),
    bloomStrength: 0,
    bloomRadius: 0,
    useGlitch: false,
    useRgbSplit: false,
    useScanlines: false,
    particleSize: 0.3,
    geometryMode: 'particles',
    noiseScale: 0,
    reactionSpeed: 1,
    backgroundEffect: 'matrixRain',
  },
  void: {
    id: 'void',
    label: 'Void',
    description: 'A living gravitational field of orbital light and flowing energy',
    particleCount: 0,
    backgroundColor: new THREE.Color(BRAND.color.deepBlack),
    particleColor: new THREE.Color(BRAND.color.silverBlue),
    accentColor: new THREE.Color(BRAND.color.mistBlue),
    bloomStrength: 0,
    bloomRadius: 0,
    useGlitch: false,
    useRgbSplit: false,
    useScanlines: false,
    particleSize: 0.3,
    geometryMode: 'particles',
    noiseScale: 0,
    reactionSpeed: 0.15,
    backgroundEffect: 'voidScene',
  },
  haunted: {
    id: 'haunted',
    label: 'Haunted',
    description: 'Drifting spectral particles, passing wisps, and paranormal ripples',
    particleCount: 9000,
    backgroundColor: new THREE.Color(BRAND.color.deepBlack),
    particleColor: new THREE.Color(BRAND.color.mistBlue),
    accentColor: new THREE.Color(BRAND.color.silverBlue),
    bloomStrength: 0,
    bloomRadius: 0,
    useGlitch: false,
    useRgbSplit: false,
    useScanlines: false,
    particleSize: 0.52,
    geometryMode: 'sphere',
    noiseScale: 0.5,
    reactionSpeed: 0.3,
    postEffect: 'hauntedScene',
  },
  awakening: {
    id: 'awakening',
    label: 'Awakening',
    description: 'Ascendant light, expanding forms, and reactive rays',
    particleCount: 14000,
    backgroundColor: new THREE.Color(BRAND.color.nearBlack),
    particleColor: new THREE.Color(BRAND.color.silverBlue),
    accentColor: new THREE.Color(BRAND.color.crimsonLight),
    bloomStrength: 0,
    bloomRadius: 0,
    useGlitch: false,
    useRgbSplit: false,
    useScanlines: false,
    particleSize: 0.32,
    geometryMode: 'sphere',
    noiseScale: 0.35,
    reactionSpeed: 0.65,
    postEffect: 'awakeningScene',
  },
};

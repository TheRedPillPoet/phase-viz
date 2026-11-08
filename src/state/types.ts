export type PresetId =
  | 'minimal'
  | 'neon'
  | 'glitch'
  | 'organic'
  | 'matrix'
  | 'void'
  | 'haunted'
  | 'awakening';
export type MoodId = 'calm' | 'aggressive' | 'emotional' | 'dark' | 'bright';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type DisplayMode = 'visualizer3d' | 'wave' | 'imageFx';
export type AspectRatio = '16:9' | '9:16' | '1:1';
export type SceneParameterKey =
  | 'matrixDensity'
  | 'matrixSpeed'
  | 'matrixReactivity'
  | 'voidEnergy'
  | 'voidParticleDensity'
  | 'voidRibbonWeight'
  | 'voidMotionSpeed'
  | 'voidBassReactivity'
  | 'hauntedParticleDensity'
  | 'hauntedWispIntensity'
  | 'hauntedTrailPersistence'
  | 'hauntedSpectralBrightness'
  | 'hauntedAudioReactivity'
  | 'awakeningLightLeak'
  | 'awakeningRayDensity'
  | 'awakeningExpansionScale';
export type SceneParameterValues = Record<SceneParameterKey, number>;
export interface CaptionCueStyle {
  color?: string;
  fontFamily?: string;
  fontSizeRatio?: number;
  positionX?: number;
  positionY?: number;
}
export interface CaptionCueAnimation {
  fadeInSeconds?: number;
  fadeOutSeconds?: number;
}
export interface CaptionCue {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style?: CaptionCueStyle;
  animation?: CaptionCueAnimation;
}
export const ASPECT_RATIO_VALUES: Record<AspectRatio, number> = {
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '1:1': 1,
};
export type WaveVisualizerType = 'horizontal' | 'circular' | 'bars';
export type WaveBackgroundMode = 'solid' | 'image';
export type ImageFxPreset = 'clean' | 'glitch' | 'dreamy' | 'dark' | 'vhs';
export type ImageFxEffectKey = 'glow' | 'blur' | 'rgbShift' | 'noise' | 'distortion' | 'pulse';
export type LiveHelpLanguage = 'en' | 'ja';
export type ParticleShape = 'circle' | 'square' | 'diamond' | 'star' | 'ring';
export type ExportPresetId = 'fast720p' | 'high1080p';
export type VisualizerLayerId = 'background' | 'particles' | 'objects' | 'waveform';
export type ImageFxLayerId =
  | 'background'
  | 'distortion'
  | 'rgbShift'
  | 'glow'
  | 'pulse'
  | 'noise'
  | 'scanlines'
  | 'vignette'
  | 'datamosh'
  | 'blockDatamosh'
  | 'glitchDatamosh'
  | 'meltDatamosh'
  | 'toggleRgb'
  | 'glitch'
  | 'cameraShake';

export const DEFAULT_IMAGE_FX_LAYER_ORDER: ImageFxLayerId[] = [
  'background',
  'distortion',
  'rgbShift',
  'glow',
  'pulse',
  'datamosh',
  'blockDatamosh',
  'glitchDatamosh',
  'meltDatamosh',
  'toggleRgb',
  'noise',
  'glitch',
  'scanlines',
  'vignette',
  'cameraShake',
];

export const DEFAULT_VISUALIZER_LAYER_ORDER: VisualizerLayerId[] = [
  'background',
  'particles',
  'objects',
  'waveform',
];

export interface ExportPreset {
  id: ExportPresetId;
  label: string;
  description: string;
  width: number;
  height: number;
  fps: number;
}

export const EXPORT_PRESETS: Record<ExportPresetId, ExportPreset> = {
  fast720p: {
    id: 'fast720p',
    label: 'Fast 720p',
    description: '1280 x 720 / 30 fps',
    width: 1280,
    height: 720,
    fps: 30,
  },
  high1080p: {
    id: 'high1080p',
    label: 'High 1080p',
    description: '1920 x 1080 / 30 fps',
    width: 1920,
    height: 1080,
    fps: 30,
  },
};

export interface AudioAnalysis {
  bpm: number;
  loudness: number;
  waveform: Float32Array;
  spectrum: Float32Array[];
  transientMap: number[];
  stereoWidth: number;
  mood: MoodId;
  energy: EnergyLevel;
  duration: number;
}

export interface EffectSettings {
  bloom: boolean;
  chromaticAberration: boolean;
  rgbSplit: boolean;
  datamosh: boolean;
  strongDatamosh: boolean;
  blockDatamosh: boolean;
  glitchDatamosh: boolean;
  meltingDatamosh: boolean;
  glitchNoise: boolean;
  cameraShake: boolean;
}

export interface ParticleSettings {
  countScale: number;
  sizeScale: number;
  shape: ParticleShape;
}

export interface VisualizerSettings {
  cameraDistance: number;
  morphIntensity: number;
}

export interface WaveVisualizerSettings {
  type: WaveVisualizerType;
  backgroundMode: WaveBackgroundMode;
}

export interface ImageFxSettings {
  preset: ImageFxPreset;
  glow: number;
  blur: number;
  rgbShift: number;
  noise: number;
  distortion: number;
  pulse: number;
}

export interface AudioSlice {
  audioFile: File | null;
  audioBuffer: AudioBuffer | null;
  analysis: AudioAnalysis | null;
  backgroundImageUrl: string | null;
  isAnalyzing: boolean;
  setAudioFile: (file: File) => void;
  setAudioBuffer: (buf: AudioBuffer) => void;
  setAnalysis: (a: AudioAnalysis) => void;
  setBackgroundImageUrl: (url: string | null) => void;
  setIsAnalyzing: (v: boolean) => void;
}

export interface PlaybackSlice {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  fps: number;
  isFullscreen: boolean;
  setIsPlaying: (v: boolean) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setFps: (f: number) => void;
  setIsFullscreen: (v: boolean) => void;
}

export interface VisualSlice {
  displayMode: DisplayMode;
  aspectRatio: AspectRatio;
  sceneParameters: SceneParameterValues;
  preset: PresetId;
  presetRevision: number;
  effects: EffectSettings;
  particleSettings: ParticleSettings;
  visualizerSettings: VisualizerSettings;
  visualizerLayerOrder: VisualizerLayerId[];
  waveSettings: WaveVisualizerSettings;
  imageFxSettings: ImageFxSettings;
  imageFxLayerOrder: ImageFxLayerId[];
  setDisplayMode: (mode: DisplayMode) => void;
  setAspectRatio: (aspectRatio: AspectRatio) => void;
  setSceneParameter: (key: SceneParameterKey, value: number) => void;
  setPreset: (p: PresetId) => void;
  toggleEffect: (e: keyof EffectSettings) => void;
  setParticleCountScale: (value: number) => void;
  setParticleSizeScale: (value: number) => void;
  setParticleShape: (shape: ParticleShape) => void;
  setCameraDistance: (value: number) => void;
  setMorphIntensity: (value: number) => void;
  moveVisualizerLayer: (layer: VisualizerLayerId, direction: -1 | 1) => void;
  resetVisualizerLayerOrder: () => void;
  setWaveType: (type: WaveVisualizerType) => void;
  setWaveBackgroundMode: (mode: WaveBackgroundMode) => void;
  setImageFxPreset: (preset: ImageFxPreset, values: Omit<ImageFxSettings, 'preset'>) => void;
  setImageFxEffect: (key: ImageFxEffectKey, value: number) => void;
  moveImageFxLayer: (layer: ImageFxLayerId, direction: -1 | 1) => void;
  resetImageFxLayerOrder: () => void;
}

export interface LiveSlice {
  isLiveMode: boolean;
  liveUiVisible: boolean;
  liveHelpOpen: boolean;
  liveHelpLanguage: LiveHelpLanguage;
  liveIntensity: number;
  liveBoost: boolean;
  setIsLiveMode: (value: boolean) => void;
  setLiveUiVisible: (value: boolean) => void;
  setLiveHelpOpen: (value: boolean) => void;
  setLiveHelpLanguage: (language: LiveHelpLanguage) => void;
  setLiveIntensity: (value: number) => void;
  setLiveBoost: (value: boolean) => void;
}

export interface ExportSlice {
  exportPreset: ExportPresetId;
  isExporting: boolean;
  exportProgress: number;
  exportError: string | null;
  exportStatus: string | null;
  exportDownloadUrl: string | null;
  exportDownloadName: string;
  setExportPreset: (preset: ExportPresetId) => void;
  setIsExporting: (v: boolean) => void;
  setExportProgress: (p: number) => void;
  setExportError: (message: string | null) => void;
  setExportStatus: (message: string | null) => void;
  setExportDownload: (url: string | null, fileName?: string) => void;
}

export interface ProjectSlice {
  projectName: string;
  setProjectName: (name: string) => void;
}

export type AppState = AudioSlice
  & PlaybackSlice
  & VisualSlice
  & LiveSlice
  & ExportSlice
  & ProjectSlice;

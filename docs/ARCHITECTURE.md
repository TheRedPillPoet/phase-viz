# phase-viz Architecture

phase-viz is moving from a single browser visualizer app toward a browser-native audio visual engine that also ships with an app.

The current rule is compatibility first: the app should behave as before while internal APIs become easier to extend, fork, and reuse.

## Runtime Flow

```txt
local media
  -> Web Audio analysis
  -> normalized AudioAnalysis / AudioFrame data
  -> selected visual mode renderer
  -> live canvas or export renderer
  -> WebCodecs encoder or ffmpeg.wasm fallback
```

## Source Map

| Area | Location | Responsibility |
| --- | --- | --- |
| App shell | `src/app/` | Theme, layout, panels, stage, live shortcuts, export orchestration |
| State | `src/state/` | Zustand slices for audio, playback, visual, preset/live/export/project concerns |
| Engine API | `src/engine/` | Stable contracts for audio frames, visual modes, presets, and export jobs |
| Modes | `src/modes/` | Visual mode packages and contributor-facing examples |
| Existing UI | `src/ui/` | Current production visualizers and controls |
| Audio utilities | `src/audio/` | Offline analysis, FFT, waveform, BPM, transient, and stereo-width helpers |
| Visual internals | `src/visual/` | Current Three.js scene, particles, presets, image FX, and effects |
| Export internals | `src/export/` | Current WebCodecs, Mediabunny MP4 muxing, ffmpeg.wasm fallback, recorder, and download utilities |

## State Slices

`src/store.ts` remains as a compatibility re-export. New code should prefer `src/state` directly when it needs state types or slice-aware organization.

- `audioSlice`: selected audio, decoded buffer, analysis, background image, analysis status
- `playbackSlice`: playback time, duration, FPS, fullscreen status
- `visualSlice`: display mode, 3D preset, effects, particles, layers, wave settings, image FX settings
- `liveSlice`: Live/VJ UI state, intensity, help, boost
- `exportSlice`: export preset, progress, status, error, download metadata
- `projectSlice`: future project-level metadata

## AudioFrame

`AudioFrame` is the normalized contract future visual modes should consume:

```ts
type AudioFrame = {
  time: number;
  progress: number;
  volume: number;
  low: number;
  mid: number;
  high: number;
  transient: number;
  beat: number;
  stereoWidth?: number;
  waveform?: Float32Array;
  spectrum?: Float32Array;
};
```

Today it wraps existing `AudioAnalysis`. Over time, live rendering, export rendering, and new modes should converge on this frame contract.

## Visual Modes

The plugin-like visual mode contract lives in `src/engine/visual/`.

```ts
type VisualModeDefinition<TConfig = unknown> = {
  id: string;
  name: string;
  description?: string;
  defaultConfig: TConfig;
  render: (context: RenderContext<TConfig>) => React.ReactNode;
};
```

See `src/modes/exampleMinimal/` for the smallest mode shape. Production modes still use the existing UI components while this contract settles.

## Presets

`src/engine/preset/` contains:

- `PresetSchema.ts`: JSON-friendly preset contract
- `PresetRegistry.ts`: in-memory registry for builtin, imported, or user presets
- `presetMigration.ts`: version migration hook
- `builtinPresets.ts`: adapter from legacy built-ins to the new schema

The goal is a future preset ecosystem where presets can be saved, shared, versioned, migrated, and imported without coupling every preset to React state.

## Export

`ExportEngine` is the first orchestration wrapper around the existing export path. It currently accepts an existing `ExportFrameRenderer`, applies the selected preset, validates the output blob, and forwards progress/status callbacks.

The lower-level encoders still live in `src/export/`. The WebCodecs path encodes AVC video and AAC audio directly, then uses Mediabunny to mux the encoded packets into MP4; ffmpeg.wasm remains the fallback. These encoders are re-exported through `src/engine/export/` so future callers have an engine-facing import path.

## Incremental Migration Guidelines

- Keep current visual output stable when moving files.
- Preserve `src/store.ts` compatibility until production imports are migrated.
- Put new visual experiments in `src/modes/<modeName>/`.
- Prefer JSON-friendly preset data at engine boundaries.
- Use `AudioFrame` for new render logic instead of reaching directly into global app state.
- Keep export browser-native and cancellation-aware.

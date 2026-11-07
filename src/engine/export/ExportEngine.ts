import { DEFAULT_EXPORT_FILE_NAME } from '../../export/download';
import type { ExportJob, ExportResult } from './ExportJob';

export class ExportEngine {
  async render(job: ExportJob): Promise<ExportResult> {
    const { preset, renderer, duration, signal, onProgress, onStatus } = job;
    onStatus?.(`Preparing ${preset.label} export...`);
    const dimensions = getExportDimensions(preset.width, preset.height, job.aspectRatio);

    const blob = await renderer({
      duration,
      fps: preset.fps,
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: job.aspectRatio,
      signal,
      onProgress: createThrottledProgressReporter(onProgress),
      onStatus,
    });

    if (blob.size < 1024) {
      throw new Error('Export finished without a valid MP4 payload');
    }

    return {
      blob,
      fileName: getExportFileName(preset),
    };
  }
}

function getExportDimensions(width: number, height: number, aspectRatio: ExportJob['aspectRatio']) {
  if (aspectRatio === '16:9') return { width, height };
  if (aspectRatio === '9:16') {
    return width >= height ? { width: height, height: width } : { width, height };
  }
  const side = Math.min(width, height);
  return { width: side, height: side };
}

function createThrottledProgressReporter(onProgress: (progress: number) => void) {
  let lastProgress = 0;
  let lastProgressAt = 0;
  return (progress: number) => {
    const now = performance.now();
    if (progress <= 0 || progress >= 1 || progress - lastProgress >= 0.01 || now - lastProgressAt >= 120) {
      lastProgress = progress;
      lastProgressAt = now;
      onProgress(progress);
    }
  };
}

function getExportFileName(preset: { height: number }) {
  return preset.height === 1080
    ? DEFAULT_EXPORT_FILE_NAME
    : `audio-visualizer-${preset.height}p.mp4`;
}

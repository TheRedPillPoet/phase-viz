import type { ExportPreset } from '../../state';
import type { AspectRatio } from '../../state';
import type { ExportFrameRenderer } from '../../export/recorder';

export type ExportJob = {
  duration: number;
  preset: ExportPreset;
  aspectRatio: AspectRatio;
  renderer: ExportFrameRenderer;
  signal?: AbortSignal;
  onProgress: (progress: number) => void;
  onStatus?: (status: string) => void;
};

export type ExportResult = {
  blob: Blob;
  fileName: string;
};

import { drawCanvasWithBrandLogo, loadBrandLogo } from './brandLogo';
import { ASPECT_RATIO_VALUES, type AspectRatio } from '../state/types';
import { getLiveCompositionAudioFrame } from '../visual/composition';

export interface RecorderFrame {
  blob: Blob;
  timeMs: number;
}

export interface ExportRenderOptions {
  duration: number;
  fps: number;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  onProgress: (progress: number) => void;
  onStatus?: (status: string) => void;
  signal?: AbortSignal;
}

export type ExportFrameRenderer = (options: ExportRenderOptions) => Promise<Blob>;

export class FrameRecorder {
  private frames: RecorderFrame[] = [];
  private canvas: HTMLCanvasElement;
  private captureCanvas = document.createElement('canvas');
  private captureQueue: Promise<void> = Promise.resolve();

  constructor(canvas: HTMLCanvasElement) {

    this.canvas = canvas;
  }

  captureFrame(timeMs: number): Promise<void> {
    const capture = this.captureQueue.then(() => this.captureBrandedFrame(timeMs));
    this.captureQueue = capture.then(() => undefined, () => undefined);
    return capture;
  }

  private async captureBrandedFrame(timeMs: number) {
    const brandLogo = await loadBrandLogo();
    const width = this.canvas.width;
    const height = this.canvas.height;
    if (width <= 0 || height <= 0) {
      throw new Error(`Could not capture export frame at ${Math.round(timeMs)}ms: canvas backing buffer is empty`);
    }

    if (this.captureCanvas.width !== width || this.captureCanvas.height !== height) {
      this.captureCanvas.width = width;
      this.captureCanvas.height = height;
    }
    const context = this.captureCanvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not create recorder canvas for the brand logo');

    try {
      drawCanvasWithBrandLogo(
        context,
        this.canvas,
        brandLogo,
        width,
        height,
        getNearestAspectRatio(width, height),
        getLiveCompositionAudioFrame(),
      );
    } catch (error) {
      throw new Error(`Could not capture export frame at ${Math.round(timeMs)}ms`, { cause: error });
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      this.captureCanvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error(`Could not capture export frame at ${Math.round(timeMs)}ms`));
            return;
          }
          resolve(result);
        },
        'image/jpeg',
        0.72,
      );
    });
    this.frames.push({ blob, timeMs });
  }

  getFrames(): RecorderFrame[] {
    return this.frames;
  }

  clear() {
    this.frames = [];
  }

  getFrameCount(): number {
    return this.frames.length;
  }
}

function getNearestAspectRatio(width: number, height: number): AspectRatio {
  const ratio = width / Math.max(height, 1);
  return (Object.entries(ASPECT_RATIO_VALUES) as [AspectRatio, number][])
    .reduce((nearest, current) => (
      Math.abs(current[1] - ratio) < Math.abs(nearest[1] - ratio) ? current : nearest
    ))[0];
}

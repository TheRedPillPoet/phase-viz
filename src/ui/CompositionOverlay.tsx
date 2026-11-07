import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { drawCompositionOverlay, getLiveCompositionAudioFrame, loadBrandLogo } from '../visual/composition';

const COMPOSITION_FPS = 30;
const FRAME_INTERVAL_MS = 1000 / COMPOSITION_FPS;

export default function CompositionOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aspectRatio = useStore((state) => state.aspectRatio);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let animationFrame = 0;
    let lastFrameTime = 0;
    let image: HTMLImageElement | null = null;
    let disposed = false;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const backingWidth = Math.max(1, Math.round(width * pixelRatio));
      const backingHeight = Math.max(1, Math.round(height * pixelRatio));
      if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
        canvas.width = backingWidth;
        canvas.height = backingHeight;
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    void loadBrandLogo().then((loadedImage) => {
      if (!disposed) image = loadedImage;
    }).catch((error: unknown) => {
      console.error('Could not load the live composition logo:', error);
    });

    const draw = (timestamp: number) => {
      animationFrame = requestAnimationFrame(draw);
      if (timestamp - lastFrameTime < FRAME_INTERVAL_MS) return;
      lastFrameTime = timestamp;

      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);
      if (image && width > 0 && height > 0) {
        drawCompositionOverlay(
          context,
          image,
          width,
          height,
          aspectRatio,
          getLiveCompositionAudioFrame(),
        );
      }
    };
    animationFrame = requestAnimationFrame(draw);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [aspectRatio]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        zIndex: 5,
      }}
    />
  );
}

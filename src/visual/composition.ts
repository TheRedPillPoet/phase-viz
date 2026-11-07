import { BRAND } from '../brand/tokens';
import { ASPECT_RATIO_VALUES, type AspectRatio, type CaptionCue } from '../state/types';

export interface CompositionAudioFrame {
  time: number;
  bass: number;
  transient: number;
}

export interface LogoAudioReactivity {
  time?: number;
  bass: number;
  transient: number;
}

let brandLogoPromise: Promise<HTMLImageElement> | null = null;
let liveAudioFrame: CompositionAudioFrame = { time: 0, bass: 0, transient: 0 };

export function loadBrandLogo(signal?: AbortSignal) {
  if (!brandLogoPromise) {
    const loading = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Could not load the Red Pill Poet composition logo'));
      image.src = `${import.meta.env.BASE_URL}brand/the-red-pill-poet-logo.png`;
    });
    brandLogoPromise = loading.catch((error: unknown) => {
      brandLogoPromise = null;
      throw error;
    });
  }
  if (!signal) return brandLogoPromise;
  if (signal.aborted) {
    return Promise.reject(new DOMException('Export was canceled', 'AbortError'));
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const cleanup = () => signal.removeEventListener('abort', onAbort);
    const onAbort = () => {
      cleanup();
      reject(new DOMException('Export was canceled', 'AbortError'));
    };

    signal.addEventListener('abort', onAbort, { once: true });
    brandLogoPromise?.then(
      (image) => {
        cleanup();
        resolve(image);
      },
      (error: unknown) => {
        cleanup();
        reject(error);
      },
    );
  });
}

export function setLiveCompositionAudioFrame(frame: CompositionAudioFrame) {
  liveAudioFrame = {
    time: Number.isFinite(frame.time) ? frame.time : liveAudioFrame.time,
    bass: clamp01(frame.bass),
    transient: clamp01(frame.transient),
  };
}

export function getLiveCompositionAudioFrame() {
  return liveAudioFrame;
}

export function drawCompositionOverlay(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  aspectRatio: AspectRatio,
  audio: LogoAudioReactivity | undefined,
  cues: readonly CaptionCue[] = [],
) {
  drawBrandLogo(context, image, width, height, aspectRatio, audio);
  drawCaptionCues(context, width, height, audio?.time ?? 0, cues);
}

export function drawCompositionFrame(
  context: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  image: HTMLImageElement,
  width: number,
  height: number,
  aspectRatio: AspectRatio,
  audio: LogoAudioReactivity | undefined,
  cues: readonly CaptionCue[] = [],
) {
  context.clearRect(0, 0, width, height);
  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = 1;
  context.drawImage(source, 0, 0, width, height);
  drawCompositionOverlay(context, image, width, height, aspectRatio, audio, cues);
}

export function drawBrandLogo(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  aspectRatio: AspectRatio,
  audio?: LogoAudioReactivity,
) {
  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error('The Red Pill Poet composition logo has invalid dimensions');
  }

  const logoAspectRatio = image.naturalWidth / image.naturalHeight;
  const expectedWidth = height * ASPECT_RATIO_VALUES[aspectRatio];
  const logoBoxWidth = Math.min(width, expectedWidth);
  const padding = height * BRAND.exportLogo.paddingRatio;
  const logoWidth = Math.min(
    logoBoxWidth * BRAND.exportLogo.maxWidthRatio[aspectRatio],
    height * BRAND.exportLogo.maxHeightRatio * logoAspectRatio,
    width - padding * 2,
  );
  const logoHeight = logoWidth / logoAspectRatio;
  const left = (width - logoWidth) / 2;
  const top = height * BRAND.exportLogo.topPaddingRatio[aspectRatio];
  const audioPulse = smoothstep(clamp01(
    (audio?.bass ?? 0) * 0.72 + (audio?.transient ?? 0) * 0.28,
  ));

  context.save();
  try {
    context.globalCompositeOperation = 'screen';
    const centerX = left + logoWidth * 0.5;
    const centerY = top + logoHeight * 0.5;
    const glowRadius = logoWidth * BRAND.exportLogo.glowRadiusRatio;
    const glow = context.createRadialGradient(
      centerX,
      centerY,
      logoHeight * 0.12,
      centerX,
      centerY,
      glowRadius,
    );
    glow.addColorStop(0, BRAND.color.digitalGreen);
    glow.addColorStop(0.48, BRAND.color.digitalGreen);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.globalAlpha = BRAND.exportLogo.glowBaseOpacity
      + audioPulse * BRAND.exportLogo.glowReactiveOpacity;
    context.fillStyle = glow;
    context.fillRect(centerX - glowRadius, centerY - glowRadius, glowRadius * 2, glowRadius * 2);

    context.globalAlpha = Math.min(
      1,
      BRAND.exportLogo.opacity + audioPulse * BRAND.exportLogo.logoReactiveOpacity,
    );
    context.drawImage(image, left, top, logoWidth, logoHeight);
  } finally {
    context.restore();
  }
}

function drawCaptionCues(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  cues: readonly CaptionCue[],
) {
  const cue = cues.find((candidate) => time >= candidate.startTime && time < candidate.endTime);
  if (!cue) return;

  const safeWidth = width * 0.8;
  const fontSize = Math.max(14, height * (cue.style?.fontSizeRatio ?? 0.036));
  const x = width * (cue.style?.positionX ?? 0.5);
  const y = height * (cue.style?.positionY ?? 0.62);
  const lines = wrapCaptionLines(context, cue.text, safeWidth, fontSize, cue.style?.fontFamily);
  const fadeIn = cue.animation?.fadeInSeconds ?? 0.2;
  const fadeOut = cue.animation?.fadeOutSeconds ?? 0.2;
  const fadeInOpacity = fadeIn > 0 ? clamp01((time - cue.startTime) / fadeIn) : 1;
  const fadeOutOpacity = fadeOut > 0
    ? clamp01((cue.endTime - time) / fadeOut)
    : 1;

  context.save();
  try {
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `${fontSize}px ${cue.style?.fontFamily ?? BRAND.typography.literary}`;
    context.fillStyle = cue.style?.color ?? BRAND.color.silver;
    context.shadowColor = BRAND.color.pureBlack;
    context.shadowBlur = fontSize * 0.45;
    context.globalAlpha = fadeInOpacity * fadeOutOpacity;
    lines.forEach((line, index) => {
      context.fillText(
        line,
        x,
        y + (index - (lines.length - 1) / 2) * fontSize * 1.28,
        safeWidth,
      );
    });
  } finally {
    context.restore();
  }
}

function wrapCaptionLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string = BRAND.typography.literary,
) {
  context.save();
  context.font = `${fontSize}px ${fontFamily}`;
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  context.restore();
  return lines;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

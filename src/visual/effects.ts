import * as THREE from 'three';

type EffectUniform<T> = THREE.ShaderMaterial['uniforms'][string] & { value: T };

export interface EffectUniforms {
  uTime: EffectUniform<number>;
  uRgbSplit: EffectUniform<number>;
  uChromaticAberration: EffectUniform<number>;
  uGlitchNoise: EffectUniform<number>;
  uDatamosh: EffectUniform<number>;
  uCameraShake: EffectUniform<number>;
  tDiffuse: EffectUniform<THREE.Texture | null>;
  tPrev: EffectUniform<THREE.Texture | null>;
  uTransient: EffectUniform<number>;
  uScanlines: EffectUniform<number>;
}

export const POST_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const POST_FRAG = `
  uniform sampler2D tDiffuse;
  uniform sampler2D tPrev;
  uniform float uTime;
  uniform float uRgbSplit;
  uniform float uChromaticAberration;
  uniform float uGlitchNoise;
  uniform float uDatamosh;
  uniform float uScanlines;
  uniform float uTransient;
  varying vec2 vUv;

  float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;

    // Scanlines
    if (uScanlines > 0.0) {
      float scan = mod(gl_FragCoord.y, 3.0);
      if (scan < 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) * uScanlines * 0.3;
      }
    }

    // Glitch noise
    if (uGlitchNoise > 0.0) {
      float noise = rand(vec2(uv.y * 0.1, floor(uTime * 10.0)));
      if (noise > 0.95 * (1.0 - uGlitchNoise * 0.8)) {
        uv.x += (rand(vec2(uTime, uv.y)) - 0.5) * 0.1 * uGlitchNoise;
      }
    }

    // RGB Split + Chromatic Aberration
    float splitAmt = uRgbSplit * 0.02 + uChromaticAberration * 0.01;
    float r = texture2D(tDiffuse, uv + vec2(splitAmt, 0.0)).r;
    float g = texture2D(tDiffuse, uv).g;
    float b = texture2D(tDiffuse, uv - vec2(splitAmt, 0.0)).b;

    vec4 color = vec4(r, g, b, 1.0);

    // Datamosh: blend with previous frame
    if (uDatamosh > 0.0) {
      vec4 prev = texture2D(tPrev, uv);
      color = mix(color, prev, uDatamosh * 0.6);
    }

    // Scanline darkening pass
    if (uScanlines > 0.0) {
      float scanLine = sin(uv.y * 600.0) * 0.5 + 0.5;
      color.rgb *= mix(1.0, scanLine * 0.8 + 0.6, uScanlines * 0.4);
    }

    gl_FragColor = color;
  }
`;

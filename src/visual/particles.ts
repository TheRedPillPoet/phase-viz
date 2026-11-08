import * as THREE from 'three';
import type { ParticleShape } from '../store';

export class ParticleSystem {
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
  points: THREE.Points;
  private basePositions: Float32Array;
  private particleCount: number;
  private density = 1;
  private hauntedFlow = 0;

  constructor(count: number) {
    this.geometry = new THREE.BufferGeometry();
    this.basePositions = new Float32Array(count * 3);
    this.particleCount = count;

    // Sphere distribution
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = 1 + Math.random() * 2;
      this.basePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      this.basePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      this.basePositions[i * 3 + 2] = r * Math.cos(phi);
    }

    const positions = new Float32Array(this.basePositions);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = 0.22 + Math.random() * 0.38;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uHigh: { value: 0 },
        uTransient: { value: 0 },
        uHauntedFlow: { value: 0 },
        uColorA: { value: new THREE.Color(0x00ffff) },
        uColorB: { value: new THREE.Color(0xff00ff) },
        uParticleSize: { value: 2.0 },
        uShape: { value: 0 },
      },
      vertexShader: `
        attribute float aPhase;
        attribute float aSize;
        uniform float uTime;
        uniform float uBass;
        uniform float uMid;
        uniform float uHigh;
        uniform float uTransient;
        uniform float uHauntedFlow;
        uniform float uParticleSize;
        varying float vBrightness;
        varying vec3 vPosition;

        void main() {
          vec3 pos = position;
          float driftSpeed = 0.12 + fract(aPhase * 0.159) * 0.22;
          float driftTime = uTime * driftSpeed + aPhase;
          float rotation = uTime * driftSpeed * uHauntedFlow;
          float rotationCos = cos(rotation);
          float rotationSin = sin(rotation);
          pos.xz = mat2(rotationCos, -rotationSin, rotationSin, rotationCos) * pos.xz;
          pos += vec3(
            sin(driftTime + pos.z * 1.7),
            cos(driftTime * 0.83 + pos.x * 1.5),
            sin(driftTime * 0.71 + pos.y * 1.3)
          ) * (0.18 * uHauntedFlow);
          float noise = sin(pos.x * 3.0 + uTime + aPhase) * cos(pos.z * 2.0 + uTime * 0.7);

          // Bass causes radial expansion
          float dist = length(pos);
          pos += normalize(pos) * uBass * 1.5 * (1.0 + noise * 0.3);

          // Transient explosion
          pos += normalize(pos) * uTransient * 2.0;

          // High freq → Y ripple
          pos.y += sin(pos.x * 5.0 + uTime * 2.0 + aPhase) * uHigh * 0.5;

          vBrightness = 0.24 + uBass * 0.34 + uMid * 0.22 + uHigh * 0.24;
          vPosition = pos;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = uParticleSize * aSize * (300.0 / -mvPosition.z);
          // High freq → smaller particles
          gl_PointSize *= (1.0 - uHigh * 0.5);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uShape;
        varying float vBrightness;
        varying vec3 vPosition;

        float circleMask(vec2 p) {
          float d = length(p);
          return 1.0 - smoothstep(0.36, 0.5, d);
        }

        float squareMask(vec2 p) {
          float d = max(abs(p.x), abs(p.y));
          return 1.0 - smoothstep(0.42, 0.5, d);
        }

        float diamondMask(vec2 p) {
          float d = abs(p.x) + abs(p.y);
          return 1.0 - smoothstep(0.52, 0.72, d);
        }

        float starMask(vec2 p) {
          float angle = atan(p.y, p.x);
          float radius = length(p);
          float spikes = 0.5 + 0.5 * cos(angle * 5.0);
          float limit = mix(0.24, 0.5, spikes);
          return 1.0 - smoothstep(limit, limit + 0.05, radius);
        }

        float ringMask(vec2 p) {
          float d = length(p);
          float outer = 1.0 - smoothstep(0.42, 0.5, d);
          float inner = 1.0 - smoothstep(0.18, 0.29, d);
          return max(0.0, outer - inner);
        }

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float mask = circleMask(uv);
          if (uShape > 0.5 && uShape < 1.5) {
            mask = squareMask(uv);
          } else if (uShape > 1.5 && uShape < 2.5) {
            mask = diamondMask(uv);
          } else if (uShape > 2.5 && uShape < 3.5) {
            mask = starMask(uv);
          } else if (uShape > 3.5) {
            mask = ringMask(uv);
          }
          if (mask <= 0.01) discard;
          float alpha = mask * vBrightness;
          float t = length(vPosition) * 0.2;
          vec3 color = mix(uColorA, uColorB, clamp(t, 0.0, 1.0));
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
  }

  update(time: number, bass: number, mid: number, high: number, transient: number) {
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uBass.value = bass;
    this.material.uniforms.uMid.value = mid;
    this.material.uniforms.uHigh.value = high;
    this.material.uniforms.uTransient.value = transient;
  }

  setColors(colorA: THREE.Color, colorB: THREE.Color) {
    this.material.uniforms.uColorA.value = colorA;
    this.material.uniforms.uColorB.value = colorB;
  }

  setParticleSize(size: number) {
    this.material.uniforms.uParticleSize.value = size;
  }

  setDensity(density: number) {
    const nextDensity = THREE.MathUtils.clamp(density, 0, 1);
    if (nextDensity === this.density) return;
    this.density = nextDensity;
    this.geometry.setDrawRange(0, Math.floor(this.particleCount * nextDensity));
  }

  setHauntedFlow(enabled: boolean) {
    const nextFlow = enabled ? 1 : 0;
    if (nextFlow === this.hauntedFlow) return;
    this.hauntedFlow = nextFlow;
    this.material.uniforms.uHauntedFlow.value = nextFlow;
  }

  setShape(shape: ParticleShape) {
    this.material.uniforms.uShape.value = particleShapeToUniform(shape);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

function particleShapeToUniform(shape: ParticleShape) {
  switch (shape) {
    case 'square':
      return 1;
    case 'diamond':
      return 2;
    case 'star':
      return 3;
    case 'ring':
      return 4;
    default:
      return 0;
  }
}

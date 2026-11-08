import * as THREE from 'three';
import { BRAND } from '../brand/tokens';

const BACKGROUND_DISTANCE = 50;
const VORTEX_DISTANCE = 18;
const RIBBON_SEGMENTS = 220;
const PARTICLE_COUNT = 360;
const TAU = Math.PI * 2;

const VOID_SCENE_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const VOID_SCENE_FRAGMENT_SHADER = `
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_bass;
  uniform float u_high;
  uniform float u_energy;
  uniform float u_density;
  uniform float u_bassReactivity;
  uniform vec3 u_voidColor;
  uniform vec3 u_silverColor;
  varying vec2 vUv;

  float hash(vec2 value) {
    return fract(sin(dot(value, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float valueNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    float lower = mix(hash(cell), hash(cell + vec2(1.0, 0.0)), local.x);
    float upper = mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), local.x);
    return mix(lower, upper, local.y);
  }

  float starField(vec2 point, float scale, float threshold, float time) {
    vec2 cell = floor(point * scale);
    vec2 local = fract(point * scale);
    vec2 position = vec2(
      hash(cell + vec2(17.1, 9.2)),
      hash(cell + vec2(4.7, 31.8))
    );
    float seed = hash(cell + vec2(62.4, 18.6));
    float star = 1.0 - smoothstep(0.01, 0.04, length(local - position));
    return star * step(threshold, seed)
      * (0.55 + 0.45 * sin(time * (0.35 + seed * 1.2) + seed * 6.2831));
  }

  void main() {
    vec2 resolution = max(u_resolution, vec2(1.0));
    float aspect = resolution.x / resolution.y;
    vec2 point = (vUv - 0.5) * vec2(aspect, 1.0);
    float bass = clamp(u_bass * u_bassReactivity, 0.0, 2.0);
    float radius = length(point);
    float time = u_time;

    float lens = 0.018 * u_energy / (radius + 0.12) * (1.0 + bass * 0.9);
    vec2 lensedPoint = point + normalize(point + vec2(0.0001)) * lens;
    float density = clamp((u_density - 0.3) / 1.2, 0.0, 1.0);
    float stars = starField(lensedPoint + vec2(time * 0.012, -time * 0.008), 70.0, 0.996 - density * 0.035, time)
      * (0.12 + u_high * 0.28);
    stars += starField(lensedPoint + vec2(3.2, -1.7), 145.0, 0.999 - density * 0.03, time * 1.3)
      * (0.08 + u_high * 0.38);
    float cloud = valueNoise(point * vec2(7.0, 10.0) + vec2(time * 0.018, -time * 0.012));
    float atmosphere = exp(-radius * 2.4) * cloud * (0.008 + u_energy * 0.008);
    vec3 color = u_voidColor * 0.22 + u_silverColor * (stars + atmosphere);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const RIBBON_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RIBBON_FRAGMENT_SHADER = `
  uniform float u_time;
  uniform float u_mid;
  uniform float u_transient;
  uniform float u_shockwaveAge;
  uniform float u_energy;
  uniform float u_weight;
  uniform float u_phase;
  uniform vec3 u_color;
  uniform vec3 u_accent;
  varying vec2 vUv;

  void main() {
    float across = abs(vUv.y - 0.5) * 2.0;
    float edge = 1.0 - smoothstep(0.68, 1.0, across);
    float core = 1.0 - smoothstep(0.0, 0.34, across);
    float shimmer = 0.78 + 0.22 * sin(vUv.x * 32.0 - u_time * (2.2 + u_mid * 1.4) + u_phase);
    float travelingPulse = pow(max(0.0, sin(vUv.x * 15.0 - u_time * (2.8 + u_mid * 1.7) + u_phase)), 18.0);
    float pulsePosition = clamp(u_shockwaveAge * (0.42 + u_mid * 0.08), 0.0, 1.0);
    float impactPulse = exp(-abs(vUv.x - pulsePosition) * 34.0) * exp(-u_shockwaveAge * 0.56);
    vec3 strandColor = mix(u_color, vec3(0.92, 0.97, 1.0), core * 0.78);
    strandColor = mix(strandColor, u_accent, 0.08 + 0.08 * sin(vUv.x * 12.0 + u_phase));
    float intensity = u_energy * u_weight * shimmer
      * (0.72 + core * 0.78 + travelingPulse * 0.9 + impactPulse * (0.72 + u_transient * 0.7));
    gl_FragColor = vec4(strandColor * intensity, edge * (0.42 + core * 0.56));
  }
`;

const PARTICLE_VERTEX_SHADER = `
  attribute float aSize;
  attribute float aSeed;
  uniform float u_high;
  uniform float u_time;
  varying float vSeed;
  varying float vPulse;

  void main() {
    vSeed = aSeed;
    vPulse = 0.72 + 0.28 * sin(u_time * (2.0 + aSeed * 3.0) + aSeed * 6.2831);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = aSize * (1.0 + u_high * 1.8);
  }
`;

const PARTICLE_FRAGMENT_SHADER = `
  uniform float u_high;
  uniform float u_density;
  uniform vec3 u_color;
  uniform vec3 u_accent;
  varying float vSeed;
  varying float vPulse;

  void main() {
    float density = clamp((u_density - 0.3) / 1.2, 0.0, 1.0);
    float active = smoothstep(vSeed - 0.035, vSeed + 0.035, density);
    float radius = length(gl_PointCoord - 0.5);
    float halo = exp(-radius * 8.0);
    float core = 1.0 - smoothstep(0.03, 0.19, radius);
    vec3 color = mix(u_color, u_accent, vSeed * 0.18);
    float intensity = (0.45 + u_high * 1.35) * vPulse * active;
    gl_FragColor = vec4(color * intensity, (halo * 0.38 + core * 0.9) * intensity);
  }
`;

interface RibbonProfile {
  phase: number;
  turns: number;
  direction: number;
  width: number;
  color: string;
  accent: string;
}

interface ParticleTrack {
  seed: number;
  profileIndex: number;
  speed: number;
}

const RIBBON_PROFILES: readonly RibbonProfile[] = [
  { phase: 0.1, turns: 1.18, direction: 1, width: 0.044, color: BRAND.color.silverBlue, accent: BRAND.color.mistBlue },
  { phase: 1.55, turns: 1.42, direction: -1, width: 0.039, color: BRAND.color.mistBlue, accent: BRAND.color.silverBlue },
  { phase: 2.9, turns: 1.28, direction: 1, width: 0.036, color: BRAND.color.silverBlue, accent: BRAND.color.crimsonLight },
  { phase: 4.35, turns: 1.56, direction: -1, width: 0.04, color: BRAND.color.silverBlue, accent: BRAND.color.mistBlue },
  { phase: 5.55, turns: 1.05, direction: 1, width: 0.021, color: BRAND.color.mistBlue, accent: BRAND.color.silverBlue },
];

export class VoidSceneRenderer {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  readonly vortex: THREE.Group;

  private readonly ribbons: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>[] = [];
  private readonly ribbonGeometries: THREE.BufferGeometry[] = [];
  private readonly ribbonMaterials: THREE.ShaderMaterial[] = [];
  private readonly particleGeometry: THREE.BufferGeometry;
  private readonly particleMaterial: THREE.ShaderMaterial;
  private readonly particleTracks: ParticleTrack[] = [];
  private smoothedBass = 0;
  private smoothedMid = 0;
  private smoothedHigh = 0;
  private smoothedTransient = 0;
  private previousTransient = 0;
  private shockwaveAge = 4;

  constructor() {
    const backgroundMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: new THREE.Vector2(1, 1) },
        u_time: { value: 0 },
        u_bass: { value: 0 },
        u_high: { value: 0 },
        u_energy: { value: 1.1 },
        u_density: { value: 1 },
        u_bassReactivity: { value: 1 },
        u_voidColor: { value: new THREE.Color(BRAND.color.deepBlack) },
        u_silverColor: { value: new THREE.Color(BRAND.color.silverBlue) },
      },
      vertexShader: VOID_SCENE_VERTEX_SHADER,
      fragmentShader: VOID_SCENE_FRAGMENT_SHADER,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), backgroundMaterial);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;

    this.vortex = new THREE.Group();
    this.vortex.position.set(0, 0, -VORTEX_DISTANCE);
    this.vortex.visible = false;

    for (let index = 0; index < RIBBON_PROFILES.length; index++) {
      const profile = RIBBON_PROFILES[index];
      const geometry = createRibbonGeometry();
      const material = createRibbonMaterial(profile);
      const ribbon = new THREE.Mesh(geometry, material);
      ribbon.frustumCulled = false;
      this.vortex.add(ribbon);
      this.ribbons.push(ribbon);
      this.ribbonGeometries.push(geometry);
      this.ribbonMaterials.push(material);
    }

    this.particleGeometry = createParticleGeometry(PARTICLE_COUNT, this.particleTracks);
    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_high: { value: 0 },
        u_density: { value: 1 },
        u_time: { value: 0 },
        u_color: { value: new THREE.Color(BRAND.color.silverBlue) },
        u_accent: { value: new THREE.Color(BRAND.color.mistBlue) },
      },
      vertexShader: PARTICLE_VERTEX_SHADER,
      fragmentShader: PARTICLE_FRAGMENT_SHADER,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      toneMapped: false,
    });
    const particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
    particles.frustumCulled = false;
    this.vortex.add(particles);

    this.updateRibbonGeometry(0, 0, 0, 0, 1);
    this.updateParticlePositions(0, 0, 0, 0, 1);
  }

  resize(width: number, height: number, worldWidth: number, worldHeight: number) {
    this.mesh.material.uniforms.u_resolution.value.set(width, height);
    this.mesh.scale.set(worldWidth, worldHeight, 1);
    const perspectiveScale = (VORTEX_DISTANCE / BACKGROUND_DISTANCE) * 0.72;
    this.vortex.scale.set(
      worldWidth * perspectiveScale,
      worldHeight * perspectiveScale,
      worldHeight * perspectiveScale * 0.22,
    );
  }

  update(
    time: number,
    deltaTime: number,
    bass: number,
    mid: number,
    high: number,
    transient: number,
    energy: number,
    density: number,
    ribbonWeight: number,
    speed: number,
    bassReactivity: number,
  ) {
    const dt = THREE.MathUtils.clamp(deltaTime, 0, 0.1);
    const motionSpeed = THREE.MathUtils.clamp(speed, 0.25, 2);
    const rawTransient = THREE.MathUtils.clamp(transient, 0, 1);
    this.smoothedBass = smoothAudioValue(this.smoothedBass, bass, dt, 5);
    this.smoothedMid = smoothAudioValue(this.smoothedMid, mid, dt, 2.2);
    this.smoothedHigh = smoothAudioValue(this.smoothedHigh, high, dt, 8);
    this.smoothedTransient = smoothAudioValue(
      this.smoothedTransient,
      rawTransient,
      dt,
      rawTransient > this.smoothedTransient ? 15 : 3.5,
    );

    if (rawTransient > 0.12 && rawTransient > this.previousTransient + 0.06) {
      this.shockwaveAge = 0;
    } else {
      this.shockwaveAge = Math.min(4, this.shockwaveAge + dt);
    }
    this.previousTransient = rawTransient;

    const uniforms = this.mesh.material.uniforms;
    uniforms.u_time.value = time * motionSpeed;
    uniforms.u_bass.value = this.smoothedBass;
    uniforms.u_high.value = this.smoothedHigh;
    uniforms.u_energy.value = THREE.MathUtils.clamp(energy, 0.2, 1.6);
    uniforms.u_density.value = THREE.MathUtils.clamp(density, 0.3, 1.5);
    uniforms.u_bassReactivity.value = THREE.MathUtils.clamp(bassReactivity, 0, 2);

    const scaledTime = time * motionSpeed;
    const bassDrive = this.smoothedBass * bassReactivity;
    const normalizedEnergy = THREE.MathUtils.clamp(uniforms.u_energy.value / 1.6, 0, 1.4);
    const normalizedWeight = THREE.MathUtils.clamp(ribbonWeight, 0.5, 1.8);
    this.updateRibbonGeometry(scaledTime, bassDrive, this.smoothedMid, this.smoothedTransient, normalizedWeight);

    for (const material of this.ribbonMaterials) {
      material.uniforms.u_time.value = scaledTime;
      material.uniforms.u_mid.value = this.smoothedMid;
      material.uniforms.u_transient.value = this.smoothedTransient;
      material.uniforms.u_shockwaveAge.value = this.shockwaveAge;
      material.uniforms.u_energy.value = normalizedEnergy;
      material.uniforms.u_weight.value = normalizedWeight;
    }

    this.updateParticlePositions(scaledTime, bassDrive, this.smoothedMid, this.smoothedTransient, normalizedWeight);
    this.particleMaterial.uniforms.u_high.value = this.smoothedHigh;
    this.particleMaterial.uniforms.u_density.value = density;
    this.particleMaterial.uniforms.u_time.value = scaledTime;
  }

  setRenderOrder(renderOrder: number) {
    this.mesh.renderOrder = renderOrder;
    this.vortex.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        object.renderOrder = renderOrder;
      }
    });
  }

  reset() {
    this.smoothedBass = 0;
    this.smoothedMid = 0;
    this.smoothedHigh = 0;
    this.smoothedTransient = 0;
    this.previousTransient = 0;
    this.shockwaveAge = 4;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    for (const geometry of this.ribbonGeometries) geometry.dispose();
    for (const material of this.ribbonMaterials) material.dispose();
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
  }

  private updateRibbonGeometry(time: number, bass: number, mid: number, transient: number, weight: number) {
    const previous = new THREE.Vector3();
    const next = new THREE.Vector3();
    const center = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const side = new THREE.Vector3();
    const viewAxis = new THREE.Vector3(0, 0, 1);

    for (let ribbonIndex = 0; ribbonIndex < RIBBON_PROFILES.length; ribbonIndex++) {
      const profile = RIBBON_PROFILES[ribbonIndex];
      const positions = this.ribbonGeometries[ribbonIndex].getAttribute('position') as THREE.BufferAttribute;
      const step = 1 / RIBBON_SEGMENTS;

      for (let segment = 0; segment <= RIBBON_SEGMENTS; segment++) {
        const t = segment / RIBBON_SEGMENTS;
        const before = Math.max(0, t - step);
        const after = Math.min(1, t + step);
        sampleRibbonPoint(previous, before, profile, time, bass, mid, transient);
        sampleRibbonPoint(next, after, profile, time, bass, mid, transient);
        sampleRibbonPoint(center, t, profile, time, bass, mid, transient);
        tangent.subVectors(next, previous).normalize();
        side.crossVectors(tangent, viewAxis).normalize();
        side.z = Math.sin(t * TAU * profile.turns + profile.phase + time) * 0.28;
        side.normalize();

        const shimmer = 0.86 + 0.14 * Math.sin(t * TAU * 4.0 - time * 2.1 + profile.phase);
        const halfWidth = profile.width * weight * shimmer * (1 + Math.min(1.2, bass) * 0.32 + transient * 0.12);
        const offset = (segment * 2) * 3;
        positions.setXYZ(offset / 3, center.x - side.x * halfWidth, center.y - side.y * halfWidth, center.z - side.z * halfWidth);
        positions.setXYZ(offset / 3 + 1, center.x + side.x * halfWidth, center.y + side.y * halfWidth, center.z + side.z * halfWidth);
      }

      positions.needsUpdate = true;
    }
  }

  private updateParticlePositions(time: number, bass: number, mid: number, transient: number, weight: number) {
    const positions = this.particleGeometry.getAttribute('position') as THREE.BufferAttribute;
    const point = new THREE.Vector3();

    for (let index = 0; index < this.particleTracks.length; index++) {
      const track = this.particleTracks[index];
      const profile = RIBBON_PROFILES[track.profileIndex];
      const t = (track.seed + time * track.speed) % 1;
      sampleRibbonPoint(point, t, profile, time, bass, mid, transient);
      const orbit = track.seed * TAU + time * (0.6 + track.speed);
      const offset = profile.width * weight * (0.5 + bass * 0.25);
      point.x += Math.cos(orbit) * offset;
      point.y += Math.sin(orbit) * offset;
      positions.setXYZ(index, point.x, point.y, point.z);
    }

    positions.needsUpdate = true;
  }
}

function createRibbonGeometry() {
  const vertexCount = (RIBBON_SEGMENTS + 1) * 2;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices: number[] = [];

  for (let segment = 0; segment <= RIBBON_SEGMENTS; segment++) {
    const t = segment / RIBBON_SEGMENTS;
    const vertex = segment * 2;
    uvs[vertex * 2] = t;
    uvs[vertex * 2 + 1] = 0;
    uvs[(vertex + 1) * 2] = t;
    uvs[(vertex + 1) * 2 + 1] = 1;
    if (segment < RIBBON_SEGMENTS) {
      const next = vertex + 2;
      indices.push(vertex, next, vertex + 1, vertex + 1, next, next + 1);
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

function createRibbonMaterial(profile: RibbonProfile) {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0 },
      u_mid: { value: 0 },
      u_transient: { value: 0 },
      u_shockwaveAge: { value: 4 },
      u_energy: { value: 1 },
      u_weight: { value: 1 },
      u_phase: { value: profile.phase },
      u_color: { value: new THREE.Color(profile.color) },
      u_accent: { value: new THREE.Color(profile.accent) },
    },
    vertexShader: RIBBON_VERTEX_SHADER,
    fragmentShader: RIBBON_FRAGMENT_SHADER,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function createParticleGeometry(count: number, tracks: ParticleTrack[]) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);

  for (let index = 0; index < count; index++) {
    const seed = hashSeed(index + 1);
    tracks.push({
      seed,
      profileIndex: index % RIBBON_PROFILES.length,
      speed: 0.045 + hashSeed(index + 809) * 0.085,
    });
    sizes[index] = 3.2 + hashSeed(index + 1701) * 4.2;
    seeds[index] = hashSeed(index + 2801);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  return geometry;
}

function sampleRibbonPoint(
  target: THREE.Vector3,
  t: number,
  profile: RibbonProfile,
  time: number,
  bass: number,
  mid: number,
  transient: number,
) {
  const angle = t * TAU * profile.turns
    + profile.phase
    + time * profile.direction * (0.42 + mid * 0.58)
    + Math.sin(t * TAU * 1.7 + time * 0.42 + profile.phase) * (0.12 + mid * 0.08);
  const radius = (0.055 + 0.63 * Math.pow(t, 0.78))
    * (1 + Math.min(1.5, bass) * 0.12 + transient * 0.035)
    + Math.sin(angle * 2.0 + time * 0.75) * (0.012 + mid * 0.014);
  const depth = (t - 0.5) * 1.02
    + Math.sin(angle * 0.62 + profile.phase + time * 0.34) * (0.19 + mid * 0.045);
  return target.set(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius * 0.82,
    depth,
  );
}

function hashSeed(value: number) {
  const seed = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return seed - Math.floor(seed);
}

function smoothAudioValue(current: number, target: number, deltaTime: number, rate: number) {
  const amount = 1 - Math.exp(-deltaTime * rate);
  return THREE.MathUtils.lerp(current, THREE.MathUtils.clamp(target, 0, 1), amount);
}

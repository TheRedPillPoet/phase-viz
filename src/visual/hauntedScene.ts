import * as THREE from 'three';
import { BRAND } from '../brand/tokens';

const HAUNTED_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const HAUNTED_FRAGMENT_SHADER = `
  uniform sampler2D u_scene;
  uniform sampler2D u_previous;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_bass;
  uniform float u_mid;
  uniform float u_high;
  uniform float u_transient;
  uniform float u_shockwaveAge;
  uniform float u_hasPrevious;
  uniform float u_wispIntensity;
  uniform float u_spectralBrightness;
  uniform float u_audioReactivity;
  uniform float u_trailPersistence;
  uniform vec3 u_spectralColor;
  uniform vec3 u_ghostColor;
  uniform vec3 u_crimsonColor;
  varying vec2 vUv;

  float hash(vec2 value) {
    return fract(sin(dot(value, vec2(127.1, 311.7))) * 43758.5453123);
  }

  vec2 rotatePoint(vec2 point, float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return mat2(cosine, -sine, sine, cosine) * point;
  }

  vec3 wispLayer(vec2 point, float angle, float phase, float time, float mid) {
    vec2 q = rotatePoint(point, angle);
    float curl = 0.145 * sin(q.x * 2.8 + time * (0.34 + mid * 0.35) + phase)
      + 0.042 * sin(q.x * 10.5 - time * 0.62 + phase * 2.4)
      + 0.035 * sin(time * 0.23 + phase * 3.1);
    float distanceToWisp = abs(q.y - curl);
    float lengthFade = 1.0 - smoothstep(0.38, 0.95, abs(q.x));
    float dissolve = 0.28 + 0.72 * (0.5 + 0.5 * sin(time * 0.2 + phase * 4.0 + q.x * 1.8));
    float undulation = 0.72 + 0.28 * sin(q.x * 13.0 - time * (1.1 + mid * 1.4) + phase * 2.0);
    float halo = exp(-distanceToWisp * (17.0 + mid * 5.0));
    float core = exp(-distanceToWisp * 72.0);
    vec3 tint = mix(u_spectralColor, u_ghostColor, 0.22 + 0.18 * sin(time * 0.18 + phase));
    tint = mix(tint, vec3(0.88, 0.93, 1.0), core * 0.72);
    return tint * (halo * 0.58 + core * 0.95) * lengthFade * dissolve * undulation;
  }

  float apparition(vec2 point, vec2 center, float size, float phase, float time) {
    vec2 q = (point - center) / size;
    float angle = atan(q.y, q.x);
    float radius = length(q * vec2(0.78, 1.12));
    float edge = 0.43 + 0.045 * sin(angle * 3.0 + time * 0.28 + phase)
      + 0.025 * sin(angle * 7.0 - time * 0.19 + phase * 2.0);
    float arcs = 0.45 + 0.55 * smoothstep(-0.2, 0.45, sin(angle * 2.0 + phase));
    float contour = exp(-abs(radius - edge) * 42.0) * arcs;
    float mist = exp(-radius * 3.6) * 0.1;
    float emergence = pow(0.5 + 0.5 * sin(time * 0.16 + phase), 5.0);
    return (contour * 0.48 + mist) * emergence;
  }

  void main() {
    vec2 resolution = max(u_resolution, vec2(1.0));
    vec2 centered = (vUv - 0.5) * vec2(resolution.x / resolution.y, 1.0);
    float radius = length(centered);
    float bass = clamp(u_bass * u_audioReactivity, 0.0, 2.0);
    float mid = clamp(u_mid * u_audioReactivity, 0.0, 2.0);
    float high = clamp(u_high * u_audioReactivity, 0.0, 2.0);
    float transient = clamp(u_transient * u_audioReactivity, 0.0, 2.0);
    float shockAge = min(u_shockwaveAge, 3.5);
    float shockRadius = 0.045 + shockAge * 0.22;
    float shockEnvelope = exp(-shockAge * 0.72);
    float shockwave = exp(-abs(radius - shockRadius) * 74.0)
      * shockEnvelope * (0.16 + transient * 0.84);
    float travelingDisturbance = sin(radius * 44.0 - u_time * (2.1 + mid * 1.1) - shockAge * 2.4)
      * exp(-radius * 2.4) * (0.0007 + bass * 0.0015 + transient * 0.0022);
    float distortion = (0.0012 + bass * 0.0045) * exp(-radius * 2.1)
      + travelingDisturbance + shockwave * 0.002;
    vec2 distortedUv = clamp(vUv + centered * distortion, vec2(0.001), vec2(0.999));
    vec3 scene = texture2D(u_scene, distortedUv).rgb;
    vec3 color = scene * (0.78 + u_spectralBrightness * 0.22);

    vec3 wisps = wispLayer(centered, 0.18, 0.4, u_time, mid)
      + wispLayer(centered, 1.33, 1.7, u_time * 0.91, mid)
      + wispLayer(centered, -0.62, 2.9, u_time * 1.08, mid)
      + wispLayer(centered, 2.62, 4.2, u_time * 0.84, mid) * 0.82;
    float wispDrive = u_wispIntensity * u_spectralBrightness
      * (0.74 + bass * 0.28 + mid * 0.24 + transient * 0.12);
    color += wisps * wispDrive;
    color += u_spectralColor * shockwave * (0.22 + u_wispIntensity * 0.32);
    color += u_crimsonColor * shockwave * (0.018 + transient * 0.045);

    float apparitionA = apparition(
      centered,
      vec2(-0.19 * resolution.x / resolution.y + sin(u_time * 0.14) * 0.06, 0.08 + sin(u_time * 0.2) * 0.09),
      0.19,
      0.8,
      u_time
    );
    float apparitionB = apparition(
      centered,
      vec2(0.2 * resolution.x / resolution.y + sin(u_time * 0.12 + 2.0) * 0.05, -0.12 + sin(u_time * 0.17 + 3.0) * 0.07),
      0.16,
      3.1,
      u_time * 0.92
    );
    color += u_ghostColor * (apparitionA + apparitionB) * u_spectralBrightness * 0.34;

    vec2 previousUv = clamp(vUv - centered * (0.0009 + bass * 0.002), vec2(0.002), vec2(0.998));
    vec3 previous = texture2D(u_previous, previousUv).rgb;
    float previousLuma = dot(previous, vec3(0.299, 0.587, 0.114));
    float trailMask = smoothstep(0.018, 0.22, previousLuma) * u_hasPrevious;
    vec3 trailTint = mix(previous, u_ghostColor * (0.3 + previousLuma), 0.28);
    color += trailTint * trailMask * u_trailPersistence * (0.52 + bass * 0.12);

    float sparkle = step(0.996, hash(floor(vUv * resolution * 0.3) + floor(u_time * 13.0)));
    color += u_spectralColor * sparkle * high * 0.12;
    float grain = hash(floor(vUv * resolution) + floor(u_time * 18.0));
    color += (grain - 0.5) * (0.002 + high * 0.003);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export class HauntedSceneRenderer {
  private readonly material: THREE.ShaderMaterial;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private readonly copyMaterial = new THREE.MeshBasicMaterial({ depthTest: false, depthWrite: false });
  private readonly copyQuad: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private readonly copyScene = new THREE.Scene();
  private readonly history: THREE.WebGLRenderTarget;
  private readonly output: THREE.WebGLRenderTarget;
  private historyValid = false;
  private previousTime = 0;
  private smoothedBass = 0;
  private smoothedMid = 0;
  private smoothedHigh = 0;
  private smoothedTransient = 0;
  private previousTransient = 0;
  private shockwaveAge = 4;

  constructor(width: number, height: number) {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_scene: { value: null },
        u_previous: { value: null },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_time: { value: 0 },
        u_bass: { value: 0 },
        u_mid: { value: 0 },
        u_high: { value: 0 },
        u_transient: { value: 0 },
        u_shockwaveAge: { value: 4 },
        u_hasPrevious: { value: 0 },
        u_wispIntensity: { value: 1.15 },
        u_spectralBrightness: { value: 1.1 },
        u_audioReactivity: { value: 1 },
        u_trailPersistence: { value: 0.22 },
        u_spectralColor: { value: new THREE.Color(BRAND.color.silverBlue) },
        u_ghostColor: { value: new THREE.Color(BRAND.color.mistBlue) },
        u_crimsonColor: { value: new THREE.Color(BRAND.color.crimsonLight) },
      },
      vertexShader: HAUNTED_VERTEX_SHADER,
      fragmentShader: HAUNTED_FRAGMENT_SHADER,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.scene.add(this.quad);
    this.copyQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.copyMaterial);
    this.copyScene.add(this.copyQuad);
    this.history = new THREE.WebGLRenderTarget(width, height, { depthBuffer: false, stencilBuffer: false });
    this.output = new THREE.WebGLRenderTarget(width, height, { depthBuffer: false, stencilBuffer: false });
  }

  resize(width: number, height: number) {
    this.history.setSize(width, height);
    this.output.setSize(width, height);
    this.material.uniforms.u_resolution.value.set(width, height);
    this.historyValid = false;
  }

  render(
    renderer: THREE.WebGLRenderer,
    source: THREE.Texture,
    time: number,
    bass: number,
    mid: number,
    high: number,
    transient: number,
    wispIntensity: number,
    spectralBrightness: number,
    audioReactivity: number,
    trailPersistence: number,
  ) {
    const dt = THREE.MathUtils.clamp(time - this.previousTime, 0, 0.1);
    const rawTransient = THREE.MathUtils.clamp(transient, 0, 1);
    this.previousTime = time;
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

    const uniforms = this.material.uniforms;
    uniforms.u_scene.value = source;
    uniforms.u_previous.value = this.history.texture;
    uniforms.u_time.value = time;
    uniforms.u_bass.value = this.smoothedBass;
    uniforms.u_mid.value = this.smoothedMid;
    uniforms.u_high.value = this.smoothedHigh;
    uniforms.u_transient.value = this.smoothedTransient;
    uniforms.u_shockwaveAge.value = this.shockwaveAge;
    uniforms.u_hasPrevious.value = this.historyValid ? 1 : 0;
    uniforms.u_wispIntensity.value = THREE.MathUtils.clamp(wispIntensity, 0, 2);
    uniforms.u_spectralBrightness.value = THREE.MathUtils.clamp(spectralBrightness, 0.5, 1.8);
    uniforms.u_audioReactivity.value = THREE.MathUtils.clamp(audioReactivity, 0, 2);
    uniforms.u_trailPersistence.value = THREE.MathUtils.clamp(trailPersistence, 0, 0.7);

    renderer.setRenderTarget(this.output);
    renderer.render(this.scene, this.camera);

    this.copyMaterial.map = this.output.texture;
    this.copyMaterial.needsUpdate = true;
    renderer.setRenderTarget(this.history);
    renderer.render(this.copyScene, this.camera);

    renderer.setRenderTarget(null);
    renderer.render(this.copyScene, this.camera);
    this.historyValid = true;
  }

  reset() {
    this.historyValid = false;
    this.previousTime = 0;
    this.smoothedBass = 0;
    this.smoothedMid = 0;
    this.smoothedHigh = 0;
    this.smoothedTransient = 0;
    this.previousTransient = 0;
    this.shockwaveAge = 4;
  }

  dispose() {
    this.history.dispose();
    this.output.dispose();
    this.material.dispose();
    this.quad.geometry.dispose();
    this.copyMaterial.dispose();
    this.copyQuad.geometry.dispose();
  }
}

function smoothAudioValue(current: number, target: number, deltaTime: number, rate: number) {
  const amount = 1 - Math.exp(-deltaTime * rate);
  return THREE.MathUtils.lerp(current, THREE.MathUtils.clamp(target, 0, 1), amount);
}

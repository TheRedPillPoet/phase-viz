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
  uniform float u_hasPrevious;
  uniform float u_grainOpacity;
  uniform float u_chromaticAberration;
  uniform float u_trailDecay;
  uniform vec3 u_spectralColor;
  uniform vec3 u_ghostColor;
  varying vec2 vUv;

  float hash(vec2 value) {
    return fract(sin(dot(value, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 resolution = max(u_resolution, vec2(1.0));
    vec2 centered = vUv - 0.5;
    float bass = clamp(u_bass, 0.0, 1.0);
    float radius = length(centered);
    float focalDistortion = bass * 0.0035 * exp(-radius * 4.0);
    vec2 distortedUv = vUv + centered * focalDistortion;

    float aberration = u_chromaticAberration * (1.0 + bass * 2.142857);
    vec2 aberrationOffset = normalize(centered + vec2(0.00001)) * aberration;
    vec4 scene = texture2D(u_scene, distortedUv);
    scene.r = texture2D(u_scene, distortedUv + aberrationOffset).r;
    scene.b = texture2D(u_scene, distortedUv - aberrationOffset).b;

    vec2 previousUv = clamp(vUv - centered * (0.0015 + bass * 0.0025), vec2(0.002), vec2(0.998));
    vec3 previous = texture2D(u_previous, previousUv).rgb;
    float previousLuma = dot(previous, vec3(0.299, 0.587, 0.114));
    float ghostMask = smoothstep(0.16, 0.52, previousLuma) * u_hasPrevious;
    float ghostStrength = ghostMask * min(0.85, u_trailDecay + bass * 0.22);
    vec3 ghost = mix(previous, u_ghostColor, 0.18 + bass * 0.22);
    vec3 color = mix(scene.rgb, ghost, ghostStrength);

    float grain = hash(floor(vUv * resolution) + floor(u_time * 24.0));
    float grainAmount = (grain - 0.5) * u_grainOpacity * (1.0 + bass * 0.5);
    color += grainAmount;

    float vignette = 1.0 - smoothstep(0.2, 0.82, radius);
    color *= 0.48 + vignette * 0.52;
    color += u_spectralColor * ghostMask * bass * 0.025;
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

  constructor(width: number, height: number) {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_scene: { value: null },
        u_previous: { value: null },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_time: { value: 0 },
        u_bass: { value: 0 },
        u_hasPrevious: { value: 0 },
        u_grainOpacity: { value: 0.1 },
        u_chromaticAberration: { value: 0.0007 },
        u_trailDecay: { value: 0.22 },
        u_spectralColor: { value: new THREE.Color(BRAND.color.mistBlue) },
        u_ghostColor: { value: new THREE.Color(BRAND.color.crimson) },
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
    grainOpacity: number,
    chromaticAberration: number,
    trailDecay: number,
  ) {
    const uniforms = this.material.uniforms;
    uniforms.u_scene.value = source;
    uniforms.u_previous.value = this.history.texture;
    uniforms.u_time.value = time;
    uniforms.u_bass.value = THREE.MathUtils.clamp(bass, 0, 1);
    uniforms.u_grainOpacity.value = THREE.MathUtils.clamp(grainOpacity, 0, 0.3);
    uniforms.u_chromaticAberration.value = THREE.MathUtils.clamp(chromaticAberration, 0, 0.004);
    uniforms.u_trailDecay.value = THREE.MathUtils.clamp(trailDecay, 0, 0.85);
    uniforms.u_hasPrevious.value = this.historyValid ? 1 : 0;

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

import * as THREE from 'three';
import { BRAND } from '../brand/tokens';

const AWAKENING_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const AWAKENING_FRAGMENT_SHADER = `
  uniform sampler2D u_scene;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_bass;
  uniform float u_high;
  uniform float u_lightLeakIntensity;
  uniform float u_rayDensity;
  uniform float u_expansionScale;
  uniform vec3 u_lightColor;
  uniform vec3 u_accentColor;
  varying vec2 vUv;

  void main() {
    vec2 centered = vUv - vec2(0.5, 0.48);
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    centered.x *= aspect;
    float radius = length(centered);
    float angle = atan(centered.y, centered.x);
    float bass = clamp(u_bass, 0.0, 1.0);
    float high = clamp(u_high, 0.0, 1.0);

    float expansionScale = clamp(u_expansionScale, 0.5, 1.8);
    float coreRadius = (0.075 + bass * 0.025) * expansionScale;
    float coreEdge = 1.0 - smoothstep(coreRadius, coreRadius + 0.012, radius);
    float ringRadius = (0.2 + bass * 0.045 + sin(u_time * 0.7) * 0.006) * expansionScale;
    float polygonRingRadius = ringRadius + cos(angle * 6.0 + u_time * 0.08) * 0.012;
    float ringDistance = abs(radius - polygonRingRadius);
    float ring = 1.0 - smoothstep(0.0025, 0.008 + high * 0.004, ringDistance);
    float outerRadius = ringRadius + (0.07 + bass * 0.025) * expansionScale;
    float outerRing = 1.0 - smoothstep(0.0015, 0.006, abs(radius - outerRadius));
    float coreHalo = exp(-abs(radius - coreRadius) * 24.0) * (0.07 + bass * 0.12);

    float rayPattern = pow(max(0.0, cos(angle * u_rayDensity + u_time * (0.7 + high * 1.8))), 20.0);
    float rays = rayPattern * exp(-radius * 2.8) * (0.035 + high * 0.16);
    float shimmerPattern = pow(max(0.0, cos(angle * 37.0 - u_time * 1.2)), 30.0);
    float shimmer = shimmerPattern * exp(-radius * 4.2) * high * 0.12;
    float lightLeak = exp(-length(centered - vec2(-0.2, 0.24)) * 7.0)
      * u_lightLeakIntensity * (1.0 + high * 2.2857);

    vec4 scene = texture2D(u_scene, vUv);
    vec3 light = u_lightColor * (
      rays + shimmer + ring * (0.12 + high * 0.2) + outerRing * 0.055
      + coreEdge * (0.45 + bass * 0.35) + coreHalo + lightLeak
    );
    light += u_accentColor * (ring * 0.06 + lightLeak * 0.18);
    vec3 color = scene.rgb + light;
    color += u_lightColor * coreEdge * 0.35;

    gl_FragColor = vec4(color, scene.a);
  }
`;

export class AwakeningSceneRenderer {
  private readonly material: THREE.ShaderMaterial;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  constructor() {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_scene: { value: null },
        u_resolution: { value: new THREE.Vector2(1, 1) },
        u_time: { value: 0 },
        u_bass: { value: 0 },
        u_high: { value: 0 },
        u_lightLeakIntensity: { value: 0.06 },
        u_rayDensity: { value: 19 },
        u_expansionScale: { value: 1 },
        u_lightColor: { value: new THREE.Color(BRAND.color.silverBlue) },
        u_accentColor: { value: new THREE.Color(BRAND.color.crimsonLight) },
      },
      vertexShader: AWAKENING_VERTEX_SHADER,
      fragmentShader: AWAKENING_FRAGMENT_SHADER,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.scene.add(this.quad);
  }

  resize(width: number, height: number) {
    this.material.uniforms.u_resolution.value.set(width, height);
  }

  render(
    renderer: THREE.WebGLRenderer,
    source: THREE.Texture,
    time: number,
    bass: number,
    high: number,
    lightLeakIntensity: number,
    rayDensity: number,
    expansionScale: number,
  ) {
    const uniforms = this.material.uniforms;
    uniforms.u_scene.value = source;
    uniforms.u_time.value = time;
    uniforms.u_bass.value = THREE.MathUtils.clamp(bass, 0, 1);
    uniforms.u_high.value = THREE.MathUtils.clamp(high, 0, 1);
    uniforms.u_lightLeakIntensity.value = THREE.MathUtils.clamp(lightLeakIntensity, 0, 0.3);
    uniforms.u_rayDensity.value = THREE.MathUtils.clamp(rayDensity, 6, 48);
    uniforms.u_expansionScale.value = THREE.MathUtils.clamp(expansionScale, 0.5, 1.8);
    renderer.setRenderTarget(null);
    renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.material.dispose();
    this.quad.geometry.dispose();
  }
}

import * as THREE from 'three';
import { BRAND } from '../brand/tokens';

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
  uniform float u_reactivity;
  uniform float u_midHighEnergy;
  uniform float u_horizonGlow;
  uniform float u_ringVisibility;
  uniform float u_fovPulse;
  uniform vec3 u_voidColor;
  uniform vec3 u_lineColor;
  varying vec2 vUv;

  float segmentDistance(vec2 point, vec2 start, vec2 end) {
    vec2 segment = end - start;
    float lengthSquared = max(dot(segment, segment), 0.00001);
    float projection = clamp(dot(point - start, segment) / lengthSquared, 0.0, 1.0);
    return length(point - (start + segment * projection));
  }

  float lineMask(float distanceToLine, float width, float sharpness) {
    return 1.0 - smoothstep(width, width + sharpness, distanceToLine);
  }

  void main() {
    vec2 resolution = max(u_resolution, vec2(1.0));
    float aspect = resolution.x / resolution.y;
    vec2 point = (vUv - 0.5) * vec2(aspect, 1.0);
    float energy = clamp(u_midHighEnergy, 0.0, 1.0);
    float reactivity = clamp(u_reactivity, 0.0, 1.0);
    float fieldScale = 1.0 + u_fovPulse
      * (energy * (0.667 + sin(u_time * 0.55) * 0.333) + reactivity * 0.667);
    point *= fieldScale;

    float horizonY = -0.245 + sin(u_time * 0.18) * 0.002;
    float horizonDistance = abs(point.y - horizonY);
    float horizonGlow = exp(-horizonDistance * 34.0) * u_horizonGlow * (1.0 + energy * 0.65);
    float horizonLine = lineMask(horizonDistance, 0.00075, 0.0008 + energy * 0.0005);

    float focalSize = min(aspect, 1.0) * 0.19;
    vec2 focal = point - vec2(0.0, 0.045);
    vec2 rearOffset = vec2(focalSize * 0.22, focalSize * 0.18);
    vec2 frontTop = vec2(0.0, focalSize);
    vec2 frontRight = vec2(focalSize * 0.72, 0.0);
    vec2 frontBottom = vec2(0.0, -focalSize);
    vec2 frontLeft = vec2(-focalSize * 0.72, 0.0);
    vec2 rearTop = frontTop + rearOffset;
    vec2 rearRight = frontRight + rearOffset;
    vec2 rearBottom = frontBottom + rearOffset;
    vec2 rearLeft = frontLeft + rearOffset;

    float edgeDistance = 1.0;
    edgeDistance = min(edgeDistance, segmentDistance(focal, frontTop, frontRight));
    edgeDistance = min(edgeDistance, segmentDistance(focal, frontRight, frontBottom));
    edgeDistance = min(edgeDistance, segmentDistance(focal, frontBottom, frontLeft));
    edgeDistance = min(edgeDistance, segmentDistance(focal, frontLeft, frontTop));
    edgeDistance = min(edgeDistance, segmentDistance(focal, rearTop, rearRight));
    edgeDistance = min(edgeDistance, segmentDistance(focal, rearRight, rearBottom));
    edgeDistance = min(edgeDistance, segmentDistance(focal, rearBottom, rearLeft));
    edgeDistance = min(edgeDistance, segmentDistance(focal, rearLeft, rearTop));
    edgeDistance = min(edgeDistance, segmentDistance(focal, frontTop, rearTop));
    edgeDistance = min(edgeDistance, segmentDistance(focal, frontRight, rearRight));
    edgeDistance = min(edgeDistance, segmentDistance(focal, frontBottom, rearBottom));
    edgeDistance = min(edgeDistance, segmentDistance(focal, frontLeft, rearLeft));

    float edgeSharpness = mix(0.0028, 0.0012, energy);
    float geometry = lineMask(edgeDistance, 0.0016, edgeSharpness);
    float focalGlow = exp(-edgeDistance * 42.0) * geometry * (0.08 + energy * 0.16);

    float ringRadius = focalSize * 1.65;
    float ringDistance = abs(length(focal) - ringRadius);
    float ring = lineMask(ringDistance, 0.0009, edgeSharpness * 1.4);
    float ringGlow = exp(-ringDistance * 28.0) * (0.035 + energy * 0.07);

    float vignette = 1.0 - smoothstep(0.18, 0.95, length(point * vec2(0.9, 1.1)));
    float atmosphere = exp(-horizonDistance * 5.2) * vignette * 0.018;
    float lineIntensity = 0.72 + reactivity * 0.24 + energy * 0.12;
    vec3 color = u_voidColor * (0.88 + atmosphere + horizonGlow);
    color += u_lineColor * atmosphere * 0.12;
    color += u_lineColor * (horizonLine * lineIntensity + horizonGlow * 0.35);
    color += u_lineColor * (geometry * lineIntensity + focalGlow);
    color += u_lineColor * (ring * (0.32 + energy * 0.28) + ringGlow) * u_ringVisibility;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export class VoidSceneRenderer {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  constructor() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: new THREE.Vector2(1, 1) },
        u_time: { value: 0 },
        u_reactivity: { value: 0 },
        u_midHighEnergy: { value: 0 },
        u_horizonGlow: { value: 0.12 },
        u_ringVisibility: { value: 1 },
        u_fovPulse: { value: 0.018 },
        u_voidColor: { value: new THREE.Color(BRAND.color.deepBlack) },
        u_lineColor: { value: new THREE.Color(BRAND.color.silverBlue) },
      },
      vertexShader: VOID_SCENE_VERTEX_SHADER,
      fragmentShader: VOID_SCENE_FRAGMENT_SHADER,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
  }

  resize(width: number, height: number, worldWidth: number, worldHeight: number) {
    this.mesh.material.uniforms.u_resolution.value.set(width, height);
    this.mesh.scale.set(worldWidth, worldHeight, 1);
  }

  update(
    time: number,
    bass: number,
    midHighEnergy: number,
    horizonGlow: number,
    ringVisibility: number,
    fovPulse: number,
  ) {
    const uniforms = this.mesh.material.uniforms;
    uniforms.u_time.value = time;
    uniforms.u_reactivity.value = THREE.MathUtils.clamp(bass, 0, 1);
    uniforms.u_midHighEnergy.value = THREE.MathUtils.clamp(midHighEnergy, 0, 1);
    uniforms.u_horizonGlow.value = THREE.MathUtils.clamp(horizonGlow, 0, 0.5);
    uniforms.u_ringVisibility.value = THREE.MathUtils.clamp(ringVisibility, 0, 1);
    uniforms.u_fovPulse.value = THREE.MathUtils.clamp(fovPulse, 0, 0.08);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

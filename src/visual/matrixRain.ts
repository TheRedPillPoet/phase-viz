import * as THREE from 'three';
import { BRAND } from '../brand/tokens';

const MATRIX_RAIN_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const MATRIX_RAIN_FRAGMENT_SHADER = `
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_speed;
  uniform float u_density;
  uniform vec3 u_rainColor;
  uniform vec3 u_backgroundColor;
  uniform float u_reactivity;
  varying vec2 vUv;

  float hash(vec2 value) {
    return fract(sin(dot(value, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float verticalStroke(float x, float column) {
    return 1.0 - step(0.55, abs(x - column));
  }

  float horizontalStroke(float y, float row) {
    return 1.0 - step(0.55, abs(y - row));
  }

  float glyphMask(vec2 cell, vec2 local) {
    vec2 pixel = floor(local * vec2(5.0, 7.0));
    float x = pixel.x;
    float y = pixel.y;
    float left = verticalStroke(x, 0.0);
    float center = verticalStroke(x, 2.0);
    float right = verticalStroke(x, 4.0);
    float top = horizontalStroke(y, 0.0);
    float middle = horizontalStroke(y, 3.0);
    float bottom = horizontalStroke(y, 6.0);
    float diagonalDown = 1.0 - step(0.75, abs(x - y * (4.0 / 6.0)));
    float diagonalUp = 1.0 - step(0.75, abs(x - (4.0 - y * (4.0 / 6.0))));
    float glyphId = floor(hash(cell + vec2(19.17, 7.31)) * 8.0);

    float glyph = 0.0;
    float hGlyph = max(max(left, right), middle);
    float iGlyph = max(center, max(top, bottom));
    float xGlyph = max(diagonalDown, diagonalUp);
    float tGlyph = max(top, center);
    float oGlyph = max(max(left, right), max(top, bottom));
    float lGlyph = max(left, bottom);
    float zGlyph = max(max(top, bottom), diagonalUp);
    float plusGlyph = max(center, middle);
    glyph = max(glyph, hGlyph * (1.0 - step(0.5, glyphId)));
    glyph = max(glyph, iGlyph * step(0.5, glyphId) * (1.0 - step(1.5, glyphId)));
    glyph = max(glyph, xGlyph * step(1.5, glyphId) * (1.0 - step(2.5, glyphId)));
    glyph = max(glyph, tGlyph * step(2.5, glyphId) * (1.0 - step(3.5, glyphId)));
    glyph = max(glyph, oGlyph * step(3.5, glyphId) * (1.0 - step(4.5, glyphId)));
    glyph = max(glyph, lGlyph * step(4.5, glyphId) * (1.0 - step(5.5, glyphId)));
    glyph = max(glyph, zGlyph * step(5.5, glyphId) * (1.0 - step(6.5, glyphId)));
    glyph = max(glyph, plusGlyph * step(6.5, glyphId));

    float interior = step(0.06, local.x) * step(local.x, 0.94)
      * step(0.04, local.y) * step(local.y, 0.96);
    float cellVariation = step(0.22, hash(cell + vec2(41.3, 8.7)));
    return glyph * interior * cellVariation;
  }

  void main() {
    vec2 resolution = max(u_resolution, vec2(1.0));
    float columnCount = max(1.0, u_density * resolution.x / 1080.0);
    float columnWidth = resolution.x / columnCount;
    float rowHeight = columnWidth * 1.5;
    vec2 pixel = vec2(vUv.x * resolution.x, (1.0 - vUv.y) * resolution.y);
    vec2 cellSize = vec2(columnWidth, rowHeight);
    vec2 cell = floor(pixel / cellSize);
    vec2 local = fract(pixel / cellSize);

    float rows = ceil(resolution.y / rowHeight);
    float tailLength = clamp(rows * 0.34, 16.0, 38.0);
    float cycleLength = rows + tailLength;
    float columnSeed = hash(vec2(cell.x, 4.73));
    float columnSpeed = mix(0.68, 1.52, hash(vec2(cell.x, 12.91)));
    float columnTail = mix(tailLength * 0.58, tailLength, hash(vec2(cell.x, 29.3)));
    float audioPulse = clamp(u_reactivity, 0.0, 2.0);
    float headRow = mod(
      u_time * u_speed * columnSpeed * (1.0 + audioPulse * 0.32)
        + columnSeed * cycleLength,
      cycleLength
    );
    float distanceBehindHead = mod(headRow - cell.y + cycleLength, cycleLength);
    float trailMask = 1.0 - smoothstep(columnTail - 1.0, columnTail, distanceBehindHead);
    float trailFade = exp(-distanceBehindHead / max(columnTail * 0.38, 1.0)) * trailMask;
    float headGlow = exp(-distanceBehindHead * 2.0);
    float glyph = glyphMask(cell, local);

    float subtleColumnGlow = exp(-abs(local.x - 0.5) * 8.0) * trailFade * 0.045;
    float brightness = glyph * (trailFade * 1.05 + headGlow * 1.4)
      + subtleColumnGlow;
    brightness *= 0.82 + audioPulse * 0.16;

    vec3 headColor = mix(u_rainColor, vec3(0.88, 1.0, 0.93), 0.68);
    vec3 color = u_backgroundColor + u_rainColor * brightness;
    color += headColor * glyph * headGlow * 0.58;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export class MatrixRainRenderer {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  constructor() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: new THREE.Vector2(1, 1) },
        u_time: { value: 0 },
        u_speed: { value: 1.8 },
        u_density: { value: 92 },
        u_rainColor: { value: new THREE.Color(BRAND.color.digitalGreen) },
        u_backgroundColor: { value: new THREE.Color(BRAND.color.deepBlack) },
        u_reactivity: { value: 0 },
      },
      vertexShader: MATRIX_RAIN_VERTEX_SHADER,
      fragmentShader: MATRIX_RAIN_FRAGMENT_SHADER,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
  }

  resize(width: number, height: number) {
    this.mesh.material.uniforms.u_resolution.value.set(width, height);
  }

  update(time: number, bass: number, density: number, speed: number, reactivity: number) {
    const uniforms = this.mesh.material.uniforms;
    uniforms.u_time.value = time;
    uniforms.u_density.value = THREE.MathUtils.clamp(density, 30, 180);
    uniforms.u_speed.value = THREE.MathUtils.clamp(speed, 0.2, 4);
    uniforms.u_reactivity.value = THREE.MathUtils.clamp(bass * reactivity, 0, 2);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

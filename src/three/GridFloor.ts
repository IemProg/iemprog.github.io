import * as THREE from 'three';

// ─── Vertex Shader ────────────────────────────────────────────────────────────
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ─── Fragment Shader ──────────────────────────────────────────────────────────
const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uVanishX;  // 0..1 x-shift of vanishing point
  uniform vec3  uColor;

  varying vec2 vUv;

  float gridLine(vec2 uv, float scale, float width) {
    vec2 g  = abs(fract(uv * scale) - 0.5);
    vec2 dg = fwidth(uv * scale);
    vec2 aa = smoothstep(dg * (width - 0.5), dg * (width + 0.5), g);
    return 1.0 - min(aa.x, aa.y);
  }

  void main() {
    // Scroll the grid toward the viewer
    vec2 animUv = vUv;
    animUv.y = fract(animUv.y + uTime * 0.045);

    // Perspective: near (vUv.y = 0) = close, far (vUv.y = 1) = horizon
    float perspFactor = 1.0 - vUv.y;
    perspFactor = clamp(perspFactor, 0.02, 1.0);

    float scale = 14.0 * perspFactor;
    float width = 1.2;

    float g = gridLine(animUv, scale, width);

    // Fade toward horizon and edges
    float horizFade = pow(vUv.y, 0.6);
    float edgeFade  = 1.0 - abs(vUv.x - (0.5 + uVanishX * 0.12)) * 2.0;
    edgeFade = clamp(edgeFade, 0.0, 1.0);
    edgeFade = pow(edgeFade, 0.5);

    float alpha = g * horizFade * edgeFade * 0.055;
    if (alpha < 0.002) discard;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────

export class GridFloor {
  public readonly mesh: THREE.Mesh;
  private readonly material: THREE.ShaderMaterial;

  constructor(scene: THREE.Scene) {
    const geometry = new THREE.PlaneGeometry(2000, 1400, 1, 1);

    this.material = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime:     { value: 0 },
        uVanishX:  { value: 0 },
        uColor:    { value: new THREE.Color('#00D4FF') },
      },
      transparent: true,
      depthWrite:  false,
      side:        THREE.DoubleSide,
      // fwidth() is built-in in WebGL2 (Three.js r159+) — no extension pragma needed
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.set(0, -90, -100);
    scene.add(this.mesh);
  }

  update(time: number, mouseNDCX: number): void {
    this.material.uniforms['uTime'].value    = time;
    this.material.uniforms['uVanishX'].value = mouseNDCX;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

import * as THREE from 'three';
import { rng } from '../utils/math';

// ─── Vertex Shader ───────────────────────────────────────────────────────────
const VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uMouseRadius;
  uniform float uMouseStrength;

  attribute float aSize;
  attribute float aPhase;
  attribute vec2  aDrift;   // drift speed x, y
  attribute float aSpeed;   // drift speed magnitude

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // GPU-animated drift
    pos.x += sin(uTime * aDrift.x + aPhase)        * 90.0;
    pos.y += cos(uTime * aDrift.y + aPhase * 1.37) * 70.0;

    // Mouse repulsion in world-space XY
    vec2 diff = pos.xy - uMouse;
    float dist = length(diff);
    if (dist < uMouseRadius && dist > 0.001) {
      float force = pow(1.0 - dist / uMouseRadius, 1.8);
      pos.xy += normalize(diff) * force * uMouseStrength;
    }

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (280.0 / -mvPos.z);
    gl_Position  = projectionMatrix * mvPos;

    // Fade with depth
    float depthFade = clamp(1.0 + mvPos.z / 200.0, 0.2, 1.0);
    vAlpha = depthFade;
  }
`;

// ─── Fragment Shader ─────────────────────────────────────────────────────────
const FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d     = length(gl_PointCoord - vec2(0.5));
    float alpha = 1.0 - smoothstep(0.0, 0.5, d);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha * vAlpha * 0.82);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────

export class ParticleSystem {
  public readonly mesh: THREE.Points;
  private readonly material: THREE.ShaderMaterial;

  constructor(scene: THREE.Scene, count: number = 2800) {
    const positions = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);
    const phases    = new Float32Array(count);
    const drifts    = new Float32Array(count * 2);
    const speeds    = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = rng(-600, 600);
      positions[i * 3 + 1] = rng(-350, 350);
      positions[i * 3 + 2] = rng(-200, 50);

      sizes[i]          = rng(0.8, 3.2);
      phases[i]         = rng(0, Math.PI * 2);
      drifts[i * 2 + 0] = rng(0.04, 0.18);
      drifts[i * 2 + 1] = rng(0.04, 0.18);
      speeds[i]         = rng(0.6, 1.4);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',  new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize',     new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase',    new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aDrift',    new THREE.BufferAttribute(drifts, 2));
    geometry.setAttribute('aSpeed',    new THREE.BufferAttribute(speeds, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime:         { value: 0 },
        uMouse:        { value: new THREE.Vector2(-9999, -9999) },
        uMouseRadius:  { value: 180 },
        uMouseStrength:{ value: 60 },
        uColor:        { value: new THREE.Color('#00D4FF') },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Points(geometry, this.material);
    scene.add(this.mesh);
  }

  update(time: number, mouseWorld: THREE.Vector2): void {
    this.material.uniforms['uTime'].value  = time;
    this.material.uniforms['uMouse'].value = mouseWorld;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

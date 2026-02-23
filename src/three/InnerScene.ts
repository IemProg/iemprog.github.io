import * as THREE from 'three';
import { ParticleSystem } from './ParticleSystem';
import { isMobileDevice, prefersReducedMotion } from '../utils/math';

// ─── Background Atmosphere (shared look with landing page) ───────────────────
const BG_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
`;
const BG_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec3 base = vec3(0.0392, 0.0392, 0.059);
    vec2 c1 = vec2(0.18 + sin(uTime*0.07)*0.12, 0.75 + cos(uTime*0.06)*0.10);
    vec2 c2 = vec2(0.82 + cos(uTime*0.08)*0.10, 0.25 + sin(uTime*0.07)*0.10);
    float d1 = 1.0 - smoothstep(0.0, 0.65, length(vUv - c1));
    float d2 = 1.0 - smoothstep(0.0, 0.60, length(vUv - c2));
    vec3 tone1 = vec3(0.0,  0.08, 0.38) * 0.10;
    vec3 tone2 = vec3(0.28, 0.0,  0.55) * 0.07;
    gl_FragColor = vec4(base + tone1*d1 + tone2*d2, 1.0);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────

export class InnerScene {
  private renderer:   THREE.WebGLRenderer;
  private camera:     THREE.PerspectiveCamera;
  private scene:      THREE.Scene;
  private clock:      THREE.Clock;
  private particles:  ParticleSystem | null = null;
  private bgMat:      THREE.ShaderMaterial | null = null;
  private mouseWorld: THREE.Vector2 = new THREE.Vector2();
  private rafId:      number = 0;

  constructor(canvas: HTMLCanvasElement) {
    const mobile  = isMobileDevice();
    const reduced = prefersReducedMotion();

    this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: false, powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;
    this.renderer.setClearColor(new THREE.Color('#0A0A0F'));

    this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 2000,
    );
    this.camera.position.set(0, 0, 100);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0A0A0F, 0.0018);
    this.clock    = new THREE.Clock();

    this.buildBackground();

    // Fewer particles than the landing page — lighter, less distracting for reading
    if (!reduced) {
      this.particles = new ParticleSystem(this.scene, mobile ? 150 : 420);
    }

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize',    this.onResize);
  }

  private buildBackground(): void {
    const geo = new THREE.PlaneGeometry(2, 2);
    this.bgMat = new THREE.ShaderMaterial({
      vertexShader:   BG_VERT,
      fragmentShader: BG_FRAG,
      uniforms: { uTime: { value: 0 } },
      depthWrite: false,
      depthTest:  false,
    });
    const mesh = new THREE.Mesh(geo, this.bgMat);
    mesh.frustumCulled = false;
    mesh.renderOrder   = -1;
    mesh.scale.set(9999, 9999, 1);
    mesh.position.z = -999;
    this.scene.add(mesh);
  }

  private readonly onMouseMove = (e: MouseEvent): void => {
    const ndx = (e.clientX / window.innerWidth)  *  2 - 1;
    const ndy = -(e.clientY / window.innerHeight) *  2 + 1;
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(ndx, ndy), this.camera);
    const plane  = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const target = new THREE.Vector3();
    ray.ray.intersectPlane(plane, target);
    this.mouseWorld.set(target.x, target.y);
  };

  private readonly onResize = (): void => {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private tick = (): void => {
    const t = this.clock.getElapsedTime();
    if (this.bgMat) this.bgMat.uniforms['uTime'].value = t;
    this.particles?.update(t, this.mouseWorld);
    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.tick);
  };

  start(): void   { this.rafId = requestAnimationFrame(this.tick); }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize',    this.onResize);
    this.particles?.dispose();
    this.renderer.dispose();
  }
}

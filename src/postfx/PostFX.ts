import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass }     from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass }     from 'three/addons/postprocessing/OutputPass.js';

// ─── Film Grain Shader ────────────────────────────────────────────────────────
const GrainShader = {
  uniforms: {
    tDiffuse:   { value: null as THREE.Texture | null },
    uTime:      { value: 0 },
    uIntensity: { value: 0.032 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float     uTime;
    uniform float     uIntensity;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float grain = rand(vUv + mod(uTime * 0.0872, 1.0)) * 2.0 - 1.0;
      color.rgb += grain * uIntensity;
      gl_FragColor = color;
    }
  `,
};

// ─── Chromatic Aberration Shader ──────────────────────────────────────────────
const ChromaticShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uAmount:  { value: 0.0012 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float     uAmount;
    varying vec2 vUv;

    void main() {
      vec2 dir    = (vUv - 0.5) * uAmount;
      float r     = texture2D(tDiffuse, vUv + dir).r;
      float g     = texture2D(tDiffuse, vUv      ).g;
      float b     = texture2D(tDiffuse, vUv - dir).b;
      float a     = texture2D(tDiffuse, vUv      ).a;
      gl_FragColor = vec4(r, g, b, a);
    }
  `,
};

// ─────────────────────────────────────────────────────────────────────────────

export interface PostFXHandle {
  composer:    EffectComposer;
  grainPass:   ShaderPass;
  bloomPass:   UnrealBloomPass;
  update(time: number): void;
  setSize(w: number, h: number): void;
}

export function createPostFX(
  renderer: THREE.WebGLRenderer,
  scene:    THREE.Scene,
  camera:   THREE.Camera,
  w:        number,
  h:        number,
): PostFXHandle {
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(w, h),
    0.55,  // strength  — visible but not overdone
    0.45,  // radius
    0.22,  // threshold — only bright pixels bloom
  );
  composer.addPass(bloomPass);

  const grainPass = new ShaderPass(GrainShader);
  composer.addPass(grainPass);

  const chromaPass = new ShaderPass(ChromaticShader);
  composer.addPass(chromaPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return {
    composer,
    grainPass,
    bloomPass,
    update(time: number) {
      (grainPass.uniforms as Record<string, THREE.IUniform>)['uTime'].value = time;
    },
    setSize(width: number, height: number) {
      composer.setSize(width, height);
      bloomPass.setSize(width, height);
    },
  };
}

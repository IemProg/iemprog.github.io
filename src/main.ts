import './styles/base.css';
import './styles/landing.css';

import { ThreeScene }          from './three/ThreeScene';
import { Cursor }              from './components/Cursor';
import { Tagline }             from './components/Tagline';
import { Terminal }            from './components/Terminal';
import { runLoadSequence }     from './animations/LoadSequence';
import { initScrollAnimations } from './animations/ScrollAnimations';
import { isMobileDevice }       from './utils/math';

// ── Three.js WebGL scene ──────────────────────────────────────────────────────
const canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
const scene  = new ThreeScene(canvas);
scene.start();

// ── Custom cursor ─────────────────────────────────────────────────────────────
new Cursor();

// ── Portrait spotlight reveal (same image, duotone CSS filter) ────────────────
const revealEl = document.querySelector<HTMLElement>('.portrait-reveal');
const wrapEl   = document.getElementById('pwrap');
if (revealEl && wrapEl && !isMobileDevice()) {
  document.addEventListener('mousemove', e => {
    const r   = wrapEl.getBoundingClientRect();
    const rx  = e.clientX - r.left;
    const ry  = e.clientY - r.top;
    const mask = `radial-gradient(circle 105px at ${rx}px ${ry}px, black 0%, black 38%, transparent 68%)`;
    revealEl.style.webkitMaskImage = mask;
    revealEl.style.maskImage       = mask;
  });
}

// ── Portrait 3D tilt ─────────────────────────────────────────────────────────
const tiltEl = document.getElementById('ptilt');
const pwrap  = document.getElementById('pwrap');
if (tiltEl && pwrap && !isMobileDevice()) {
  pwrap.addEventListener('mousemove', e => {
    const r   = pwrap.getBoundingClientRect();
    const cx  = r.left + r.width  / 2;
    const cy  = r.top  + r.height / 2;
    const rX  = Math.max(-5, Math.min(5, (e.clientY - cy) / r.height * -10));
    const rY  = Math.max(-5, Math.min(5, (e.clientX - cx) / r.width  *  10));
    tiltEl.style.transform = `perspective(600px) rotateX(${rX}deg) rotateY(${rY}deg)`;
  });
  pwrap.addEventListener('mouseleave', () => {
    tiltEl.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
  });
}

// ── Tagline rotator ───────────────────────────────────────────────────────────
new Tagline();

// ── Terminal typewriter ───────────────────────────────────────────────────────
new Terminal();

// ── Scroll animations ─────────────────────────────────────────────────────────
initScrollAnimations();

// ── Mobile menu ───────────────────────────────────────────────────────────────
const hamBtn  = document.getElementById('ham-btn');
const mMenu   = document.getElementById('mobile-menu');
const mClose  = document.getElementById('menu-close');
hamBtn?.addEventListener('click',  () => mMenu?.classList.add('open'));
mClose?.addEventListener('click',  () => mMenu?.classList.remove('open'));
mMenu?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mMenu.classList.remove('open')),
);

// ── GSAP cinematic load sequence (runs last) ─────────────────────────────────
runLoadSequence();

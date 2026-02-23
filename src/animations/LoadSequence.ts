import gsap from 'gsap';
import { prefersReducedMotion } from '../utils/math';

export function runLoadSequence(): void {
  const reduced = prefersReducedMotion();

  const ls   = document.getElementById('load-screen')!;
  const bl   = document.getElementById('boot-line')!;
  const nav  = document.getElementById('nav')!;
  const fn   = document.getElementById('hero-firstname')!;
  const ln   = document.getElementById('hero-lastname')!;
  const trow = document.getElementById('trow')!;
  const hsub = document.getElementById('hero-sub')!;
  const hbad = document.getElementById('hero-badges')!;
  const hcta = document.getElementById('hero-cta')!;
  const pimg = document.getElementById('portrait-img')!;

  if (reduced) {
    ls.style.display = 'none';
    [nav, fn, ln, trow, hsub, hbad, hcta].forEach(el => {
      if (el) gsap.set(el, { opacity: 1, y: 0 });
    });
    if (pimg) pimg.classList.add('show');
    document.querySelectorAll<HTMLElement>('.s-icon').forEach(el => {
      gsap.set(el, { opacity: 1, x: 0 });
    });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // T+0 — boot line expands
  tl.set(bl, { width: 0 })
    .to(bl, { width: '55%', duration: 0.4 }, 0)

  // T+0.55 — screen dims
    .to(ls, { opacity: 0.9, duration: 0.4 }, 0.55)

  // T+1.0 — screen out
    .to(ls, {
      opacity: 0, duration: 0.5,
      onComplete: () => { ls.style.display = 'none'; },
    }, 1.0)

  // T+1.2 — firstname slides up
    .fromTo(fn, { y: '105%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.55 }, 1.2)

  // T+1.5 — lastname slides up with cyan burst
    .fromTo(ln, { y: '105%', opacity: 0 }, {
      y: '0%', opacity: 1, duration: 0.62,
      onStart: () => {
        gsap.fromTo(
          ln,
          { textShadow: '0 0 80px rgba(0,212,255,.7), 0 0 160px rgba(0,212,255,.3)' },
          { textShadow: 'none', duration: 1.2, ease: 'power2.out' },
        );
      },
    }, 1.5)

  // T+1.85 — tagline fades in
    .to(trow, { opacity: 1, duration: 0.45 }, 1.85)

  // T+2.05 — subtitle
    .fromTo(hsub, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 2.05)

  // T+2.25 — badges
    .fromTo(hbad, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 2.25)

  // T+2.45 — CTA buttons
    .fromTo(hcta, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 2.45)

  // T+2.65 — portrait
    .add(() => { pimg?.classList.add('show'); }, 2.65)

  // T+2.9 — nav slides down
    .fromTo(nav, { y: -64, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 2.9)

  // T+3.1 — social icons stagger in
    .fromTo(
      '.s-icon',
      { x: 16, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
      3.1,
    );
}

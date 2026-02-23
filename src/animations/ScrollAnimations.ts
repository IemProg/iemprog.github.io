import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Animate a counter from 0 to target ──────────────────────────────────────
function animateCounter(el: HTMLElement, target: number): void {
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target, duration: 1.2, ease: 'power3.out',
    onUpdate: () => { el.textContent = String(Math.round(obj.val)); },
  });
}

// ─── Three Pillars ────────────────────────────────────────────────────────────
function initPillars(): void {
  document.querySelectorAll<HTMLElement>('.pillar').forEach((pillar, i) => {
    const border  = pillar.querySelector<HTMLElement>('.pillar-border');
    const counter = pillar.querySelector<HTMLElement>('.cnum');
    const target  = parseInt(counter?.dataset['target'] ?? '0', 10);

    ScrollTrigger.create({
      trigger: pillar,
      start:   'top 82%',
      onEnter: () => {
        const delay = i * 0.15;
        gsap.to(border, { width: '100%', duration: 0.4, delay, ease: 'power2.inOut' });
        gsap.fromTo(
          pillar.querySelectorAll('.pillar-icon, .pillar-title, .pillar-sub, .pillar-count'),
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, delay, stagger: 0.1, ease: 'power3.out' },
        );
        if (counter) {
          setTimeout(() => animateCounter(counter, target), delay * 1000 + 300);
        }
      },
      once: true,
    });
  });
}

// ─── Portrait parallax ───────────────────────────────────────────────────────
function initParallax(): void {
  const portrait = document.querySelector<HTMLElement>('.hero-right');
  if (!portrait) return;
  gsap.to(portrait, {
    y: -40,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start:   'top top',
      end:     'bottom top',
      scrub:   true,
    },
  });
}

// ─── Generic reveal ──────────────────────────────────────────────────────────
function initReveal(): void {
  document.querySelectorAll<HTMLElement>('.reveal').forEach(el => {
    gsap.fromTo(
      el,
      { y: 28, opacity: 0, filter: 'blur(4px)' },
      {
        y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.65, ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start:   'top 88%',
          once:    true,
        },
      },
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
export function initScrollAnimations(): void {
  initPillars();
  initParallax();
  initReveal();
}

import gsap from 'gsap';

const LABELS = ['AI Researcher', 'Entrepreneur', 'Endurance Athlete'];

export class Tagline {
  private items:   NodeListOf<HTMLElement>;
  private track:   HTMLElement;
  private current: number = 0;
  private timer:   ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.track = document.getElementById('ttrack')!;
    this.items = document.querySelectorAll<HTMLElement>('.tagline-item');
    if (!this.track || !this.items.length) return;

    // Size track to widest label
    let maxW = 0;
    this.items.forEach(el => { maxW = Math.max(maxW, el.scrollWidth); });
    this.track.style.width = maxW + 12 + 'px';

    this.timer = setInterval(() => this.rotate(), 3200);
  }

  private rotate(): void {
    const prev = this.current;
    this.current = (this.current + 1) % LABELS.length;
    const prevEl = this.items[prev];
    const nextEl = this.items[this.current];

    // Exit previous
    gsap.to(prevEl, {
      yPercent: -100, opacity: 0, duration: 0.45,
      ease: 'power3.in',
      onComplete: () => {
        prevEl.classList.remove('active');
        gsap.set(prevEl, { yPercent: 100, opacity: 0 });
      },
    });

    // Enter next — 50ms glitch on entry
    gsap.set(nextEl, { yPercent: 100, opacity: 1 });
    nextEl.classList.add('active');
    gsap.to(nextEl, {
      yPercent: 0, duration: 0.5, ease: 'power3.out',
      onStart: () => {
        nextEl.style.textShadow = '-2px 0 #ff0040, 2px 0 #00bfff';
        setTimeout(() => { nextEl.style.textShadow = ''; }, 70);
      },
    });
  }

  destroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}

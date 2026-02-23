import { lerp, isMobileDevice } from '../utils/math';

export class Cursor {
  private dot:    HTMLElement;
  private ring:   HTMLElement;
  private glow:   HTMLElement;
  private trails: HTMLElement[] = [];

  private rx = -999;
  private ry = -999;
  private mx = -999;
  private my = -999;
  private pvx = 0;
  private pvy = 0;
  private history: { x: number; y: number }[] = [];
  private readonly TRAIL_COUNT = 7;
  private readonly H_LEN = 35;
  private rafId = 0;

  constructor() {
    this.dot  = document.getElementById('cursor-dot')!;
    this.ring = document.getElementById('cursor-ring')!;
    this.glow = document.getElementById('cursor-glow')!;

    if (isMobileDevice()) {
      [this.dot, this.ring, this.glow].forEach(el => el && (el.style.display = 'none'));
      return;
    }

    this.buildTrails();
    document.addEventListener('mousemove', this.onMove);
    this.tick();

    // Ring expands on interactive elements
    document.querySelectorAll('a, button, .badge, .pillar, .pub-card, .blog-card').forEach(el => {
      el.addEventListener('mouseenter', () => this.ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => this.ring.classList.remove('hover'));
    });
  }

  private buildTrails(): void {
    for (let i = 0; i < this.TRAIL_COUNT; i++) {
      const t = document.createElement('div');
      const s = 40 + i * 5;
      t.style.cssText = [
        'position:fixed', 'border-radius:50%', 'pointer-events:none',
        `width:${s}px`, `height:${s}px`,
        'border:1px solid rgba(0,212,255,.3)',
        'transform:translate(-50%,-50%)',
        'z-index:9997', 'opacity:0',
      ].join(';');
      document.body.appendChild(t);
      this.trails.push(t);
    }
  }

  private readonly onMove = (e: MouseEvent): void => {
    const vx = e.clientX - this.mx;
    const vy = e.clientY - this.my;
    this.pvx = vx;
    this.pvy = vy;
    this.mx = e.clientX;
    this.my = e.clientY;
  };

  private tick = (): void => {
    this.dot.style.left = this.mx + 'px';
    this.dot.style.top  = this.my + 'px';

    this.rx = lerp(this.rx, this.mx, 0.13);
    this.ry = lerp(this.ry, this.my, 0.13);
    this.ring.style.left = this.rx + 'px';
    this.ring.style.top  = this.ry + 'px';

    this.glow.style.left = this.mx + 'px';
    this.glow.style.top  = this.my + 'px';

    this.history.unshift({ x: this.rx, y: this.ry });
    if (this.history.length > this.H_LEN) this.history.length = this.H_LEN;

    const speed = Math.sqrt(this.pvx ** 2 + this.pvy ** 2);
    this.trails.forEach((t, i) => {
      const p = this.history[Math.floor(i * this.H_LEN / this.TRAIL_COUNT)];
      if (!p) return;
      t.style.left    = p.x + 'px';
      t.style.top     = p.y + 'px';
      t.style.opacity = String(Math.min(speed * 0.022, 0.3) * (1 - i / this.TRAIL_COUNT));
    });

    this.rafId = requestAnimationFrame(this.tick);
  };

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    document.removeEventListener('mousemove', this.onMove);
    this.trails.forEach(t => t.remove());
  }
}

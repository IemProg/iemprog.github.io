export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), hi);
export const rng = (min: number, max: number): number => Math.random() * (max - min) + min;
export const rngInt = (min: number, max: number): number => Math.floor(rng(min, max + 1));
export const isMobileDevice = (): boolean =>
  window.innerWidth <= 900 || 'ontouchstart' in window;
export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

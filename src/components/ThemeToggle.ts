export type Theme = 'dark' | 'light';

export interface ThemeTarget {
  setTheme(theme: Theme): void;
}

export class ThemeToggle {
  private current: Theme;

  constructor(private target?: ThemeTarget) {
    const saved  = localStorage.getItem('site-theme') as Theme | null;
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    this.current = saved ?? system;
    this.apply(this.current);
    document.getElementById('theme-btn')?.addEventListener('click', () => this.toggle());
  }

  private toggle(): void {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('site-theme', this.current);
    this.apply(this.current);
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    this.target?.setTheme(theme);
  }
}

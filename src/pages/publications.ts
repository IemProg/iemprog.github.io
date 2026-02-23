import '../styles/base.css';
import '../styles/pages.css';
import { Cursor } from '../components/Cursor';
import { InnerScene } from '../three/InnerScene';
import { PUBLICATIONS } from '../data/publications';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Scene ─────────────────────────────────────────────────────────────────────
const canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
new InnerScene(canvas).start();
new Cursor();

// ── Render publication cards ──────────────────────────────────────────────────
const list = document.getElementById('pub-list')!;

PUBLICATIONS.forEach((pub, idx) => {
  const isOral    = pub.badge === 'oral';
  const badgeText = isOral ? 'ORAL ★' : pub.abbr;
  const num       = String(idx + 1).padStart(2, '0');

  const card = document.createElement('article');
  card.className = `pub-card${isOral ? ' pub-oral' : ''}`;
  card.innerHTML = `
    <div class="pub-num">${num}</div>
    <div class="pub-body">
      <div class="pub-meta-row">
        <span class="pub-badge ${isOral ? 'oral' : 'accepted'}">${badgeText}</span>
        <span class="pub-year">${pub.year}</span>
      </div>
      <div class="pub-title">${pub.title}</div>
      <div class="pub-authors">${pub.authors}</div>
      <div class="pub-venue">${pub.venue}</div>
      <div class="pub-abstract">${pub.abstract}</div>
      <div class="pub-links">
        ${pub.paper ? `<a href="${pub.paper}" target="_blank" rel="noopener" class="pub-link">Paper ↗</a>` : ''}
        <a href="${pub.arxiv}" target="_blank" rel="noopener" class="pub-link">arXiv ↗</a>
        ${pub.code ? `<a href="${pub.code}" target="_blank" rel="noopener" class="pub-link">Code ↗</a>` : ''}
        <button class="pub-toggle">Abstract ↓</button>
      </div>
    </div>
  `;

  const toggle = card.querySelector<HTMLButtonElement>('.pub-toggle')!;
  toggle.addEventListener('click', () => {
    card.classList.toggle('expanded');
    toggle.textContent = card.classList.contains('expanded') ? 'Abstract ↑' : 'Abstract ↓';
  });

  list.appendChild(card);
});

// ── Animations ────────────────────────────────────────────────────────────────
gsap.fromTo('#nav',
  { y: -64, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
gsap.fromTo('.s-icon',
  { x: 16, opacity: 0 },
  { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power3.out', delay: 0.4 });
gsap.fromTo('.page-eyebrow, .page-title, .page-subtitle, .page-stat-row',
  { y: 28, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power3.out', delay: 0.2 });

document.querySelectorAll<HTMLElement>('.pub-card').forEach((card, i) => {
  gsap.fromTo(card,
    { y: 32, opacity: 0, filter: 'blur(4px)' },
    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.65, ease: 'power3.out',
      delay: i * 0.06,
      scrollTrigger: { trigger: card, start: 'top 90%', once: true } },
  );
});

// Mobile menu
const hamBtn = document.getElementById('ham-btn');
const mMenu  = document.getElementById('mobile-menu');
const mClose = document.getElementById('menu-close');
hamBtn?.addEventListener('click',  () => mMenu?.classList.add('open'));
mClose?.addEventListener('click',  () => mMenu?.classList.remove('open'));
mMenu?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mMenu.classList.remove('open')),
);

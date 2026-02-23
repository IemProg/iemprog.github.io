import '../styles/base.css';
import '../styles/pages.css';
import { Cursor } from '../components/Cursor';
import { InnerScene } from '../three/InnerScene';
import { POSTS }  from '../data/blog';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Scene ─────────────────────────────────────────────────────────────────────
const canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
new InnerScene(canvas).start();
new Cursor();

// ── Render blog cards ─────────────────────────────────────────────────────────
const grid = document.getElementById('blog-grid')!;

POSTS.forEach((post, idx) => {
  const d       = new Date(post.date);
  const month   = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year    = d.getFullYear();
  const num     = String(idx + 1).padStart(2, '0');
  const isFeatured = idx === 0;

  const card   = document.createElement('a');
  card.className = `blog-card${isFeatured ? ' blog-featured' : ''}`;
  card.href    = post.url;
  if (post.url.startsWith('http')) { card.target = '_blank'; card.rel = 'noopener'; }

  card.innerHTML = `
    <div class="blog-index">${num}</div>
    <div class="blog-card-inner">
      <div class="blog-date-block">
        <span class="blog-month">${month}</span>
        <span class="blog-year">${year}</span>
      </div>
      <h2 class="blog-title">${post.title}</h2>
      <p  class="blog-desc">${post.description}</p>
      <div class="blog-footer">
        <span class="blog-read-wrap">
          <span class="blog-read-bar" style="--w:${Math.min(100, post.readTime * 8)}%"></span>
          <span class="blog-read-label">${post.readTime} min read</span>
        </span>
        <span class="blog-cta">Read →</span>
      </div>
    </div>
  `;
  grid.appendChild(card);
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

document.querySelectorAll<HTMLElement>('.blog-card').forEach((card, i) => {
  gsap.fromTo(card,
    { y: 32, opacity: 0, filter: 'blur(4px)' },
    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.65, ease: 'power3.out',
      delay: i * 0.08,
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

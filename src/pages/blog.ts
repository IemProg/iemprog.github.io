import '../styles/base.css';
import '../styles/pages.css';
import { Cursor } from '../components/Cursor';
import { POSTS }  from '../data/blog';
import gsap from 'gsap';

new Cursor();

// ── Render blog cards ─────────────────────────────────────────────────────────
const grid = document.getElementById('blog-grid')!;

POSTS.forEach(post => {
  const dateStr = new Date(post.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  const card = document.createElement('a');
  card.className = 'blog-card reveal';
  card.href      = post.url;
  if (post.url.startsWith('http')) { card.target = '_blank'; card.rel = 'noopener'; }
  card.innerHTML = `
    <div class="blog-date">${dateStr}</div>
    <h2 class="blog-title">${post.title}</h2>
    <p  class="blog-desc">${post.description}</p>
    <div class="blog-meta">
      <span class="blog-read">${post.readTime} min read</span>
      <span class="blog-arrow">→</span>
    </div>
  `;
  grid.appendChild(card);
});

// ── Animations ────────────────────────────────────────────────────────────────
gsap.fromTo('#nav',    { y: -64, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
gsap.fromTo('.s-icon', { x: 16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power3.out', delay: 0.5 });
gsap.fromTo('.page-title, .page-subtitle', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out', delay: 0.25 });
gsap.fromTo('.blog-card', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.1, ease: 'power3.out', delay: 0.45 });

// Mobile menu
const hamBtn = document.getElementById('ham-btn');
const mMenu  = document.getElementById('mobile-menu');
const mClose = document.getElementById('menu-close');
hamBtn?.addEventListener('click',  () => mMenu?.classList.add('open'));
mClose?.addEventListener('click',  () => mMenu?.classList.remove('open'));
mMenu?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mMenu.classList.remove('open')),
);

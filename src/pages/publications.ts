import '../styles/base.css';
import '../styles/pages.css';
import { Cursor } from '../components/Cursor';
import { PUBLICATIONS } from '../data/publications';
import gsap from 'gsap';

new Cursor();

// ── Render publication cards ──────────────────────────────────────────────────
const list = document.getElementById('pub-list')!;

PUBLICATIONS.forEach(pub => {
  const badgeClass = pub.badge === 'oral' ? 'oral' : 'accepted';
  const badgeText  = pub.badge === 'oral' ? 'ORAL ★' : pub.abbr;

  const card = document.createElement('article');
  card.className = 'pub-card reveal';
  card.innerHTML = `
    <div class="pub-header">
      <span class="pub-badge ${badgeClass}">${badgeText}</span>
      <div>
        <div class="pub-title">${pub.title}</div>
        <div class="pub-authors">${pub.authors}</div>
        <div class="pub-venue">${pub.venue} · ${pub.year}</div>
      </div>
    </div>
    <div class="pub-abstract">${pub.abstract}</div>
    <div class="pub-links">
      <a href="${pub.arxiv}" target="_blank" rel="noopener" class="pub-link">arXiv</a>
      ${pub.code ? `<a href="${pub.code}" target="_blank" rel="noopener" class="pub-link">Code</a>` : ''}
      <button class="pub-toggle" data-idx="">Abstract ↓</button>
    </div>
  `;

  const toggleBtn = card.querySelector<HTMLButtonElement>('.pub-toggle')!;
  toggleBtn.addEventListener('click', () => {
    card.classList.toggle('expanded');
    toggleBtn.textContent = card.classList.contains('expanded') ? 'Abstract ↑' : 'Abstract ↓';
  });

  list.appendChild(card);
});

// ── Animations ────────────────────────────────────────────────────────────────
gsap.fromTo('#nav',    { y: -64, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
gsap.fromTo('.s-icon', { x: 16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power3.out', delay: 0.5 });
gsap.fromTo('.page-title, .page-subtitle', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out', delay: 0.25 });

// Scroll reveal for cards
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll<HTMLElement>('.pub-card').forEach(card => {
  gsap.fromTo(card,
    { y: 24, opacity: 0, filter: 'blur(3px)' },
    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true } },
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

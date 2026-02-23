import '../styles/base.css';
import '../styles/pages.css';
import { Cursor }  from '../components/Cursor';
import { initScrollAnimations } from '../animations/ScrollAnimations';
import gsap from 'gsap';

new Cursor();
initScrollAnimations();

// Mobile menu
const hamBtn = document.getElementById('ham-btn');
const mMenu  = document.getElementById('mobile-menu');
const mClose = document.getElementById('menu-close');
hamBtn?.addEventListener('click',  () => mMenu?.classList.add('open'));
mClose?.addEventListener('click',  () => mMenu?.classList.remove('open'));
mMenu?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mMenu.classList.remove('open')),
);

// Stagger reveal on load
gsap.fromTo(
  '.reveal',
  { y: 24, opacity: 0, filter: 'blur(4px)' },
  { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.65, stagger: 0.1, ease: 'power3.out', delay: 0.3 },
);
gsap.fromTo(
  '#nav',
  { y: -64, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 },
);
gsap.fromTo(
  '.s-icon',
  { x: 16, opacity: 0 },
  { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power3.out', delay: 0.6 },
);

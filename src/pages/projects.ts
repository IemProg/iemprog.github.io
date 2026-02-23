import '../styles/base.css';
import '../styles/pages.css';
import { Cursor } from '../components/Cursor';
import gsap from 'gsap';

new Cursor();

interface Project {
  title:  string;
  desc:   string;
  tags:   string[];
  links:  { label: string; url: string }[];
}

const PROJECTS: Project[] = [
  {
    title: 'CurriboxAI',
    desc:  'AI-powered B2B SaaS platform for personalized learning and curriculum generation. Co-founded and built from zero to product.',
    tags:  ['AI', 'SaaS', 'Startup', 'LLMs'],
    links: [{ label: 'Website', url: 'https://curriboxai.com' }],
  },
  {
    title: 'QUAD — Question-Only Replay for Continual VQA',
    desc:  'Novel continual learning strategy for Visual Question Answering using only past-task questions for regularization. Accepted at ICCV 2025.',
    tags:  ['Continual Learning', 'VQA', 'ICCV 2025'],
    links: [
      { label: 'arXiv', url: 'https://arxiv.org/abs/2502.04469' },
      { label: 'Code',  url: 'https://github.com/IemProg/QUAD' },
    ],
  },
  {
    title: 'CoFiMA — Continual Fisher-Weighted Model Averaging',
    desc:  'Fisher-information-weighted ensemble of model parameters for continual learning. Oral presentation at ECCV 2024 (Top 3%).',
    tags:  ['Continual Learning', 'ECCV 2024', 'Oral'],
    links: [
      { label: 'arXiv', url: 'https://arxiv.org/abs/2312.08977' },
      { label: 'Code',  url: 'https://github.com/IemProg/CoFiMA' },
    ],
  },
  {
    title: 'PLASTIC — Plasticity-Enhanced Test-Time Adaptation',
    desc:  'Test-time adaptation for class-incremental learning that reinstates plasticity while preserving stability. Accepted at CoLLAs 2025.',
    tags:  ['Continual Learning', 'CoLLAs 2025', 'TTA'],
    links: [
      { label: 'arXiv', url: 'https://arxiv.org/abs/2310.11482' },
      { label: 'Code',  url: 'https://github.com/IemProg/PLASTIC' },
    ],
  },
  {
    title: 'MiMi — Mini Adapters for ViT Fine-Tuning',
    desc:  'Iterative compression framework for parameter-efficient ViT fine-tuning. Outperforms existing PETL methods across 29 datasets. WACV 2024.',
    tags:  ['Parameter Efficiency', 'ViT', 'WACV 2024'],
    links: [
      { label: 'arXiv', url: 'https://arxiv.org/abs/2311.03873' },
    ],
  },
];

// ── Render project cards ──────────────────────────────────────────────────────
const grid = document.getElementById('projects-grid')!;

PROJECTS.forEach(proj => {
  const card = document.createElement('article');
  card.className = 'proj-card reveal';
  card.innerHTML = `
    <div class="proj-tags">
      ${proj.tags.map(t => `<span class="proj-tag">${t}</span>`).join('')}
    </div>
    <h2 class="proj-title">${proj.title}</h2>
    <p  class="proj-desc">${proj.desc}</p>
    <div class="proj-links">
      ${proj.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener" class="proj-link">${l.label}</a>`).join('')}
    </div>
  `;
  grid.appendChild(card);
});

// ── Animations ────────────────────────────────────────────────────────────────
gsap.fromTo('#nav',    { y: -64, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
gsap.fromTo('.s-icon', { x: 16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power3.out', delay: 0.5 });
gsap.fromTo('.page-title, .page-subtitle', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out', delay: 0.25 });
gsap.fromTo('.proj-card', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out', delay: 0.45 });

// Mobile menu
const hamBtn = document.getElementById('ham-btn');
const mMenu  = document.getElementById('mobile-menu');
const mClose = document.getElementById('menu-close');
hamBtn?.addEventListener('click',  () => mMenu?.classList.add('open'));
mClose?.addEventListener('click',  () => mMenu?.classList.remove('open'));
mMenu?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mMenu.classList.remove('open')),
);

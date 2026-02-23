import '../styles/base.css';
import '../styles/pages.css';
import { Cursor } from '../components/Cursor';
import { InnerScene } from '../three/InnerScene';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Scene ─────────────────────────────────────────────────────────────────────
const canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
new InnerScene(canvas).start();
new Cursor();

// ── Data ──────────────────────────────────────────────────────────────────────
interface Project {
  title:    string;
  desc:     string;
  tags:     string[];
  links:    { label: string; url: string }[];
  featured?: boolean;
}

const PROJECTS: Project[] = [
  {
    title:    'CurriboxAI',
    desc:     'AI-powered CV management platform for staffing firms. Automates CV processing with GDPR-compliant anonymization, multi-language translation, and custom branding. Co-founded and built from zero to product.',
    tags:     ['AI', 'SaaS', 'Startup', 'B2B'],
    links:    [{ label: 'Website', url: 'https://curriboxai.com' }],
    featured: true,
  },
  {
    title:    'QUAD — Question-Only Replay for Continual VQA',
    desc:     'Novel continual learning strategy for Visual Question Answering using only past-task questions for regularization. Accepted at ICCV 2025.',
    tags:     ['Continual Learning', 'VQA', 'ICCV 2025'],
    links:    [
      { label: 'arXiv', url: 'https://arxiv.org/abs/2502.04469' },
      { label: 'Code',  url: 'https://github.com/IemProg/QUAD' },
    ],
  },
  {
    title:    'CoFiMA — Continual Fisher-Weighted Model Averaging',
    desc:     'Fisher-information-weighted ensemble of model parameters for continual learning. Oral presentation at ECCV 2024 (Top 3%).',
    tags:     ['Continual Learning', 'ECCV 2024', 'Oral'],
    links:    [
      { label: 'arXiv', url: 'https://arxiv.org/abs/2312.08977' },
      { label: 'Code',  url: 'https://github.com/IemProg/CoFiMA' },
    ],
  },
  {
    title:    'PLASTIC — Plasticity-Enhanced Test-Time Adaptation',
    desc:     'Test-time adaptation for class-incremental learning that reinstates plasticity while preserving stability. Accepted at CoLLAs 2025.',
    tags:     ['Continual Learning', 'CoLLAs 2025', 'TTA'],
    links:    [
      { label: 'arXiv', url: 'https://arxiv.org/abs/2310.11482' },
      { label: 'Code',  url: 'https://github.com/IemProg/PLASTIC' },
    ],
  },
  {
    title:    'MiMi — Mini Adapters for ViT Fine-Tuning',
    desc:     'Iterative compression framework for parameter-efficient ViT fine-tuning. Outperforms existing PETL methods across 29 datasets. WACV 2024.',
    tags:     ['Parameter Efficiency', 'ViT', 'WACV 2024'],
    links:    [{ label: 'arXiv', url: 'https://arxiv.org/abs/2311.03873' }],
  },
];

// ── Render project cards ──────────────────────────────────────────────────────
const grid = document.getElementById('projects-grid')!;

PROJECTS.forEach((proj, idx) => {
  const num  = String(idx + 1).padStart(2, '0');
  const card = document.createElement('article');
  card.className = `proj-card${proj.featured ? ' proj-featured' : ''}`;

  card.innerHTML = `
    <div class="proj-num">${num}</div>
    <div class="proj-tags">
      ${proj.tags.map(t => `<span class="proj-tag">${t}</span>`).join('')}
    </div>
    <h2 class="proj-title">${proj.title}</h2>
    <p  class="proj-desc">${proj.desc}</p>
    <div class="proj-links">
      ${proj.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener" class="proj-link">${l.label} ↗</a>`).join('')}
    </div>
    <div class="proj-frame">
      <div class="pfc tl"></div><div class="pfc tr"></div>
      <div class="pfc bl"></div><div class="pfc br"></div>
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

document.querySelectorAll<HTMLElement>('.proj-card').forEach((card, i) => {
  gsap.fromTo(card,
    { y: 32, opacity: 0, filter: 'blur(4px)' },
    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.65, ease: 'power3.out',
      delay: i * 0.07,
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

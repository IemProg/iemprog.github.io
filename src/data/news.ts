// Newest first. `date` is YYYY-MM; `html` may contain links.
export interface NewsItem {
  date: string;
  html: string;
}

export const NEWS: NewsItem[] = [
  { date: '2026-11', html: 'Defended my PhD at Télécom Paris.' },
  {
    date: '2026-09',
    html: '<a href="https://iemprog.github.io/DMC/">DMC</a> was accepted at NeurIPS 2026.',
  },
  { date: '2026-05', html: "Joined Google DeepMind's Gemma team as a student researcher." },
  {
    date: '2025-08',
    html: '<a href="https://arxiv.org/abs/2502.04469">QUAD</a> was accepted at ICCV 2025.',
  },
  {
    date: '2025-06',
    html: '<a href="https://arxiv.org/abs/2310.11482">PLASTIC</a> was accepted at CoLLAs 2025.',
  },
  {
    date: '2024-10',
    html: 'Presented <a href="https://arxiv.org/abs/2312.08977">CoFiMA</a> as an oral at ECCV 2024 in Milan.',
  },
  {
    date: '2024-05',
    html: 'Started a research visit at the Computer Vision Center in Barcelona, with Joost van de Weijer.',
  },
  {
    date: '2024-01',
    html: 'Presented <a href="https://arxiv.org/abs/2311.03873">MiMi</a> at WACV 2024.',
  },
];

export function formatMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

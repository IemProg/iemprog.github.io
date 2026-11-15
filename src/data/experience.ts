export interface Role {
  when: string;
  role: string;
  org: string;
  detail: string;
}

export const EXPERIENCE: Role[] = [
  {
    when: '2026',
    role: 'Student Researcher',
    org: 'Google DeepMind, Gemma team',
    detail: 'Choosing data mixtures for LLM and vision-language pre-training under a fixed compute budget.',
  },
  {
    when: '2024',
    role: 'PhD Research Visit',
    org: 'Computer Vision Center, UAB',
    detail: 'With Joost van de Weijer. Built the continual-VQA benchmark used in the ICCV 2025 paper.',
  },
  {
    when: '2022–26',
    role: 'Doctoral Researcher',
    org: 'LTCI, Télécom Paris',
    detail: 'Continual adaptation of pretrained vision and vision-language models.',
  },
];

export const EDUCATION = [
  { when: '2022–26', what: 'PhD, Artificial Intelligence', where: 'Télécom Paris, IP Paris' },
  { when: '2020–22', what: 'MSc, Data & AI', where: 'Institut Polytechnique de Paris' },
  { when: '2018–20', what: 'BSc, Electronics & Computer Science', where: 'Sorbonne Université' },
];

export const SERVICE = [
  'Reviewer for CVPR, NeurIPS, ECCV, IEEE TMM and IEEE TNNLS',
  'Teaching assistant: Deep Learning, Linear Models, Large-Scale ML (Télécom Paris)',
  'An Arabic-language YouTube channel explaining AI research',
];

export interface Publication {
  title:    string;
  authors:  string;
  venue:    string;
  year:     number;
  abbr:     string;
  badge:    'oral' | 'spotlight' | 'accepted' | 'preprint';
  arxiv:    string;
  code?:    string;
  abstract: string;
}

export const PUBLICATIONS: Publication[] = [
  {
    title:   'Ask and Remember: A Questions-Only Replay Strategy for Continual Visual Question Answering',
    authors: 'Imad Eddine Marouf, Enzo Tartaglione, Stéphane Lathuilière, Joost van de Weijer',
    venue:   'IEEE/CVF International Conference on Computer Vision (ICCV)',
    year:    2025,
    abbr:    'ICCV 2025',
    badge:   'accepted',
    arxiv:   'https://arxiv.org/abs/2502.04469',
    code:    'https://github.com/IemProg/QUAD',
    abstract: 'We present QUAD, a novel approach for Continual VQA that leverages only past task questions for regularization. By eliminating the need to store visual data, QUAD reduces memory overhead and privacy concerns while achieving state-of-the-art results on VQAv2 and NExT-QA.',
  },
  {
    title:   'Weighted Ensemble Models Are Strong Continual Learners',
    authors: 'Imad Eddine Marouf, Subhankar Roy, Enzo Tartaglione, Stéphane Lathuilière',
    venue:   'European Conference on Computer Vision (ECCV)',
    year:    2024,
    abbr:    'ECCV 2024',
    badge:   'oral',
    arxiv:   'https://arxiv.org/abs/2312.08977',
    code:    'https://github.com/IemProg/CoFiMA',
    abstract: 'We propose CoFiMA, a Fisher-weighted model averaging approach for continual learning. By selectively ensembling model parameters weighted by Fisher information, CoFiMA achieves an exceptional balance between stability and plasticity. Oral presentation — Top 3%.',
  },
  {
    title:   'Enhancing Plasticity for First Session Adaptation Continual Learning',
    authors: 'Imad Eddine Marouf, Subhankar Roy, Stéphane Lathuilière, Enzo Tartaglione',
    venue:   'Conference on Lifelong Learning Agents (CoLLAs)',
    year:    2025,
    abbr:    'CoLLAs 2025',
    badge:   'accepted',
    arxiv:   'https://arxiv.org/abs/2310.11482',
    code:    'https://github.com/IemProg/PLASTIC',
    abstract: 'PLASTIC reinstates plasticity in class-incremental learning while preserving model stability via test-time adaptation. Dynamically adjusting model parameters during inference enables continued learning without catastrophic forgetting.',
  },
  {
    title:   'Mini but Mighty: Finetuning ViTs with Mini Adapters',
    authors: 'Imad Eddine Marouf, Enzo Tartaglione, Stéphane Lathuilière',
    venue:   'IEEE/CVF Winter Conference on Applications of Computer Vision (WACV)',
    year:    2024,
    abbr:    'WACV 2024',
    badge:   'accepted',
    arxiv:   'https://arxiv.org/abs/2311.03873',
    abstract: 'MiMi is a training framework that progressively compresses adapter dimensions using a novel scoring function for neuron importance. Outperforms existing PETL methods across DomainNet, VTAB, and Multi-task benchmarks (29 datasets).',
  },
];

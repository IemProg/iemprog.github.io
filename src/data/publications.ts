export interface Publication {
  title: string;
  authors: string;
  venue: string;
  short: string; // e.g. "NeurIPS 2026"
  year: number;
  note?: string; // e.g. "Oral"
  name?: string; // method name, e.g. "CoFiMA"
  arxiv: string;
  paper?: string;
  code?: string;
  project?: string;
  image: string; // teaser figure in /public
  tldr: string; // one sentence
  abstract: string;
  selected?: boolean;
}

export const PUBLICATIONS: Publication[] = [
  {
    title: 'Decoupled Mode Connectivity for Base-to-Novel Generalization in Vision-Language Models',
    authors: 'Imad Eddine Marouf, Khalid Oublal, Enzo Tartaglione, Stéphane Lathuilière',
    venue: 'Conference on Neural Information Processing Systems',
    short: 'NeurIPS 2026',
    year: 2026,
    name: 'DMC',
    image: '/assets/img/papers/dmc_overview.png',
    tldr: 'Learns two prompts, one for seen classes and one for new ones, and merges them at test time for the cost of a single prompt.',
    project: 'https://iemprog.github.io/DMC/',
    arxiv: 'https://arxiv.org/abs/2611.09655',
    code: 'https://github.com/IemProg/DMC',
    selected: true,
    abstract:
      "Prompt learning pulls CLIP toward the classes it was trained on, while generalizing to new classes needs it to stay close to its zero-shot features. Both goals compete for the same prompt. DMC gives each goal its own prompt and merges them at test time, at the cost of a single prompt. Evaluated on 11 datasets.",
  },
  {
    title: 'Ask and Remember: A Questions-Only Replay Strategy for Continual Visual Question Answering',
    authors: 'Imad Eddine Marouf, Enzo Tartaglione, Stéphane Lathuilière, Joost van de Weijer',
    venue: 'IEEE/CVF International Conference on Computer Vision',
    short: 'ICCV 2025',
    year: 2025,
    name: 'QUAD',
    image: '/assets/img/papers/quad_main.png',
    tldr: 'Continual visual question answering that replays only past questions, without storing any images.',
    arxiv: 'https://arxiv.org/abs/2502.04469',
    paper:
      'https://openaccess.thecvf.com/content/ICCV2025/papers/Marouf_Ask_and_Remember_A_Questions-Only_Replay_Strategy_for_Continual_Visual_ICCV_2025_paper.pdf',
    code: 'https://github.com/IemProg/QUAD',
    selected: true,
    abstract:
      'QUAD tackles continual visual question answering by replaying only the questions from past tasks. No images are stored, which reduces memory and privacy costs. Evaluated on VQAv2 and NExT-QA.',
  },
  {
    title: 'Enhancing Plasticity for First Session Adaptation Continual Learning',
    authors: 'Imad Eddine Marouf, Subhankar Roy, Stéphane Lathuilière, Enzo Tartaglione',
    venue: 'Conference on Lifelong Learning Agents',
    short: 'CoLLAs 2025',
    year: 2025,
    name: 'PLASTIC',
    image: '/assets/img/papers/ttacil_preview.png',
    tldr: 'Uses test-time adaptation so a model keeps learning new classes after its first training session.',
    arxiv: 'https://arxiv.org/abs/2310.11482',
    code: 'https://github.com/IemProg/PLASTIC',
    abstract:
      'PLASTIC uses test-time adaptation to help a model keep learning new classes after its first training session, without forgetting earlier ones.',
  },
  {
    title: 'Weighted Ensemble Models Are Strong Continual Learners',
    authors: 'Imad Eddine Marouf, Subhankar Roy, Enzo Tartaglione, Stéphane Lathuilière',
    venue: 'European Conference on Computer Vision',
    short: 'ECCV 2024',
    year: 2024,
    note: 'Oral',
    name: 'CoFiMA',
    image: '/assets/img/papers/cofima_preview.png',
    tldr: 'Averages model weights across tasks, weighting each parameter by its Fisher information.',
    arxiv: 'https://arxiv.org/abs/2312.08977',
    paper: 'https://link.springer.com/chapter/10.1007/978-3-031-73209-6_18',
    code: 'https://github.com/IemProg/CoFiMA',
    selected: true,
    abstract:
      'CoFiMA averages model weights across tasks, weighting each parameter by its Fisher information. A simple way to balance keeping old knowledge with learning new tasks.',
  },
  {
    title: 'Mini but Mighty: Finetuning ViTs with Mini Adapters',
    authors: 'Imad Eddine Marouf, Enzo Tartaglione, Stéphane Lathuilière',
    venue: 'IEEE/CVF Winter Conference on Applications of Computer Vision',
    short: 'WACV 2024',
    year: 2024,
    name: 'MiMi',
    image: '/assets/img/papers/mimi_preview.png',
    tldr: 'Fine-tunes vision transformers with adapters that shrink during training, guided by neuron importance.',
    arxiv: 'https://arxiv.org/abs/2311.03873',
    paper:
      'https://openaccess.thecvf.com/content/WACV2024/papers/Marouf_Mini_but_Mighty_Finetuning_ViTs_With_Mini_Adapters_WACV_2024_paper.pdf',
    abstract:
      'MiMi fine-tunes vision transformers with adapters that shrink step by step, guided by a neuron-importance score. Evaluated on 29 datasets.',
  },
];

export const THESIS = {
  title: 'Beyond Fine-Tuning: Continual Adaptation of Pretrained Vision Models',
  school: 'Télécom Paris, Institut Polytechnique de Paris',
  year: 2026,
  advisors: 'Stéphane Lathuilière & Enzo Tartaglione',
};

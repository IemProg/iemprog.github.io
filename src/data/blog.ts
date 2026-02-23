export interface BlogPost {
  slug:        string;
  title:       string;
  date:        string;
  description: string;
  readTime:    number; // minutes
  url:         string;
}

export const POSTS: BlogPost[] = [
  {
    slug:        'understanding-cause-effect',
    title:       'Understanding the Cause-and-Effect Timeframes: The Delayed Gratification Advantage',
    date:        '2024-05-01',
    description: 'Real returns are built on understanding that the results we see today are the culmination of actions taken long ago. A meditation on playing the long game.',
    readTime:    8,
    url:         'https://imadmarouf.substack.com/p/understanding-the-cause-and-effect',
  },
  {
    slug:        'boat-go-faster',
    title:       'Does It Make The Boat Go Faster?',
    date:        '2024-06-15',
    description: 'Focus on what actually moves the needle. Olympic champion Ben Hunt-Davis\'s razor for ruthless prioritization applied to work and research.',
    readTime:    7,
    url:         'https://imadmarouf.substack.com/p/does-it-make-the-boat-go-faster-focus',
  },
  {
    slug:        'stop-guessing-build',
    title:       'How to Stop Guessing and Start Building Products People Actually Want',
    date:        '2024-06-18',
    description: 'Distilling the key ideas from Rob Fitzpatrick\'s The Mom Test — a detective toolkit for uncovering hidden desires and the truth about your product\'s potential.',
    readTime:    9,
    url:         '#',
  },
];

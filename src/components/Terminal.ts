export interface TerminalLine {
  text:   string;
  status: string;
  cls:    string;
}

export class Terminal {
  private started = false;

  constructor() {
    const section = document.getElementById('terminal');
    if (!section) return;

    const io = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          this.run();
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(section);
  }

  private run(): void {
    if (this.started) return;
    this.started = true;

    const label = document.getElementById('tlabel');
    if (label) label.classList.add('in');

    const lines = document.querySelectorAll<HTMLElement>('.term-line');
    lines.forEach((line, idx) => {
      setTimeout(() => this.typeLine(line), idx * 850);
    });
  }

  private typeLine(line: HTMLElement): void {
    line.style.opacity = '1';
    const raw      = (line.dataset['text'] ?? '').replace(/&quot;/g, '"');
    const status   = line.dataset['status'] ?? '';
    const cls      = line.dataset['cls'] ?? '';
    const content  = line.querySelector<HTMLElement>('.term-content')!;
    const tagEl    = line.querySelector<HTMLElement>('.term-tag')!;

    const CURSOR = '<span class="term-cursor">▌</span>';
    let i = 0;

    const type = (): void => {
      if (i <= raw.length) {
        const chunk = raw.slice(0, i).replace(
          /\[([^\]]+)\]/g,
          '<span class="term-date">[$1]</span>',
        );
        content.innerHTML = chunk + CURSOR;
        i++;
        setTimeout(type, 28 + Math.random() * 18);
      } else {
        content.innerHTML = raw.replace(
          /\[([^\]]+)\]/g,
          '<span class="term-date">[$1]</span>',
        );
        if (tagEl && status) {
          tagEl.textContent = status;
          if (cls) tagEl.classList.add(cls);
        }
      }
    };
    type();
  }
}

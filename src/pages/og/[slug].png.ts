/**
 * Build-time Open Graph cards for essays: /og/<post-id>.png (1200x630).
 * Rendered with satori (layout -> SVG) and resvg (SVG -> PNG); styled to match public/og.png.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getPosts, formatDate, primaryTag, type Post } from '../../lib/posts';
import { SITE } from '../../data/site';

const WIDTH = 1200;
const HEIGHT = 630;
const PAD_X = 104;

const C = {
  bg: '#fbfaf6',
  ink: '#1c1b19',
  muted: '#6b675f',
  rule: '#e6e2d8',
  accent: '#a33a20',
};

const fontDir = path.join(process.cwd(), 'src/assets/fonts');
const font = (file: string) => fs.readFileSync(path.join(fontDir, file));
const fonts = [
  { name: 'Newsreader', data: font('newsreader-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Newsreader', data: font('newsreader-latin-400-italic.woff'), weight: 400 as const, style: 'italic' as const },
  { name: 'Inter', data: font('inter-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
];

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

/**
 * Pick the largest title size whose (estimated) word-wrapped line count fits.
 * Newsreader averages roughly 0.46em per character; the estimate errs wide.
 */
function titleSize(title: string): number {
  const maxWidth = WIDTH - PAD_X * 2;
  const words = title.split(/\s+/);
  const steps: Array<[size: number, maxLines: number]> = [
    [84, 2],
    [72, 3],
    [64, 3],
    [58, 4],
    [52, 4],
  ];
  for (const [size, maxLines] of steps) {
    const perLine = Math.floor(maxWidth / (size * 0.47));
    let lines = 1;
    let used = 0;
    for (const w of words) {
      const len = used === 0 ? w.length : used + 1 + w.length;
      if (len > perLine && used > 0) {
        lines++;
        used = w.length;
      } else used = len;
    }
    if (lines <= maxLines) return size;
  }
  return 48;
}

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

function card(post: Post): Node {
  const tag = primaryTag(post);
  const meta = [tag?.label, formatDate(post.data.date)].filter(Boolean).join(' · ');
  const size = titleSize(post.data.title);

  return h(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      boxSizing: 'border-box', // satori defaults to content-box; padding must not grow the card
      display: 'flex',
      flexDirection: 'column',
      background: C.bg,
      paddingTop: 96,
      paddingBottom: 64,
      paddingLeft: PAD_X,
      paddingRight: PAD_X,
      fontFamily: 'Newsreader',
      color: C.ink,
    },
    [
      h('div', { width: 56, height: 3, background: C.accent, marginBottom: 36 }),
      h(
        'div',
        { flexGrow: 1, display: 'flex', flexDirection: 'column' },
        [
          h(
            'div',
            { width: WIDTH - PAD_X * 2, fontSize: size, lineHeight: 1.08, letterSpacing: '-0.01em', display: 'flex' },
            post.data.title,
          ),
          h(
            'div',
            { marginTop: 28, fontSize: 30, fontStyle: 'italic', color: C.muted, display: 'flex' },
            meta,
          ),
        ],
      ),
      h('div', { width: WIDTH - PAD_X * 2, height: 1, background: C.rule, marginBottom: 28 }),
      h(
        'div',
        { fontFamily: 'Inter', fontSize: 22, color: C.muted, display: 'flex' },
        `${SITE.name} · iemprog.github.io`,
      ),
    ],
  );
}

export const GET: APIRoute = async ({ props }) => {
  const svg = await satori(card((props as { post: Post }).post) as any, { width: WIDTH, height: HEIGHT, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};

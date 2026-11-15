# iemprog.github.io

Personal site of Imad Eddine Marouf: writing, research, about. Built with [Astro](https://astro.build), deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Develop

```sh
bun install
bun run dev      # http://localhost:4321
bun run build    # type-check + static build into dist/
```

## Write a post

Add a Markdown file to `src/content/posts/`. The filename becomes the URL (`/writing/<filename>/`).

```md
---
title: "Post title"
description: "One-line summary, shown in lists, RSS and link previews."
date: 2026-11-20
tags: ["research"]
draft: true        # visible in `bun run dev` only; remove to publish
---

Body in Markdown.
```

Posts appear on the home page, `/writing/`, and in `/rss.xml` automatically. To also email subscribers, paste the post into Substack and set `originalUrl` only if Substack was first.

## Update content

| What | Where |
| --- | --- |
| Papers, thesis | `src/data/publications.ts` (`selected: true` shows on home) |
| Experience, education, service | `src/data/experience.ts` |
| Name, email, links, nav | `src/data/site.ts` |
| Home / About copy | `src/pages/index.astro`, `src/pages/about.astro` |
| Design tokens (colors, type) | top of `src/styles/global.css` |

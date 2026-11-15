import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://iemprog.github.io',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  // Old URLs from the previous site keep working.
  redirects: {
    '/blog': '/writing/',
    '/publications': '/research/',
    '/projects': '/',
  },
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});

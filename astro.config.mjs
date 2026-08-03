// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // The Cloudflare Pages URL, used deliberately until a custom domain exists.
  // Base for canonical tags, Open Graph, the sitemap and the RSS feed, which
  // all need absolute URLs. When a domain is bought, change this and the
  // Sitemap line in public/robots.txt together — they must agree.
  site: 'https://madojapan.pages.dev',

  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
});
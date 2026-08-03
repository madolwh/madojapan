// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // PLACEHOLDER — this is the default Cloudflare Pages URL. Change it to the
  // real domain before launch: it is the base for canonical tags, Open Graph
  // URLs, the sitemap and the RSS feed, all of which need absolute URLs.
  site: 'https://madojapan.pages.dev',

  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
});
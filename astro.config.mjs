import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  output: 'static',
  // Preact, not React. The islands on this site are a menu, a counter and two
  // forms — about 1.6 KB of logic. React's runtime costs 56 KB gzipped to run
  // it, which blows the 30 KB budget in DESIGN.md §10 thirty-five times over
  // for the code that actually does something. `compat` aliases react ->
  // preact/compat, so the island source is unchanged.
  integrations: [preact({ compat: true }), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Never inline fonts as data: URIs. Vite does this for small assets by
      // default, which forces `font-src` to allow `data:` and defeats the
      // point of the directive. Emitted as real files they are also cacheable
      // under the immutable header on /_astro/, where an inlined font is
      // re-downloaded with every CSS change.
      assetsInlineLimit: (filePath) => (/\.(woff2?|ttf|otf|eot)$/i.test(filePath) ? false : undefined),
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
});

// @ts-check
import { defineConfig } from 'astro/config';

// Static output only: no server, no framework runtime in the browser.
export default defineConfig({
  site: 'https://cccy.im',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  // A strict Content-Security-Policy <meta> in every page, with hashes for each inline
  // script and style, so nothing injected can run.
  security: { csp: true },
  // Code in case studies is highlighted with classes (Prism), not inline styles (Shiki's
  // default), which that policy would block.
  markdown: { syntaxHighlight: 'prism' },
});

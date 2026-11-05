// @ts-check
import { defineConfig } from 'astro/config';

// Static output only: no server, no framework runtime in the browser.
export default defineConfig({
  site: 'https://cccy.im',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
});

import { defineConfig } from 'vite';
import { cpSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = import.meta.dirname;
const pages = readdirSync(root).filter((file) => file.endsWith('.html'));
let outputDirectory;
let isBuild = false;

export default defineConfig({
  publicDir: false,
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page.replace('.html', ''), resolve(root, page)])),
    },
  },
  plugins: [{
    name: 'static-site-assets',
    configResolved(config) {
      isBuild = config.command === 'build';
      outputDirectory = resolve(root, config.build.outDir);
    },
    closeBundle() {
      if (!isBuild) return;
      // Gallery paths are assembled at runtime and must retain their original names.
      for (const file of ['assets', 'CNAME', 'robots.txt', 'sitemap.xml']) {
        cpSync(resolve(root, file), resolve(outputDirectory, file), { recursive: true });
      }
    },
  }],
});

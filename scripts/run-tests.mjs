import { build } from 'vite';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
await build({
  configFile: false,
  logLevel: 'warn',
  build: {
    ssr: 'tests/game.test.ts',
    outDir: 'node_modules/.cache/draft-tests',
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: 'tests.mjs' } },
  },
});
await import(
  pathToFileURL(resolve('node_modules/.cache/draft-tests/tests.mjs')).href
);

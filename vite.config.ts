import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

declare const process: { env: Record<string, string | undefined> };

/** Fills in the build date shown under "About this build". */
function stampBuildDate(): Plugin {
  const now = new Date();
  const iso = now.toISOString().slice(0, 10);
  const display = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return {
    name: 'stamp-build-date',
    transformIndexHtml: (html) =>
      html.replaceAll('__BUILD_ISO__', iso).replaceAll('__BUILD_DATE__', display),
  };
}

// BASE_PATH is set by the Pages workflow to /<repo-name>/. Unset, the site serves from the root.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  build: { target: 'es2022' },
  plugins: [stampBuildDate()],
  test: { include: ['src/**/*.test.ts'] },
});

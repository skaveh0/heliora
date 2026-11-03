import { defineConfig } from 'vitest/config';

declare const process: { env: Record<string, string | undefined> };

// BASE_PATH is set by the Pages workflow to /<repo-name>/. Unset, the site serves from the root.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  build: { target: 'es2022' },
  test: { include: ['src/**/*.test.ts'] },
});

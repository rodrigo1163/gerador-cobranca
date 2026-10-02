import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '#test',
        replacement: resolve(process.cwd(), 'test'),
      },
      {
        find: '#',
        replacement: resolve(process.cwd(), 'src'),
      },
    ],
    tsconfigPaths: true,
  },
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
    setupFiles: ['./test/setup-e2e.ts'],
    hookTimeout: 120_000,
    testTimeout: 120_000,
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});

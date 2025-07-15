import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test/vitest.setup.ts'],
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
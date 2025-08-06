import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/demo/ron-reade/',
  test: {
    // Define globals to match your browser environment
    environment: 'jsdom',
    define: {
      'import.meta.env.BASE_URL': JSON.stringify('/demo/ron-reade/'),
    },
  },
});

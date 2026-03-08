/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        include: ['tests/**/*.{test,spec}.ts'],
        exclude: ['tests/e2e/**'],
        globals: true,
    },
});

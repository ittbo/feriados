import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Los tests de reglas necesitan el emulador de Firestore corriendo.
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    testTimeout: 20000,
    fileParallelism: false,
  },
});

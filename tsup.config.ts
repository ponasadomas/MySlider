import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/layouts.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'gsap', 'notyf', 'react-phone-number-input', 'use-sound'],
  treeshake: true,
  splitting: true,
});

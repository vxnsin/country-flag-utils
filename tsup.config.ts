import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outExtension: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.js' }),
  target: 'es2022',
  dts: true,
  sourcemap: false,
  clean: true,
  treeshake: true,
  minify: false,
});

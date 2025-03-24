import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'],
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: false,
  dts: true,
  bundle: false,
  format: ['cjs', 'esm'],
})

import { defineConfig } from 'tsup'

const env = process.env.NODE_ENV

export default defineConfig(() => ({
  sourcemap: env === 'production', // source map is only available in prod
  clean: true, // clean dist before build
  dts: true, // generate dts file for main module
  format: ['cjs', 'esm'], // generate cjs and esm files
  minify: env === 'production',
  bundle: true,
  watch: env === 'development',
  target: 'es2020',
  entry: ['src/index.ts'],
}))
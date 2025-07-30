import { defineConfig } from 'tsup';

export default defineConfig([
  // Main entry (server-safe only)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    outDir: 'dist',
    external: ['react', 'react-dom', 'next', 'swr'],
    platform: 'neutral',
    target: 'node14',
  },
  // Server entry
  {
    entry: ['src/server/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist',
    outExtension: ({ format }) => ({
      js: format === 'cjs' ? '.js' : '.mjs',
      dts: '.d.ts',
    }),
    external: ['react', 'react-dom', 'next', 'swr'],
    platform: 'node',
    target: 'node14',
    splitting: false,
  },
  // Client entry (browser-specific)
  {
    entry: ['src/client/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist',
    outExtension: ({ format }) => ({
      js: format === 'cjs' ? '.js' : '.mjs',
      dts: '.d.ts',
    }),
    external: ['react', 'react-dom', 'next'],
    platform: 'browser',
    target: 'es2020',
    splitting: false,
  },
]);
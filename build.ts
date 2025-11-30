import { build } from 'esbuild';

await build({
  entryPoints: ['src/client/main.ts'],
  bundle: true,
  outfile: 'public/bundle.js',
  format: 'esm',
  minify: true,
  sourcemap: true,
  target: 'es2020',
});

console.log('built');

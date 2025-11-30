import { spawn } from 'bun';
import { watch } from 'fs';

const buildCss = () => {
  const proc = spawn([
    'bunx',
    'tailwindcss',
    '-i',
    './public/styles.css',
    '-o',
    './public/output.css',
    '--minify',
  ]);
  return proc.exited;
};

const buildJs = () => {
  const proc = spawn(['bun', 'run', 'build.ts']);
  return proc.exited;
};

console.log('building...');
await Promise.all([buildCss(), buildJs()]);
console.log('done');

console.log('watching...');
watch('./src/client', { recursive: true }, () => {
  console.log('rebuilding js...');
  buildJs();
});

watch('./public/styles.css', () => {
  console.log('rebuilding css...');
  buildCss();
});

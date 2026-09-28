import { cp, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

if (dist === root || !dist.startsWith(`${root}${sep}`)) {
  throw new Error('Refusing to clean a path outside the project root.');
}

await import('./build.mjs');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const entries = await readdir(root, { withFileTypes: true });
const runtimeFiles = entries
  .filter(entry => entry.isFile() && (entry.name.endsWith('.html') || ['papers.js', 'script.js', 'styles.css'].includes(entry.name)))
  .map(entry => entry.name);

for (const file of runtimeFiles) {
  await cp(resolve(root, file), resolve(dist, file));
}

for (const directory of ['generated', 'imgs']) {
  await cp(resolve(root, directory), resolve(dist, directory), { recursive: true });
}

console.log(`Published ${runtimeFiles.length} runtime file(s) and 2 asset directorie(s) to dist/`);

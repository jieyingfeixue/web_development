import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'data', 'papers.json');
const output = resolve(root, 'generated', 'papers-data.js');
const papers = JSON.parse(await readFile(source, 'utf8'));

if (!Array.isArray(papers)) throw new Error('data/papers.json must contain an array');
for (const paper of papers) {
  if (!paper.id || !paper.title || !Array.isArray(paper.authors)) {
    throw new Error(`Each paper needs id, title and authors: ${paper.id ?? '(missing id)'}`);
  }
  paper.authors.forEach((author, index) => {
    if (!author.id || !author.name) throw new Error(`Invalid author in ${paper.id}`);
    author.position ??= index + 1;
  });
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, `window.PAPER_DATA = ${JSON.stringify(papers, null, 2)};\n`, 'utf8');
console.log(`Generated ${papers.length} papers → generated/papers-data.js`);

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const partials = resolve(root, 'partials');
const header = await readFile(resolve(partials, 'header.html'), 'utf8');
const footer = await readFile(resolve(partials, 'footer.html'), 'utf8');

const withLayout = (html, tag, marker, markup) => {
  const markerPattern = new RegExp(`<!-- ${marker} -->[\\s\\S]*?<!-- /${marker} -->`, 'g');
  const replacement = `<!-- ${marker} -->\n${markup.trim()}\n<!-- /${marker} -->`;
  if (markerPattern.test(html)) return html.replace(markerPattern, replacement);

  const legacyPattern = new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, 'i');
  if (!legacyPattern.test(html)) throw new Error(`Missing ${tag} in page`);
  return html.replace(legacyPattern, replacement);
};

const pages = (await readdir(root, { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
  .map(entry => entry.name);

for (const page of pages) {
  const path = resolve(root, page);
  const before = await readFile(path, 'utf8');
  const afterHeader = withLayout(before, 'header', 'SITE_HEADER', header);
  const after = withLayout(afterHeader, 'footer', 'SITE_FOOTER', footer);
  if (after !== before) await writeFile(path, after, 'utf8');
}

console.log(`Applied shared header/footer to ${pages.length} page(s)`);

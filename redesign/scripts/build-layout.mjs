// 把 partials/header.html 与 partials/footer.html 注入所有页面。
// 首次运行会把内联的 <header>/<footer> 替换成标记块；之后再运行只更新标记块内容，
// 因此是幂等的，可以反复跑。
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const partials = resolve(root, 'partials');
const header = await readFile(resolve(partials, 'header.html'), 'utf8');
const footer = await readFile(resolve(partials, 'footer.html'), 'utf8');

const apply = (html, marker, tag, markup) => {
  const block = `<!-- ${marker} -->\n${markup.trim()}\n<!-- /${marker} -->`;
  const markerPattern = new RegExp(`<!-- ${marker} -->[\\s\\S]*?<!-- /${marker} -->`);
  if (markerPattern.test(html)) return html.replace(markerPattern, block);

  const legacyPattern = new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, 'i');
  if (!legacyPattern.test(html)) throw new Error(`页面缺少 <${tag}>，无法注入 ${marker}`);
  return html.replace(legacyPattern, block);
};

const pages = (await readdir(root, { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
  .map(entry => entry.name);

let changed = 0;
for (const page of pages) {
  const path = resolve(root, page);
  const before = await readFile(path, 'utf8');
  const after = apply(apply(before, 'SITE_HEADER', 'header', header), 'SITE_FOOTER', 'footer', footer);
  if (after !== before) {
    await writeFile(path, after, 'utf8');
    changed += 1;
  }
}

console.log(`公共头尾已注入：${pages.length} 个页面，本次更新 ${changed} 个`);

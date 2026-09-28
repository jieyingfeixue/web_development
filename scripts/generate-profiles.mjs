import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const members = JSON.parse(await readFile(resolve(root, 'data', 'members.json'), 'utf8'));

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const markdownToHtml = (markdown) => {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const output = [];
  let paragraph = [];
  let list = [];
  const inline = (text) => escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  const flushParagraph = () => { if (paragraph.length) { output.push(`<p>${inline(paragraph.join(' '))}</p>`); paragraph = []; } };
  const flushList = () => { if (list.length) { output.push(`<ul>${list.map(item => `<li>${inline(item)}</li>`).join('')}</ul>`); list = []; } };
  for (const line of lines) {
    if (/^###\s+/.test(line)) { flushParagraph(); flushList(); output.push(`<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`); }
    else if (/^[-*]\s+/.test(line)) { flushParagraph(); list.push(line.replace(/^[-*]\s+/, '')); }
    else if (!line.trim()) { flushParagraph(); flushList(); }
    else { flushList(); paragraph.push(line.trim()); }
  }
  flushParagraph(); flushList();
  return output.join('\n');
};

const template = (member, bioHtml) => `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${escapeHtml(member.name)}${escapeHtml(member.title)}个人简历 · 空天智能与智造研究所" />
  <title>${escapeHtml(member.name)} · 空天智能与智造研究所</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
<div class="site-shell">
  <!-- SITE_HEADER -->
<!-- /SITE_HEADER -->
  <main>
    <section class="page-hero profile-hero"><div class="wrap"><span class="index">04 / PEOPLE / PROFILE</span><h1>${escapeHtml(member.name)} <span class="profile-role">${escapeHtml(member.title)}</span></h1><p>${escapeHtml(member.affiliation)}<br>${escapeHtml(member.unit)}</p></div></section>
    <section class="section"><div class="wrap split"><aside class="aside-note"><img class="profile-photo" src="${escapeHtml(member.photo)}" alt="${escapeHtml(member.name)}照片"><strong>研究方向</strong><br><br>${member.researchAreas.map(area => `${escapeHtml(area)}<br>`).join('')}${member.email ? `<br><strong>联系邮箱</strong><br><span class="profile-email">Email: ${escapeHtml(member.email)}</span>` : ''}</aside><div class="prose profile-prose" data-reveal>${bioHtml}</div></div></section>
    <section class="section"><div class="wrap"><div class="section-head"><div><div class="section-kicker">Selected Publications</div><h2>代表性论文</h2></div></div><div id="profile-publications" data-member-id="${escapeHtml(member.id)}" data-member-name="${escapeHtml(member.name)}" data-member-name-en="${escapeHtml(member.nameEn || '')}" data-member-author-names="${escapeHtml(JSON.stringify(member.authorNames || []))}" class="paper-stack profile-publication-list" data-reveal></div></div></section>
  </main>
  <!-- SITE_FOOTER -->
<!-- /SITE_FOOTER -->
</div><script src="script.js"></script><script src="generated/papers-data.js"></script><script src="papers.js"></script>
</body>
</html>`;

for (const member of members) {
  const bio = await readFile(resolve(root, member.bio), 'utf8');
  await writeFile(resolve(root, `${member.id}.html`), template(member, markdownToHtml(bio)), 'utf8');
}
console.log(`Generated ${members.length} profile page(s)`);

const groupConfig = {
  facultyResearch: { groups: ['faculty', 'researcher'], kicker: 'Faculty & Research', title: '教师与研究人员' },
  technician: { groups: ['technician'], kicker: 'Technical Staff', title: '实验技术人员' },
  student: { groups: ['student'], kicker: 'Students', title: '学生' }
};

const knownGroups = new Set(Object.values(groupConfig).flatMap(config => config.groups));

const inferGroup = (member) => {
  if (knownGroups.has(member.group)) return member.group;
  if (/(教授|副教授|讲师|教师)/.test(member.title)) return 'faculty';
  if (/(研究员|研究人员|博士后|博后|科研助理)/.test(member.title)) return 'researcher';
  if (/(实验师|实验技术|工程师|技术员)/.test(member.title)) return 'technician';
  return 'student';
};

const memberCard = (member) => {
  const portrait = member.photo
    ? `<div class="portrait has-photo"><img src="${escapeHtml(member.photo)}" alt="${escapeHtml(member.name)}照片" loading="lazy"></div>`
    : '<div class="portrait"></div>';
  const areas = (member.researchAreas || []).slice(0, 3).map(area => escapeHtml(area)).join(' · ');
  return `<a class="person person-link" href="${escapeHtml(member.id)}.html">${portrait}<div class="person-body"><h3>${escapeHtml(member.name)}</h3><p>${escapeHtml(member.title)}${areas ? `<br>${areas}` : ''}</p><span class="person-more">查看完整简历 ↗</span></div></a>`;
};

const teamSections = Object.entries(groupConfig).map(([group, config]) => {
  const groupMembers = members.filter(member => config.groups.includes(inferGroup(member)));
  if (!groupMembers.length) return '';
  return `<section class="section"><div class="wrap"><div class="section-head"><div><div class="section-kicker">${config.kicker}</div><h2>${config.title}</h2></div></div><div class="team-grid" data-reveal>${groupMembers.map(memberCard).join('')}</div></div></section>`;
}).join('');

const teamPage = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>团队 · 空天智能与智造研究所</title><link rel="stylesheet" href="styles.css"></head><body><div class="site-shell">
<!-- SITE_HEADER -->
<!-- /SITE_HEADER -->
<main><section class="page-hero"><div class="wrap"><span class="index">04 / PEOPLE</span><h1>团队成员</h1><p>汇聚教师、研究人员与学生，围绕空天智能与先进制造开展协同研究。</p></div></section>${teamSections}</main>
<!-- SITE_FOOTER -->
<!-- /SITE_FOOTER -->
</div><script src="script.js"></script></body></html>`;

await writeFile(resolve(root, 'team.html'), teamPage, 'utf8');
console.log(`Generated team page with ${members.length} member(s)`);

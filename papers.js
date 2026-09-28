const paperList = document.querySelector('#publication-list');
const paperSearch = document.querySelector('#paper-search');
const paperCount = document.querySelector('#paper-count');
const papers = Array.isArray(window.PAPER_DATA) ? window.PAPER_DATA : [];

const categoryOf = (paper) => {
  const value = String(paper.category || paper.kind || paper.type || '').trim().toLowerCase();
  if (/monograph|专著/.test(value)) return 'monograph';
  if (/textbook|教材/.test(value)) return 'textbook';
  return 'paper';
};

const sortByYear = (a, b) => (b.year || 0) - (a.year || 0);
const normalizeIdentity = (value) => String(value || '').toLocaleLowerCase().replace(/[\s.,'’_\-]/g, '');
const authorIdentities = (author) => [author.id, author.name, ...(Array.isArray(author.aliases) ? author.aliases : [])].filter(Boolean);
const matchesIdentity = (author, identities) => authorIdentities(author).some(authorIdentity => {
  const normalizedAuthor = normalizeIdentity(authorIdentity);
  return identities.some(identity => normalizedAuthor && normalizedAuthor === normalizeIdentity(identity));
});

const renderMedia = (paper) => {
  if (!Array.isArray(paper.images) || paper.images.length === 0) return '';
  return `<div class="paper-media" aria-label="论文配图"><div class="paper-media-track">${paper.images.map((image, index) => `<figure><img src="${image.src}" alt="${image.alt || `${paper.title}配图${index + 1}`}" loading="lazy"><figcaption>${image.caption || ''}</figcaption></figure>`).join('')}</div></div>`;
};

const renderPaper = (paper, memberId = '') => {
  const authors = paper.authors || [];
  const memberIdentities = Array.isArray(memberId) ? memberId : [memberId];
  const authorLine = authors.map(author => `<span class="author-chip ${matchesIdentity(author, memberIdentities) ? 'is-current' : ''}">${author.name}</span>`).join('');
  const sourceLink = paper.doi || paper.dblp || paper.url || paper.link;
  const sourceLabel = paper.doi ? 'DOI' : paper.dblp ? 'DBLP' : '链接';
  const publicationDetails = [paper.venue || paper.publisher, paper.isbn ? `ISBN ${paper.isbn}` : ''].filter(Boolean).join(' · ');
  return `<article class="paper-card"><div class="paper-card-main"><div class="paper-type">${paper.type || 'PAPER'} · ${paper.year || ''}</div><h3>${paper.title}</h3><p class="paper-authors">${authorLine}</p>${publicationDetails ? `<p class="paper-venue">${publicationDetails}${sourceLink ? ` · <a href="${sourceLink}" target="_blank" rel="noreferrer">${sourceLabel} ↗</a>` : ''}</p>` : ''}${paper.abstract ? `<p class="paper-abstract">${paper.abstract}</p>` : ''}</div>${renderMedia(paper)}</article>`;
};

const render = (query = '') => {
  const keyword = query.trim().toLowerCase();
  const filtered = papers.filter(paper => !keyword || JSON.stringify(paper).toLowerCase().includes(keyword));
  const authorCount = new Set(filtered.flatMap(paper => paper.authors.map(author => author.id))).size;
  paperCount.textContent = `${filtered.length} 篇论文 · ${authorCount} 位作者`;
  if (!filtered.length) {
    paperList.innerHTML = '<div class="paper-empty"><strong>暂无论文记录。</strong></div>';
    return;
  }
  paperList.innerHTML = `<div class="paper-stack">${filtered.sort(sortByYear).map(paper => renderPaper(paper)).join('')}</div>`;
};

paperSearch?.addEventListener('input', event => render(event.target.value));
if (paperList) render(new URLSearchParams(location.search).get('q') || '');

const profilePublications = document.querySelector('#profile-publications');
if (profilePublications) {
  let authorNames = [];
  try {
    const parsedAuthorNames = JSON.parse(profilePublications.dataset.memberAuthorNames || '[]');
    authorNames = Array.isArray(parsedAuthorNames) ? parsedAuthorNames : [parsedAuthorNames];
  } catch {
    authorNames = [];
  }
  const memberIdentities = [
    profilePublications.dataset.memberId,
    profilePublications.dataset.memberName,
    profilePublications.dataset.memberNameEn,
    ...authorNames
  ].filter(Boolean);
  const memberPapers = memberIdentities.length
    ? papers.filter(paper => (paper.authors || []).some(author => matchesIdentity(author, memberIdentities))).sort(sortByYear)
    : [];
  profilePublications.innerHTML = memberPapers.length
    ? memberPapers.map(paper => renderPaper(paper, memberIdentities)).join('')
    : '<div class="paper-empty"><strong>暂无论文记录。</strong></div>';
}

const labPublications = document.querySelector('#lab-publications');
if (labPublications) {
  const selectedPapers = [...papers].sort(sortByYear);
  labPublications.innerHTML = selectedPapers.length
    ? selectedPapers.map(paper => renderPaper(paper)).join('')
    : '<div class="paper-empty"><strong>暂无论文记录。</strong></div>';
}

const researchPublications = document.querySelector('#research-publications');
if (researchPublications) {
  const selectedPapers = [...papers].sort(sortByYear);
  researchPublications.innerHTML = selectedPapers.length
    ? selectedPapers.map(paper => renderPaper(paper)).join('')
    : '<div class="paper-empty"><strong>暂无论文成果。</strong></div>';
}

const researchOutputColumns = {
  paper: document.querySelector('#research-papers'),
  monograph: document.querySelector('#research-monographs'),
  textbook: document.querySelector('#research-textbooks')
};

const researchOutputLabels = {
  paper: ['暂无论文成果。', '论文记录会从 data/papers.json 自动加载。'],
  monograph: ['暂无专著成果。', '新增记录时将 category 设置为 monograph。'],
  textbook: ['暂无教材成果。', '新增记录时将 category 设置为 textbook。']
};

Object.entries(researchOutputColumns).forEach(([category, container]) => {
  if (!container) return;
  const selected = papers.filter(paper => categoryOf(paper) === category).sort(sortByYear);
  const [emptyTitle, emptyHint] = researchOutputLabels[category];
  container.innerHTML = selected.length
    ? selected.map(paper => renderPaper(paper)).join('')
    : `<div class="paper-empty"><strong>${emptyTitle}</strong><span>${emptyHint}</span></div>`;
});

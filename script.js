const toggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

document.querySelectorAll('[data-reveal]').forEach((el) => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  io.observe(el);
});

const current = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('a[href="lab.html"]').forEach((link) => {
  link.setAttribute('href', 'index.html');
  if (link.closest('.nav-links') || link.textContent.trim() === '研究所') link.textContent = '首页';
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  if (link.getAttribute('href') === current) link.classList.add('active');
});

document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('[data-type]').forEach((item) => {
      item.style.display = (filter === 'all' || item.dataset.type === filter) ? '' : 'none';
    });
  });
});
const topbar = document.querySelector('.topbar');
if (topbar && !document.querySelector('.campaign-banner')) {
  topbar.insertAdjacentHTML('beforebegin', '<aside class="campaign-banner"><div class="wrap campaign-inner"><span class="campaign-flag-sprite" role="img" aria-label="中华人民共和国国旗飘扬动画"></span><span class="campaign-mark">AIIM LAB / 2026</span><h2 class="campaign-title">招募志同道合的伙伴</h2><span class="campaign-copy">硕博研究生 · 本科生入组访学 · 博士后 · 产学研合作</span><a class="campaign-link" href="join.html">了解招募 ↗</a><button class="campaign-toggle" type="button" aria-expanded="true">收起 −</button></div></aside>');
}

document.querySelectorAll('.campaign-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const banner = button.closest('.campaign-banner');
    const collapsed = banner.classList.toggle('is-collapsed');
    button.textContent = collapsed ? '展开招募 +' : '收起 −';
    button.setAttribute('aria-expanded', String(!collapsed));
  });
});

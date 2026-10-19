(() => {
  const shell = document.querySelector('.wheel-shell');
  if (!shell) return;
  const slides = [...shell.querySelectorAll('.wheel-slide')];
  const dots = shell.querySelector('.wheel-dots');
  const title = document.querySelector('#wheelTitle');
  const kicker = document.querySelector('#wheelKicker');
  const desc = document.querySelector('#wheelDesc');
  const current = document.querySelector('#wheelCurrent');
  let active = 0;
  let timer;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `展示第 ${index + 1} 张图片`);
    dot.addEventListener('click', () => show(index, true));
    dots.appendChild(dot);
  });

  function positionFor(index) {
    let distance = (index - active + slides.length) % slides.length;
    if (distance > slides.length / 2) distance -= slides.length;
    if (distance === 0) return 'is-active';
    if (distance === -1) return 'is-prev';
    if (distance === 1) return 'is-next';
    return 'is-far';
  }

  function show(index, restart = false) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.className = `wheel-slide ${positionFor(i)}`;
      slide.setAttribute('aria-hidden', i === active ? 'false' : 'true');
    });
    [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === active));
    const slide = slides[active];
    kicker.textContent = slide.dataset.kicker;
    title.textContent = slide.dataset.title;
    desc.textContent = slide.dataset.desc;
    current.textContent = String(active + 1).padStart(2, '0');
    if (restart) start();
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => show(active + 1), 5200);
  }

  shell.querySelector('.wheel-prev').addEventListener('click', () => show(active - 1, true));
  shell.querySelector('.wheel-next').addEventListener('click', () => show(active + 1, true));
  slides.forEach((slide, index) => slide.addEventListener('click', () => index !== active && show(index, true)));
  shell.addEventListener('mouseenter', () => clearInterval(timer));
  shell.addEventListener('mouseleave', start);
  shell.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') show(active - 1, true);
    if (event.key === 'ArrowRight') show(active + 1, true);
  });
  show(0);
  start();
})();

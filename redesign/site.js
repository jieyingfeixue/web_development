(() => {
  const toggle=document.querySelector('.mobile-toggle'); const nav=document.querySelector('.fusion-top .nav');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
  document.querySelectorAll('.nav-group').forEach(group=>{const parent=group.querySelector('.nav-parent');parent?.addEventListener('click',e=>{if(matchMedia('(max-width:900px)').matches){e.preventDefault();group.classList.toggle('open');}});});
  const shell=document.querySelector('.wheel-shell'); if(!shell)return;
  const slides=[...shell.querySelectorAll('.wheel-slide')],dots=shell.querySelector('.wheel-dots'); let active=0,timer;
  slides.forEach((_,i)=>{const d=document.createElement('button');d.type='button';d.setAttribute('aria-label',`展示第 ${i+1} 张图片`);d.addEventListener('click',()=>show(i,true));dots.appendChild(d);});
  function pos(i){let d=(i-active+slides.length)%slides.length;if(d>slides.length/2)d-=slides.length;return d===0?'is-active':d===-1?'is-prev':d===1?'is-next':'is-far';}
  function show(i,restart=false){active=(i+slides.length)%slides.length;slides.forEach((s,n)=>{s.className=`wheel-slide ${pos(n)}`;s.setAttribute('aria-hidden',n===active?'false':'true');});[...dots.children].forEach((d,n)=>d.classList.toggle('active',n===active));const s=slides[active];document.querySelector('#wheelKicker').textContent=s.dataset.kicker;document.querySelector('#wheelTitle').textContent=s.dataset.title;document.querySelector('#wheelDesc').textContent=s.dataset.desc;document.querySelector('#wheelCurrent').textContent=String(active+1).padStart(2,'0');if(restart)start();}
  function start(){clearInterval(timer);timer=setInterval(()=>show(active+1),5200);} shell.querySelector('.wheel-prev').addEventListener('click',()=>show(active-1,true));shell.querySelector('.wheel-next').addEventListener('click',()=>show(active+1,true));slides.forEach((s,i)=>s.addEventListener('click',()=>i!==active&&show(i,true)));shell.addEventListener('mouseenter',()=>clearInterval(timer));shell.addEventListener('mouseleave',start);show(0);start();
})();
(() => {
  // 研究所页：新闻轮播（自动播放，悬停/聚焦暂停）
  const root=document.querySelector('.inst-carousel-shell'); if(!root)return;
  const track=root.querySelector('.inst-track');
  const slides=[...root.querySelectorAll('.inst-slide')];
  const dots=root.querySelector('.inst-dots');
  const counter=root.querySelector('.inst-counter');
  let i=0,timer;
  function go(n){
    i=(n+slides.length)%slides.length;
    track.style.transform=`translateX(-${i*100}%)`;
    [...dots.children].forEach((d,k)=>d.classList.toggle('active',k===i));
    counter.textContent=`${String(i+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    slides.forEach((s,k)=>s.setAttribute('aria-hidden',k===i?'false':'true'));
  }
  function start(){clearInterval(timer);if(!matchMedia('(prefers-reduced-motion: reduce)').matches){timer=setInterval(()=>go(i+1),6000);}}
  slides.forEach((_,n)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`第 ${n+1} 条新闻`);b.addEventListener('click',()=>{go(n);start();});dots.appendChild(b);});
  root.querySelector('.inst-prev').addEventListener('click',()=>{go(i-1);start();});
  root.querySelector('.inst-next').addEventListener('click',()=>{go(i+1);start();});
  root.addEventListener('mouseenter',()=>clearInterval(timer));
  root.addEventListener('mouseleave',start);
  root.addEventListener('focusin',()=>clearInterval(timer));
  root.addEventListener('focusout',start);
  go(0); start();
})();
(() => {
  // 团队卡片：文字超出卡片高度时，底部渐隐提示「下面还有」
  const zones=[...document.querySelectorAll('.team-card-scroll')]; if(!zones.length)return;
  const sync=el=>{const more=el.scrollHeight-el.clientHeight-el.scrollTop>2;el.closest('.team-card-scrollwrap')?.classList.toggle('has-more',more);};
  zones.forEach(el=>{sync(el);el.addEventListener('scroll',()=>sync(el),{passive:true});});
  addEventListener('resize',()=>zones.forEach(sync));
})();
(() => {
  const visual=document.querySelector('.news-visual'); if(!visual)return;
  const image=visual.querySelector('img'),kicker=document.querySelector('#newsKicker'),title=document.querySelector('#newsTitle'),summary=document.querySelector('#newsSummary');
  const items=[...document.querySelectorAll('.news-item')];
  function show(item){if(item.classList.contains('active'))return;items.forEach(node=>node.classList.toggle('active',node===item));visual.classList.add('is-changing');const preload=new Image();preload.onload=()=>{image.src=item.dataset.image;image.alt=item.dataset.title;kicker.textContent=item.dataset.kicker;title.textContent=item.dataset.title;summary.textContent=item.dataset.summary;requestAnimationFrame(()=>visual.classList.remove('is-changing'));};preload.src=item.dataset.image;}
  items.forEach(item=>{item.addEventListener('mouseenter',()=>show(item));item.addEventListener('focus',()=>show(item));item.addEventListener('click',()=>show(item));});
})();
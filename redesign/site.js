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

(() => {
  // 首页整屏滚动：桌面端滚轮一次切换一个主要板块，小屏幕保留自然滚动。
  const page=document.querySelector('.home-fullpage');
  if(!page)return;

  const desktop=matchMedia('(min-width: 901px) and (min-height: 820px)');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const panels=[...page.querySelectorAll(
    '.fusion-hero, .fusion-news, .fusion-research, .fusion-products, .fusion-outputs, .fusion-team-home, .site-footer'
  )];
  if(!panels.length)return;

  const labels=['首页','新闻','研究','产品','成果','团队','链接'];
  const rail=document.createElement('nav');
  rail.className='fullpage-rail';
  rail.setAttribute('aria-label','首页板块导航');
  panels.forEach((panel,index)=>{
    panel.classList.add('fullpage-panel');
    const button=document.createElement('button');
    button.type='button';
    button.innerHTML=`<span>${String(index+1).padStart(2,'0')}</span><b>${labels[index]}</b>`;
    button.setAttribute('aria-label',`前往${labels[index]}板块`);
    button.addEventListener('click',()=>go(index));
    rail.appendChild(button);
  });
  page.appendChild(rail);

  let active=0;
  let locked=false;
  let wheelTotal=0;
  let wheelReset;

  const headerOffset=()=>page.querySelector('.fusion-top')?.offsetHeight||0;
  const nearestPanel=()=>{
    const offset=headerOffset();
    let best=0;
    let distance=Infinity;
    panels.forEach((panel,index)=>{
      const next=Math.abs(panel.getBoundingClientRect().top-offset);
      if(next<distance){distance=next;best=index;}
    });
    return best;
  };

  const syncRail=index=>{
    active=index;
    [...rail.children].forEach((button,i)=>{
      button.classList.toggle('active',i===index);
      if(i===index)button.setAttribute('aria-current','true');
      else button.removeAttribute('aria-current');
    });
  };

  function go(index){
    if(!desktop.matches)return;
    const next=Math.max(0,Math.min(panels.length-1,index));
    locked=true;
    syncRail(next);
    panels[next].scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});
    window.setTimeout(()=>{locked=false;},reducedMotion.matches?80:850);
  }

  const canConsumeWheel=target=>{
    const scrollable=target.closest?.('[data-native-scroll], .team-card-scroll, .bridge-step-scroll, .bridge-papers-scroll');
    if(!scrollable)return false;
    return scrollable.scrollHeight>scrollable.clientHeight;
  };

  addEventListener('wheel',event=>{
    if(!desktop.matches||event.ctrlKey||canConsumeWheel(event.target))return;
    event.preventDefault();
    if(locked)return;
    wheelTotal+=event.deltaY;
    clearTimeout(wheelReset);
    wheelReset=setTimeout(()=>{wheelTotal=0;},180);
    if(Math.abs(wheelTotal)<32)return;
    const direction=wheelTotal>0?1:-1;
    wheelTotal=0;
    go(nearestPanel()+direction);
  },{passive:false});

  addEventListener('keydown',event=>{
    if(!desktop.matches||event.defaultPrevented||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
    const nextKeys=['PageDown','ArrowDown',' '];
    const prevKeys=['PageUp','ArrowUp'];
    if(nextKeys.includes(event.key)){event.preventDefault();go(nearestPanel()+1);}
    else if(prevKeys.includes(event.key)){event.preventDefault();go(nearestPanel()-1);}
    else if(event.key==='Home'){event.preventDefault();go(0);}
    else if(event.key==='End'){event.preventDefault();go(panels.length-1);}
  });

  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(visible)syncRail(panels.indexOf(visible.target));
  },{threshold:[.35,.55,.75]});
  panels.forEach(panel=>observer.observe(panel));

  const syncMode=()=>{
    page.classList.toggle('fullpage-enabled',desktop.matches);
    rail.hidden=!desktop.matches;
    if(desktop.matches)syncRail(nearestPanel());
  };
  desktop.addEventListener('change',syncMode);
  syncMode();
})();

(() => {
  // 成果页：顶部下拉与页内导航在本页滚动到对应成果区块，不重新加载页面
  const links=document.querySelectorAll('.nav-dropdown a[href*="achievements.html#"], .subnav a[href^="#"]');
  links.forEach(link=>{
    link.addEventListener('click',event=>{
      const url=new URL(link.href,location.href);
      if(url.pathname!==location.pathname||!url.hash)return;
      const target=document.querySelector(url.hash);
      if(!target)return;
      event.preventDefault();
      target.scrollIntoView({behavior:'instant',block:'start'});
      try{history.replaceState(null,'',url.hash);}catch(e){}
      document.querySelector('.fusion-top .nav')?.classList.remove('open');
      document.querySelector('.mobile-toggle')?.setAttribute('aria-expanded','false');
      document.querySelectorAll('.nav-group.open').forEach(group=>group.classList.remove('open'));
    });
  });
})();

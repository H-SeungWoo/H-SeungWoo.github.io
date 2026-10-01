// Non-blocking, first-visit hints. Only an explicit dismissal or use is remembered.
export function setupGuide(){
  const storageKey='personal-records:guide:v1';
  let seen={};
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))seen=saved}catch{}
  const overlay=document.createElement('aside');
  overlay.className='first-visit-guide';overlay.setAttribute('aria-label','처음 방문 안내');
  const hints={
    lp:{target:document.querySelector('#scene'),label:'01 · MUSIC',copy:'레코드를 눌러 음악을 재생해보세요.',close:'음악 재생 안내 닫기'},
    portfolio:{target:document.querySelector('#album-detail'),label:'02 · PORTFOLIO',copy:'이곳을 눌러 포트폴리오를 펼쳐보세요.',close:'포트폴리오 안내 닫기'},
    sound:{target:document.querySelector('#sound'),label:'SOUND CONTROL',copy:'SOUND를 눌러 소리를 켜고 끄거나 음량을 조절해보세요.',close:'소리 조절 안내 닫기'},
  };
  let soundEligible=false,frame=0;
  function remember(key){
    seen[key]=true;
    try{localStorage.setItem(storageKey,JSON.stringify(seen))}catch{}
    refresh();
  }
  for(const [key,hint] of Object.entries(hints)){
    const note=document.createElement('div');note.className='guide-note';note.dataset.guide=key;note.hidden=true;note.setAttribute('role','note');
    const label=document.createElement('span');label.className='guide-label';label.textContent=hint.label;
    const copy=document.createElement('p');copy.id=`guide-${key}-message`;copy.textContent=hint.copy;
    const close=document.createElement('button');close.className='guide-close';close.type='button';close.textContent='×';close.setAttribute('aria-label',hint.close);
    close.addEventListener('click',()=>{remember(key);const target=key==='lp'&&hint.target.tabIndex<0?document.querySelector('#rotation'):hint.target;target.focus({preventScroll:true})});
    const line=document.createElement('span');line.className='guide-line';line.setAttribute('aria-hidden','true');
    note.append(label,close,copy,line);overlay.append(note);Object.assign(hint,{note,line,copy});
  }
  document.body.append(overlay);
  function show(hint,visible){
    hint.note.hidden=!visible;
    const descriptions=(hint.target.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&id!==hint.copy.id);
    if(visible)descriptions.push(hint.copy.id);
    if(descriptions.length)hint.target.setAttribute('aria-describedby',descriptions.join(' '));else hint.target.removeAttribute('aria-describedby');
  }
  function place(key){
    const hint=hints[key],rect=hint.target.getBoundingClientRect();
    const bottom=innerHeight-document.querySelector('.session-player').getBoundingClientRect().height-12;
    if(rect.bottom<(key==='sound'?0:80)||rect.top>bottom){show(hint,false);return}
    show(hint,true);
    const width=hint.note.offsetWidth,height=hint.note.offsetHeight,narrow=innerWidth<=900;
    let x,y,point,start;
    if(key==='lp'){
      point={x:rect.left+rect.width*.31,y:rect.top+rect.height*.52};
      x=point.x-width-30;y=point.y-height/2;start='right';
    }else if(key==='portfolio'&&narrow){
      point={x:rect.left+5,y:rect.top+45};
      x=rect.left-width-28;y=rect.top+20;start='right';
    }else{
      point={x:rect.right-35,y:rect.bottom-3};
      x=rect.right-width;y=rect.bottom+18;start='top';
    }
    x=Math.max(18,Math.min(x,document.documentElement.clientWidth-width-18));
    y=Math.max(88,Math.min(y,bottom-height));
    hint.note.style.left=`${x}px`;hint.note.style.top=`${y}px`;
    const from=start==='right'?{x:x+width,y:y+height/2}:{x:x+width*.7,y};
    const dx=point.x-from.x,dy=point.y-from.y;
    hint.line.style.left=`${from.x-x}px`;hint.line.style.top=`${from.y-y}px`;
    hint.line.style.width=`${Math.hypot(dx,dy)}px`;hint.line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;
  }
  function refresh(){
    const ready=document.body.dataset.entrance==='ready'&&!document.querySelector('dialog[open]');
    const home=ready&&!document.body.classList.contains('detail-mode');
    for(const key of Object.keys(hints)){
      const visible=!seen[key]&&(key==='sound'?ready&&soundEligible&&document.querySelector('#sound-panel').hidden:home&&(key!=='portfolio'||document.body.dataset.album==='about'));
      if(visible)place(key);else show(hints[key],false);
    }
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;refresh()})}
  document.addEventListener('soundtrack-playing',()=>{soundEligible=true;remember('lp')});
  hints.sound.target.addEventListener('click',()=>{if(soundEligible)remember('sound')});
  document.querySelector('#sound-toggle').addEventListener('click',()=>remember('sound'));
  document.querySelector('#volume').addEventListener('input',()=>{if(soundEligible)remember('sound')});
  document.addEventListener('sound-panel-change',schedule);
  function viewedPortfolio(){if(location.hash==='#about')remember('portfolio');else schedule()}
  window.addEventListener('hashchange',viewedPortfolio);
  window.addEventListener('resize',schedule);window.addEventListener('scroll',schedule,{passive:true});
  const changes=new MutationObserver(schedule);
  changes.observe(document.body,{attributes:true,attributeFilter:['class','data-entrance','data-album']});
  document.querySelectorAll('dialog').forEach(dialog=>changes.observe(dialog,{attributes:true,attributeFilter:['open']}));
  const sizes=new ResizeObserver(schedule);Object.values(hints).forEach(hint=>sizes.observe(hint.target));
  document.fonts?.ready.then(schedule);
  viewedPortfolio();refresh();
}

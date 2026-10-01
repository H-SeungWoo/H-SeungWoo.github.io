// One continuous soundtrack for the entire site. Navigation never touches this source.
export function setupSoundtrack(){
  const button=document.querySelector('#sound'),label=document.querySelector('#sound-label');
  const panel=document.querySelector('#sound-panel'),controls=button.closest('.sound-controls');
  const toggle=document.querySelector('#sound-toggle'),toggleLabel=document.querySelector('#sound-toggle-label');
  const closeButton=document.querySelector('#sound-close');
  const status=document.querySelector('#play-status'),elapsed=document.querySelector('#elapsed'),hint=document.querySelector('#audio-hint');
  const volumeInput=document.querySelector('#volume'),volumeValue=document.querySelector('#volume-value');
  const volumeKey='personal-records:volume:v1';
  let context,master,buffer,source,preparation,startedAt=0;
  let wanted=false,interacted=false,unavailable=false,wasAudible=false,panelOpen=false;
  let volume=43,lastNonzero=43;
  const duration=22.4;

  try{
    const saved=JSON.parse(localStorage.getItem(volumeKey));
    if(saved&&typeof saved.volume==='number'&&Number.isFinite(saved.volume)&&saved.volume>=0&&saved.volume<=100){
      volume=Math.round(saved.volume);
      if(typeof saved.lastNonzero==='number'&&Number.isFinite(saved.lastNonzero)&&saved.lastNonzero>=1&&saved.lastNonzero<=100)lastNonzero=Math.round(saved.lastNonzero);
      if(volume>0)lastNonzero=volume;
    }
  }catch{}

  function saveVolume(){
    try{localStorage.setItem(volumeKey,JSON.stringify({volume,lastNonzero}))}catch{}
  }

  function applyVolume(){
    if(master&&context)master.gain.setTargetAtTime(volume/100,context.currentTime,.06);
  }

  function restoreVolume(){
    if(volume===0){volume=lastNonzero;saveVolume()}
    applyVolume();
  }

  function paint(){
    const running=wanted&&!!source&&context?.state==='running';
    const silent=volume===0;
    const audible=running&&!silent;
    document.body.dataset.audioState=unavailable?'unavailable':!interacted?'idle':!wanted?'paused':running?'playing':'blocked';
    document.body.dataset.soundMuted=String(silent);
    if(volumeInput){
      volumeInput.value=String(volume);
      volumeInput.style.setProperty('--volume',`${volume}%`);
      volumeInput.setAttribute('aria-valuetext',`${volume}%`);
    }
    if(volumeValue)volumeValue.textContent=`${volume}%`;
    button.setAttribute('aria-label',`사운드 설정 ${panelOpen?'닫기':'열기'} · ${wanted?'배경음악 재생 중':'배경음악 정지'}`);
    toggle.setAttribute('aria-pressed',String(wanted));
    toggle.setAttribute('aria-label',wanted?'배경음악과 레코드 일시정지':'배경음악과 레코드 재생');
    toggleLabel.textContent=wanted?'ON':'OFF';
    label.textContent=wanted?'SOUND ON':'SOUND OFF';
    status.textContent=audible?'AFTER HOURS · NOW PLAYING':running&&silent?'AFTER HOURS · MUTED':interacted&&!wanted?'AFTER HOURS · PAUSED':'AFTER HOURS · READY';
    hint.textContent=unavailable?'이 브라우저에서는 오디오를 사용할 수 없습니다.':!interacted?'LP를 눌러 음악과 함께 둘러보세요.':!wanted?'LP를 눌러 음악을 이어서 들으세요.':!buffer?'음악을 준비하고 있습니다.':'LP를 눌러 음악을 시작하세요.';
    hint.hidden=audible||silent;
    document.body.classList.toggle('music-playing',audible);
    if(source){
      const total=Math.max(0,Math.floor(context.currentTime-startedAt));
      elapsed.textContent=`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
    }
    const began=audible&&!wasAudible;
    wasAudible=audible;
    if(began)document.dispatchEvent(new Event('soundtrack-playing'));
  }

  function start(){
    if(wanted&&buffer&&context?.state==='running'&&!source){
      source=context.createBufferSource();source.buffer=buffer;source.loop=true;
      source.connect(master);startedAt=context.currentTime;source.start();
    }
    paint();
  }

  function suspend(){
    if(context?.state==='running')context.suspend().then(paint).catch(paint);
    else paint();
  }

  function prepare(){
    if(preparation||unavailable)return preparation;
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;
      const OfflineCtx=window.OfflineAudioContext||window.webkitOfflineAudioContext;
      if(!Ctx||!OfflineCtx)throw new Error('Web Audio is not supported');
      context=new Ctx();master=context.createGain();master.gain.value=volume/100;
      master.connect(context.destination);
      context.addEventListener('statechange',()=>wanted?start():suspend());
      const offline=new OfflineCtx(1,Math.ceil(duration*44100),44100);
      const wave=offline.createPeriodicWave(new Float32Array([0,0,0,0,0]),new Float32Array([0,1,.24,.07,.025]));
      function note(midi,t,length,volume){const osc=offline.createOscillator(),gain=offline.createGain();osc.setPeriodicWave(wave);osc.frequency.value=440*2**((midi-69)/12);const end=Math.min(t+length,duration-.008);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.018);gain.gain.exponentialRampToValueAtTime(.0001,end);osc.connect(gain);gain.connect(offline.destination);osc.start(t);osc.stop(end)}
      const chords=[[60,64,67,71],[57,60,64,67],[62,65,69,72],[55,59,62,65]];
      for(let beat=0;beat<32;beat++){const chord=chords[Math.floor(beat/8)%4],t=beat*.7;note(chord[beat%4===2?2:0]-24,t,.65,.11);if(beat%2===0)chord.forEach((n,i)=>note(n,t+.07+i*.012,1.65,.033));if(beat%4===1||beat%4===3)note(chord[[2,1,3,2][Math.floor(beat/2)%4]]+12,t+.15,.8,.045)}
      preparation=offline.startRendering().then(rendered=>{
        buffer=rendered;
        if(wanted)start();else suspend();
      }).catch(fail);
    }catch(error){fail(error)}
    return preparation;
  }

  function fail(error){
    unavailable=true;
    suspend();
    console.warn('Audio unavailable',error);
  }

  function play(){
    interacted=true;wanted=true;
    prepare();
    // Resume in the original click handler, before awaiting the offline render.
    if(context&&!unavailable){
      context.resume().then(()=>wanted?start():suspend()).catch(paint);
    }
    paint();
  }

  function returnToSound(){
    button.focus({preventScroll:true});
    requestAnimationFrame(()=>{
      if(!panelOpen&&(document.activeElement===document.body||panel.contains(document.activeElement)))button.focus({preventScroll:true});
    });
  }

  function setPanel(open,{returnFocus=false}={}){
    if(panelOpen===open){
      if(!open&&returnFocus)returnToSound();
      return;
    }
    panelOpen=open;
    panel.hidden=!open;
    button.setAttribute('aria-expanded',String(open));
    paint();
    if(open)toggle.focus({preventScroll:true});
    else if(returnFocus)returnToSound();
    document.dispatchEvent(new CustomEvent('sound-panel-change',{detail:{open}}));
  }

  document.addEventListener('record-play',play);
  document.addEventListener('record-pause',()=>{interacted=true;wanted=false;suspend()});
  volumeInput?.addEventListener('input',()=>{
    const next=Number(volumeInput.value);
    if(!Number.isFinite(next)||next<0||next>100)return;
    volume=Math.round(next);
    if(volume>0)lastNonzero=volume;
    saveVolume();applyVolume();paint();
  });
  toggle.addEventListener('click',()=>{
    if(wanted)document.dispatchEvent(new Event('record-pause'));
    else{restoreVolume();document.dispatchEvent(new Event('record-play'))}
  });
  // Opening settings is independent of playback and leaves the record untouched.
  button.removeAttribute('aria-pressed');
  button.setAttribute('aria-expanded','false');
  panel.hidden=true;
  button.addEventListener('click',()=>setPanel(!panelOpen,{returnFocus:panelOpen}));
  closeButton.addEventListener('click',()=>setPanel(false,{returnFocus:true}));
  document.addEventListener('keydown',event=>{
    if(panelOpen&&event.key==='Escape'){
      event.preventDefault();
      setPanel(false,{returnFocus:true});
    }
  });
  document.addEventListener('pointerdown',event=>{
    if(panelOpen&&!controls.contains(event.target))setPanel(false);
  });
  controls.addEventListener('focusout',event=>{
    if(controls.contains(event.relatedTarget))return;
    // Let the next control receive focus before treating a null relatedTarget as an exit.
    setTimeout(()=>{
      if(panelOpen&&!controls.contains(document.activeElement))setPanel(false);
    },0);
  });
  window.addEventListener('hashchange',()=>setPanel(false));
  window.addEventListener('scroll',()=>{
    if(!panelOpen)return;
    const anchor=button.getBoundingClientRect();
    if(anchor.bottom<=0||anchor.top>=innerHeight)setPanel(false);
  },{passive:true});
  const modalChanges=new MutationObserver(()=>{
    if(panelOpen&&document.querySelector('dialog[open]'))setPanel(false);
  });
  document.querySelectorAll('dialog').forEach(dialog=>modalChanges.observe(dialog,{attributes:true,attributeFilter:['open']}));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)paint()});
  setInterval(paint,1000);paint();
}

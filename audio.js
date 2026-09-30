// One continuous soundtrack for the entire site. Navigation never touches this source.
export function setupSoundtrack(){
  const button=document.querySelector('#sound'),label=document.querySelector('#sound-label');
  const status=document.querySelector('#play-status'),elapsed=document.querySelector('#elapsed'),hint=document.querySelector('#audio-hint');
  let context,master,buffer,source,preparation,startedAt=0;
  let muted=false,wanted=false,interacted=false,unavailable=false,wasAudible=false;
  const duration=22.4;

  function paint(){
    const running=wanted&&!!source&&context?.state==='running';
    const audible=running&&!muted;
    document.body.dataset.audioState=unavailable?'unavailable':!interacted?'idle':!wanted?'paused':running?'playing':'blocked';
    document.body.dataset.soundMuted=String(muted);
    button.setAttribute('aria-pressed',String(audible));
    button.setAttribute('aria-label',audible?'소리 끄기':'소리 켜기');
    label.textContent=audible?'SOUND ON':'SOUND OFF';
    status.textContent=audible?'AFTER HOURS · NOW PLAYING':running&&muted?'AFTER HOURS · MUTED':interacted&&!wanted?'AFTER HOURS · PAUSED':'AFTER HOURS · READY';
    hint.textContent=unavailable?'이 브라우저에서는 오디오를 사용할 수 없습니다.':!interacted?'LP를 눌러 음악과 함께 둘러보세요.':!wanted?'LP를 눌러 음악을 이어서 들으세요.':!buffer?'음악을 준비하고 있습니다.':'LP를 눌러 음악을 시작하세요.';
    hint.hidden=audible||muted;
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
      context=new Ctx();master=context.createGain();master.gain.value=muted?0:.43;
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

  document.addEventListener('record-play',play);
  document.addEventListener('record-pause',()=>{interacted=true;wanted=false;suspend()});
  button.addEventListener('click',()=>{
    if(!wanted||!source||context?.state!=='running'){
      muted=false;
      master?.gain.setTargetAtTime(.43,context.currentTime,.06);
      document.dispatchEvent(new Event('record-play'));
    }else{
      muted=!muted;
      master.gain.setTargetAtTime(muted?0:.43,context.currentTime,.06);
      paint();
    }
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)paint()});
  setInterval(paint,1000);paint();
}

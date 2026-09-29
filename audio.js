// One continuous soundtrack for the entire site. Navigation never touches this source.
export function setupSoundtrack(){
  const button=document.querySelector('#sound'),label=document.querySelector('#sound-label');
  const status=document.querySelector('#play-status'),elapsed=document.querySelector('#elapsed'),hint=document.querySelector('#audio-hint');
  let context,master,buffer,source,startedAt=0,muted=false,wanted=true;
  const duration=22.4;
  function paint(){const playing=wanted&&!!source&&context?.state==='running'&&!muted;
    document.body.dataset.audioState=!wanted?'paused':context?.state==='running'?'playing':'blocked';
    button.setAttribute('aria-pressed',String(playing));label.textContent=muted?'SOUND OFF':!wanted?'SOUND PAUSED':playing?'SOUND ON':'ENABLE SOUND';
    status.textContent=playing?'AFTER HOURS · NOW PLAYING':muted?'AFTER HOURS · MUTED':!wanted?'AFTER HOURS · PAUSED':'AFTER HOURS · READY';
    hint.textContent='자동 재생이 제한되면 LP를 눌러 시작하세요.';hint.hidden=playing||muted||!wanted;document.body.classList.toggle('music-playing',playing);
    if(source){const total=Math.floor(context.currentTime-startedAt);elapsed.textContent=`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`}
  }
  function start(){if(wanted&&buffer&&context?.state==='running'&&!source){source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(master);startedAt=context.currentTime;source.start();}paint()}
  async function prepare(){
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;context=new Ctx();master=context.createGain();master.gain.value=.43;master.connect(context.destination);context.addEventListener('statechange',start);
      const offline=new OfflineAudioContext(1,Math.ceil(duration*44100),44100);
      const wave=offline.createPeriodicWave(new Float32Array([0,0,0,0,0]),new Float32Array([0,1,.24,.07,.025]));
      function note(midi,t,length,volume){const osc=offline.createOscillator(),gain=offline.createGain();osc.setPeriodicWave(wave);osc.frequency.value=440*2**((midi-69)/12);const end=Math.min(t+length,duration-.008);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.018);gain.gain.exponentialRampToValueAtTime(.0001,end);osc.connect(gain);gain.connect(offline.destination);osc.start(t);osc.stop(end)}
      const chords=[[60,64,67,71],[57,60,64,67],[62,65,69,72],[55,59,62,65]];
      for(let beat=0;beat<32;beat++){const chord=chords[Math.floor(beat/8)%4],t=beat*.7;note(chord[beat%4===2?2:0]-24,t,.65,.11);if(beat%2===0)chord.forEach((n,i)=>note(n,t+.07+i*.012,1.65,.033));if(beat%4===1||beat%4===3)note(chord[[2,1,3,2][Math.floor(beat/2)%4]]+12,t+.15,.8,.045)}
      buffer=await offline.startRendering();start();if(wanted)context.resume().then(start).catch(paint);
    }catch(error){label.textContent='SOUND UNAVAILABLE';hint.textContent='이 브라우저에서는 오디오를 사용할 수 없습니다.';console.warn('Audio unavailable',error)}
  }
  document.addEventListener('record-play',()=>{wanted=true;context?.resume().then(()=>{if(wanted)start();else context.suspend()}).catch(paint);paint()});
  document.addEventListener('record-pause',()=>{wanted=false;context?.suspend().then(paint).catch(paint);paint()});
  function unlock(e){if(!wanted||e.target.closest('#scene,#rotation,#sound'))return;if(context?.state==='suspended')context.resume().then(()=>{if(wanted)start();else context.suspend()}).catch(paint)}
  document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);
  button.addEventListener('click',()=>{if(!context)return;if(source&&context.state==='running'&&!muted){muted=true;master.gain.setTargetAtTime(0,context.currentTime,.06)}else{muted=false;master.gain.setTargetAtTime(.43,context.currentTime,.06);if(wanted)context.resume().then(start).catch(paint)}paint()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)paint()});setInterval(paint,1000);prepare();paint();
}

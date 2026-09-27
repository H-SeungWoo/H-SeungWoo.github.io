// 이 네 개의 트랙 내용을 나의 실제 이야기로 바꿔 주세요.
const tracks = {
  school: { number:'01', side:'A', title:'전공과 학교생활', subtitle:'배움이 나의 언어가 되기까지.', notes:[60,64,67,71], entries:[['MY MAJOR','ICT융합학부 · 미디어 테크놀로지전공','ICT융합학부 미디어 테크놀로지전공. 전공을 선택한 계기와 관심 있게 탐구하는 주제는 곧 이곳에 기록할 예정입니다.'],['ON CAMPUS','강의실 밖에서도 계속되는 배움','기억에 남는 수업, 동아리 활동, 함께한 사람들과의 경험을 담는 공간입니다.'],['LOOKING BACK','배우고, 다시 질문하고','학교생활을 통해 달라진 생각과 앞으로 더 탐구하고 싶은 주제를 소개해 주세요.']] },
  projects: { number:'02', side:'A', title:'프로젝트', subtitle:'머릿속의 가능성이 실제로 작동하는 무언가가 되는 과정.', notes:[57,60,64,67], entries:[['PROJECT 01','나의 첫 번째 프로젝트','프로젝트 이름과 해결하고 싶었던 문제를 적어 주세요. 담당 역할, 선택한 방법, 결과와 배운 점으로 이야기를 이어갈 수 있습니다.'],['PROJECT 02','함께 만들어 낸 결과','팀 프로젝트에서 나의 역할과 협업 과정, 가장 어려웠던 문제와 해결 경험을 소개해 주세요.'],['WORK IN PROGRESS','지금 만들고 있는 것','진행 중인 작은 실험이나 앞으로 시도하고 싶은 작업을 소개해 주세요.']] },
  inspiration: { number:'03', side:'B', title:'취향과 영감', subtitle:'무심코 지나칠 수 없는 것들이 모여 나를 만듭니다.', notes:[62,65,69,72], entries:[['ON REPEAT','자꾸 다시 듣게 되는 음악','좋아하는 음악과 그 음악에 얽힌 기억을 소개해 주세요. 나만의 플레이리스트 링크를 더해도 좋습니다.'],['IN MY FRAME','일상에서 수집하는 장면','사진, 책, 영화, 공간처럼 나에게 새로운 시선을 주는 것들을 기록하는 공간입니다.'],['OFF THE RECORD','일 밖의 나','꾸준히 즐기는 취미와 일상의 작은 습관들을 소개해 주세요.']] },
  about: { number:'04', side:'B', title:'소개와 연락', subtitle:'좋은 이야기는 새로운 만남에서 시작되니까요.', notes:[55,59,62,67], entries:[['HELLO, I AM','안녕하세요, H-SeungWoo입니다.','나를 표현하는 짧은 소개를 적어 주세요. 어떤 일을 좋아하고, 어떤 방향으로 성장하고 싶은지 들려주세요.'],['MY APPROACH','나만의 속도로, 꾸준하게','일을 대하는 태도와 중요하게 생각하는 가치, 함께 일할 때의 강점을 소개해 주세요.'],['LET’S CONNECT','다음 이야기를 함께 만들어요','이곳에 공개할 이메일과 GitHub, 소셜 링크를 넣어 주세요. 연락처를 설정하기 전까지는 개인 정보가 표시되지 않습니다.']] }
};
const order = Object.keys(tracks);
let current = null, audio = null, master = null, timer = null, beat = 0, soundOn = false;
let voices = new Set();
const soundButton = document.querySelector('#sound');
function updateSoundUI(){
  soundButton.setAttribute('aria-pressed',String(soundOn));
  document.querySelector('#sound-label').textContent=soundOn?'SOUND ON':'SOUND OFF';
  document.body.classList.toggle('playing',Boolean(current));
  document.querySelector('#play-status').textContent=current?`PLAYING ${tracks[current].number} ${soundOn?'• SOUND ON':'• MUTED'}`:'READY TO PLAY';
}
function stopMusic(){clearInterval(timer);timer=null;voices.forEach(v=>{try{v.stop()}catch{}});voices.clear();}
function note(midi, when, duration, volume){
  const osc=audio.createOscillator(), gain=audio.createGain();
  osc.type='sine';osc.frequency.value=440*2**((midi-69)/12);
  gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(volume,when+.035);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
  osc.connect(gain);gain.connect(master);osc.start(when);osc.stop(when+duration);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect()};
}
function startMusic(){
  stopMusic();if(!soundOn||!current||!audio||document.hidden)return;
  beat=0;
  const tick=()=>{const chord=tracks[current].notes;const t=audio.currentTime+.02;note(chord[[0,2,1,3,2,1,3,2][beat%8]]+12,t,1.3,.09);if(beat%4===0){chord.slice(0,3).forEach(n=>note(n-12,t,2.4,.045))}beat++};
  tick();timer=setInterval(tick,430);
}
async function enableSound(){
  try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(!master){master=audio.createGain();master.gain.value=.48;master.connect(audio.destination)}await audio.resume();soundOn=true;startMusic();}catch{soundOn=false;}
  updateSoundUI();
}
function render(){
  const key=location.hash.slice(1);current=tracks[key]?key:null;
  document.body.classList.toggle('detail-mode',Boolean(current));
  document.querySelector('#detail').hidden=!current;
  document.querySelectorAll('[data-track]').forEach(link=>{if(link.dataset.track===current)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
  if(current){const data=tracks[current];document.title=`${data.title} — Personal Records`;document.querySelector('#detail-kicker').textContent=`SIDE ${data.side} / TRACK ${data.number}`;document.querySelector('#detail-title').textContent=data.title;document.querySelector('#detail-description').textContent=data.subtitle;
    const content=document.querySelector('#detail-content');content.replaceChildren();
    for(const [tag,title,copy] of data.entries){const entry=document.createElement('article');entry.className='detail-entry';for(const [element,text,className] of [['span',tag,'entry-number'],['h3',title,''],['p',copy,'']]){const el=document.createElement(element);el.textContent=text;el.className=className;entry.append(el)}content.append(entry)}
    if(current==='about'){const link=document.createElement('a');link.href='https://github.com/H-SeungWoo';link.textContent='GitHub · H-SeungWoo ↗';link.className='github-link';link.target='_blank';link.rel='noopener noreferrer';content.append(link)}
    const note=document.createElement('p');note.className='demo-note';note.textContent='IN THE MAKING · 상세한 이야기와 작업 기록을 준비하고 있습니다.';content.append(note);
    document.querySelector('#detail-title').focus({preventScroll:true});
  }else{document.title='Personal Records — 나의 기록들'}
  window.scrollTo({top:0,behavior:'instant'});startMusic();updateSoundUI();
}
document.querySelectorAll('[data-track]').forEach(link=>link.addEventListener('click',()=>{if(!audio)enableSound()}));
soundButton.addEventListener('click',()=>{if(soundOn){soundOn=false;stopMusic();updateSoundUI()}else enableSound()});
document.querySelector('#back').addEventListener('click',()=>{const previous=current;location.hash='';setTimeout(()=>document.querySelector(`[data-track="${previous}"]`)?.focus(),0)});
document.querySelector('#next').addEventListener('click',()=>{location.hash=order[(order.indexOf(current)+1)%order.length]});
window.addEventListener('hashchange',render);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();else startMusic()});
document.querySelector('#year').textContent=new Date().getFullYear();
document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();const main=document.querySelector('#main');main.setAttribute('tabindex','-1');main.focus()});
render();


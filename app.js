import { motionReady, reducedMotion } from './motion.js';
import { setupSoundtrack } from './audio.js';
// 이 네 개의 트랙 내용을 나의 실제 이야기로 바꿔 주세요.
const tracks = {
  school: { number:'01', side:'A', title:'전공과 학교생활', subtitle:'배움이 나의 언어가 되기까지.', notes:[60,64,67,71], entries:[['MY MAJOR','ICT융합학부 · 미디어 테크놀로지전공','ICT융합학부 미디어 테크놀로지전공. 전공을 선택한 계기와 관심 있게 탐구하는 주제는 곧 이곳에 기록할 예정입니다.'],['ON CAMPUS','강의실 밖에서도 계속되는 배움','기억에 남는 수업, 동아리 활동, 함께한 사람들과의 경험을 담는 공간입니다.'],['LOOKING BACK','배우고, 다시 질문하고','학교생활을 통해 달라진 생각과 앞으로 더 탐구하고 싶은 주제를 소개해 주세요.']] },
  projects: { number:'02', side:'A', title:'프로젝트', subtitle:'머릿속의 가능성이 실제로 작동하는 무언가가 되는 과정.', notes:[57,60,64,67], entries:[['PROJECT 01','나의 첫 번째 프로젝트','프로젝트 이름과 해결하고 싶었던 문제를 적어 주세요. 담당 역할, 선택한 방법, 결과와 배운 점으로 이야기를 이어갈 수 있습니다.'],['PROJECT 02','함께 만들어 낸 결과','팀 프로젝트에서 나의 역할과 협업 과정, 가장 어려웠던 문제와 해결 경험을 소개해 주세요.'],['WORK IN PROGRESS','지금 만들고 있는 것','진행 중인 작은 실험이나 앞으로 시도하고 싶은 작업을 소개해 주세요.']] },
  inspiration: { number:'03', side:'B', title:'취향과 영감', subtitle:'무심코 지나칠 수 없는 것들이 모여 나를 만듭니다.', notes:[62,65,69,72], entries:[['ON REPEAT','자꾸 다시 듣게 되는 음악','좋아하는 음악과 그 음악에 얽힌 기억을 소개해 주세요. 나만의 플레이리스트 링크를 더해도 좋습니다.'],['IN MY FRAME','일상에서 수집하는 장면','사진, 책, 영화, 공간처럼 나에게 새로운 시선을 주는 것들을 기록하는 공간입니다.'],['OFF THE RECORD','일 밖의 나','꾸준히 즐기는 취미와 일상의 작은 습관들을 소개해 주세요.']] },
  about: { number:'04', side:'B', title:'소개와 연락', subtitle:'좋은 이야기는 새로운 만남에서 시작되니까요.', notes:[55,59,62,67], entries:[['HELLO, I AM','안녕하세요, H-SeungWoo입니다.','나를 표현하는 짧은 소개를 적어 주세요. 어떤 일을 좋아하고, 어떤 방향으로 성장하고 싶은지 들려주세요.'],['MY APPROACH','나만의 속도로, 꾸준하게','일을 대하는 태도와 중요하게 생각하는 가치, 함께 일할 때의 강점을 소개해 주세요.'],['LET’S CONNECT','다음 이야기를 함께 만들어요','이곳에 공개할 이메일과 GitHub, 소셜 링크를 넣어 주세요. 연락처를 설정하기 전까지는 개인 정보가 표시되지 않습니다.']] }
};

const order=Object.keys(tracks), detail=document.querySelector('#detail');
let current=null, desired=null, routing=false, initialized=false;
let anime=null;motionReady.then(value=>{anime=value});
const homeElements=[document.querySelector('.intro'),document.querySelector('.collection'),document.querySelector('.listening-note')];
function animate(targets,parameters){return new Promise(resolve=>{if(!anime||reducedMotion.matches){resolve();return}anime.animate(targets,{...parameters,onComplete:resolve})})}
function populate(){
  document.body.classList.toggle('detail-mode',!!current);detail.hidden=!current;
  document.querySelector('.intro').inert=!!current;document.querySelector('.tracks').inert=!!current;
  document.querySelectorAll('[data-track]').forEach(link=>{if(link.dataset.track===current)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
  document.querySelector('#current-section').textContent=current?tracks[current].title:'THE COLLECTION';
  if(!current){document.title='Personal Records — The Listening Room';return}
  const data=tracks[current];detail.dataset.category=current;document.title=`${data.title} — Personal Records`;
  document.querySelector('#detail-kicker').textContent=`THE LINER NOTES / SIDE ${data.side}`;
  document.querySelector('#detail-number').textContent=data.number;
  document.querySelector('#detail-title').textContent=data.title;
  document.querySelector('#detail-description').textContent=data.subtitle;
  const content=document.querySelector('#detail-content');content.replaceChildren();
  data.entries.forEach(([tag,title,copy],index)=>{
    const entry=document.createElement('article');entry.className='detail-entry';
    const count=document.createElement('span');count.className='entry-index';count.textContent=String(index+1).padStart(2,'0');entry.append(count);
    const body=document.createElement('div');body.className='entry-body';
    if(current==='projects'||current==='inspiration'){const art=document.createElement('div');art.className='entry-art';art.setAttribute('aria-label','이미지와 작업 기록을 위한 공간');const artTitle=document.createElement('span');artTitle.textContent=current==='projects'?['MAKE.','EXPLORE.','REPEAT.'][index]:['Listen.','Observe.','Collect.'][index];const small=document.createElement('small');small.textContent='A SPACE FOR THE NEXT STORY';art.append(artTitle,small);body.append(art)}
    for(const [element,text,cls] of [['span',tag,'entry-number'],['h3',title,''],['p',copy,'']]){const el=document.createElement(element);el.textContent=text;el.className=cls;body.append(el)}entry.append(body);content.append(entry);
  });
  if(current==='about'){const link=document.createElement('a');link.href='https://github.com/H-SeungWoo';link.textContent='GitHub · H-SeungWoo ↗';link.className='github-link';link.target='_blank';link.rel='noopener noreferrer';content.append(link)}
  const note=document.createElement('p');note.className='demo-note';note.textContent='IN THE MAKING — 이 속지는 앞으로의 이야기로 채워집니다.';content.append(note);
  document.querySelector('#next').firstChild.textContent=`다음 트랙 · ${tracks[order[(order.indexOf(current)+1)%order.length]].title} `;
}
function cleanMotion(){for(const el of [...homeElements,detail,...document.querySelectorAll('.detail-heading,.detail-entry')]){el.style.removeProperty('opacity');el.style.removeProperty('transform');el.style.removeProperty('translate');el.style.removeProperty('scale')}}
async function route(){
  desired=tracks[location.hash.slice(1)]?location.hash.slice(1):null;
  if(routing)return;routing=true;
  try{
    if(!initialized){current=desired;populate();initialized=true;if(current)document.querySelector('#detail-title').focus({preventScroll:true})}
    while(current!==desired){
      const previous=current;
      await animate(current?detail:homeElements,{opacity:[1,0],duration:180,ease:'inQuad'});
      current=desired;populate();window.scrollTo({top:0,behavior:'instant'});cleanMotion();
      if(current){
        document.querySelector('#detail-title').focus({preventScroll:true});
        if(anime&&!reducedMotion.matches){anime.animate('.detail-heading,.detail-entry',{opacity:[0,1],y:[22,0],delay:anime.stagger(50,{start:90}),duration:350,ease:'outCubic'})}
        await animate(detail,{opacity:[0,1],y:[64,0],scale:[.985,1],duration:620,ease:'outCubic'});
      }else{
        await animate(homeElements,{opacity:[0,1],duration:350,ease:'outQuad'});
        document.querySelector(`.tracks [data-track="${previous}"]`)?.focus({preventScroll:true});
      }
      cleanMotion();
    }
  }finally{routing=false}
}
window.addEventListener('hashchange',route);
document.querySelector('#back').addEventListener('click',()=>{location.hash=''});
document.querySelector('#next').addEventListener('click',()=>{location.hash=order[(order.indexOf(current)+1)%order.length]});
document.querySelector('#year').textContent=new Date().getFullYear();
document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();const main=document.querySelector('#main');main.setAttribute('tabindex','-1');main.focus()});
route();setupSoundtrack();


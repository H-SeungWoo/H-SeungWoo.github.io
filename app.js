import { albums } from './albums.js?v=9';
import { portfolio, getCanvaLinks } from './portfolio.js?v=16';
import { motionReady, reducedMotion } from './motion.js';
import { setupSoundtrack } from './audio.js?v=20';
import { setupGuide } from './guide.js?v=19';
let selected=albums[0],motion,changing=false;
const $=s=>document.querySelector(s),shelf=$('#shelf'),detail=$('#detail');
const introductionTitle=$('#album-title').textContent;
motionReady.then(m=>motion=m);
function paintRotation(playing){const idle=!document.body.dataset.audioState||document.body.dataset.audioState==='idle';document.body.classList.toggle('record-playing',playing);$('#rotation').setAttribute('aria-pressed',String(playing&&!idle));$('#rotation').setAttribute('aria-label',idle?'레코드 음악 재생':playing?'레코드 회전 일시정지':'레코드 재생');$('#rotation').textContent=playing&&!idle?'Ⅱ  33⅓ RPM':'▶  PLAY RECORD'}
document.addEventListener('record-play',()=>paintRotation(true));
document.addEventListener('record-pause',()=>paintRotation(false));
document.addEventListener('soundtrack-playing',()=>paintRotation(document.body.classList.contains('record-playing')));
function toggleRecord(){document.dispatchEvent(new Event(['idle','blocked'].includes(document.body.dataset.audioState)?'record-play':document.body.classList.contains('record-playing')?'record-pause':'record-play'))}
document.addEventListener('record-toggle',toggleRecord);
paintRotation(false);
$('#rotation').addEventListener('click',toggleRecord);
$('#shelf-open small').textContent=`${albums.length} RECORDS`;

function animate(el,options){if(!motion||reducedMotion.matches)return Promise.resolve();return new Promise(resolve=>motion.animate(el,{...options,onComplete:resolve}))}
function cabinet(){
 $('#cabinet').replaceChildren();
 albums.forEach(album=>{
  const slot=document.createElement('div');slot.className='cubby';slot.dataset.album=album.id;
  const button=document.createElement('button');button.className='record-slot';button.disabled=album===selected;button.setAttribute('aria-label',`${album.title} · ${album.era}${album===selected?' · 현재 선택한 LP':' 선택'}`);
  if(album===selected){button.innerHTML='<span class="empty-ring" aria-hidden="true"></span><span class="on-turntable">ON THE<br>TURNTABLE</span>';slot.classList.add('is-empty')}
  else{const cover=document.createElement('span');cover.className='album-cover';const artwork=document.createElement('img');artwork.src=album.artwork;artwork.alt='';artwork.draggable=false;artwork.className='sleeve-art';const title=document.createElement('strong');title.textContent=album.sleeveTitle;const sub=document.createElement('span');sub.textContent=album.era;cover.append(artwork,title,sub);button.append(cover)}
  const plaque=document.createElement('div');plaque.className='plaque';const name=document.createElement('strong');name.textContent=album.title;const era=document.createElement('small');era.textContent=album.era;plaque.append(name,era);if(album.id==='campus'){const note=document.createElement('small');note.textContent='ICT융합학부 및 학부연구생';plaque.append(note)}
  button.addEventListener('click',()=>selectAlbum(album,button));slot.append(button,plaque);$('#cabinet').append(slot);
 });
 for(let i=0;i<(3-albums.length%3)%3;i++){const blank=document.createElement('div');blank.className='cubby future-slot';blank.innerHTML='<span>TO BE CONTINUED</span>';$('#cabinet').append(blank)}
}
function updateAlbum(){document.body.dataset.album=selected.id;$('#album-title').textContent=selected.id==='about'?introductionTitle:selected.title;$('#album-number').textContent=selected.number;$('#album-subtitle').textContent=selected.english;$('#album-detail').href=`#${selected.id}`;$('#current-section').textContent=`${selected.number} / ${selected.title}`;cabinet();document.dispatchEvent(new CustomEvent('album-change',{detail:selected}))}
async function closeShelf(){if(!shelf.open)return;await animate(shelf,{x:[0,-45],opacity:[1,0],duration:220,ease:'inQuad'});shelf.close();shelf.style.removeProperty('transform');shelf.style.removeProperty('opacity');document.body.classList.remove('shelf-open');$('#shelf-open').setAttribute('aria-expanded','false');$('#shelf-open').focus()}
$('#shelf-open').addEventListener('click',()=>{cabinet();shelf.showModal();document.body.classList.add('shelf-open');$('#shelf-open').setAttribute('aria-expanded','true');animate(shelf,{x:['-100%',0],opacity:[.5,1],duration:520,ease:'outCubic'});$('#shelf-close').focus()});
$('#shelf-close').addEventListener('click',closeShelf);shelf.addEventListener('cancel',e=>{e.preventDefault();closeShelf()});shelf.addEventListener('click',e=>{if(e.target===shelf){const r=shelf.getBoundingClientRect();if(e.clientX>r.right||e.clientY>r.bottom||e.clientX<r.left||e.clientY<r.top)closeShelf()}});
async function selectAlbum(album,button){if(changing)return;changing=true;await animate(button,{y:[0,-12],scale:[1,1.04],opacity:[1,0],duration:240,ease:'inQuad'});selected=album;updateAlbum();await closeShelf();changing=false;$('#album-detail').focus({preventScroll:true})}
function renderPortfolio(){
 const links=getCanvaLinks(),content=$('#detail-content');
 $('#detail-title').textContent=portfolio.title;
 $('#canva-open').hidden=!links;
 if(links)$('#canva-open').href=links.view;else $('#canva-open').removeAttribute('href');
 content.replaceChildren();
 const stage=document.createElement('div');stage.className='portfolio-stage';stage.style.aspectRatio=portfolio.aspectRatio;
 if(links){
  const frame=document.createElement('iframe');frame.className='canva-frame';frame.src=links.embed;frame.title=portfolio.title+' · Canva';frame.allow='fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';stage.append(frame);
 }else{
  const empty=document.createElement('div');empty.className='portfolio-placeholder';
  const label=document.createElement('span');label.className='eyebrow';label.textContent='THE NEXT CHAPTER';
  const title=document.createElement('h3');title.textContent='Portfolio, coming soon.';
  const copy=document.createElement('p');copy.textContent='나의 이야기를 담은 포트폴리오를 준비하고 있습니다.';
  empty.append(label,title,copy);stage.append(empty);
 }
 content.append(stage);
 if(links){const hint=document.createElement('p');hint.className='portfolio-help';hint.textContent='슬라이드 안의 화살표로 페이지를 넘겨보세요. 화면이 보이지 않으면 Canva에서 열기를 이용해주세요.';content.append(hint)}
}
const notice=$('#preparing');
function showPreparing(){if(!notice.open)notice.showModal()}
$('#preparing-close').addEventListener('click',()=>notice.close());
notice.addEventListener('close',()=>$('#album-detail').focus({preventScroll:true}));
$('#album-detail').addEventListener('click',e=>{if(selected.id!=='about'){e.preventDefault();showPreparing()}});
function route(){let album=albums.find(a=>a.id===location.hash.slice(1));const unavailable=album&&album.id!=='about';if(unavailable){if(selected!==album){selected=album;updateAlbum()}history.replaceState(null,'',location.pathname+location.search);album=null}if(album){if(selected!==album){selected=album;updateAlbum()}renderPortfolio()}else $('#detail-content').replaceChildren();detail.hidden=!album;document.body.classList.toggle('detail-mode',!!album);$('.collection').inert=!!album;$('#shelf-open').hidden=!!album;document.title=album?`${album.title} — Personal Records`:'Personal Records — The Listening Room';if(album){animate(detail,{opacity:[0,1],y:[40,0],duration:550,ease:'outCubic'});$('#detail-title').focus({preventScroll:true})}window.scrollTo(0,0);if(unavailable)showPreparing()}
$('#back').addEventListener('click',()=>{location.hash='';setTimeout(()=>$('#album-detail').focus({preventScroll:true}),0)});
window.addEventListener('hashchange',route);$('#year').textContent=new Date().getFullYear();updateAlbum();route();setupSoundtrack();setupGuide();

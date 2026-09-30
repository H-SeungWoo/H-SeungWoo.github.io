import { albums } from './albums.js?v=9';
import { motionReady, reducedMotion } from './motion.js';
import { setupSoundtrack } from './audio.js?v=11';
let selected=albums[0],slide=0,motion,changing=false;
const $=s=>document.querySelector(s),shelf=$('#shelf'),detail=$('#detail');
motionReady.then(m=>motion=m);
function paintRotation(playing){document.body.classList.toggle('record-playing',playing);$('#rotation').setAttribute('aria-pressed',String(playing));$('#rotation').setAttribute('aria-label',playing?'레코드 회전 일시정지':'레코드 재생');$('#rotation').textContent=playing?'Ⅱ  33⅓ RPM':'▶  PLAY RECORD'}
document.addEventListener('record-play',()=>paintRotation(true));
document.addEventListener('record-pause',()=>paintRotation(false));
document.addEventListener('record-toggle',()=>document.dispatchEvent(new Event(document.body.dataset.audioState==='blocked'?'record-play':document.body.classList.contains('record-playing')?'record-pause':'record-play')));
paintRotation(true);
$('#rotation').addEventListener('click',()=>{if(document.body.classList.contains('record-playing')){paintRotation(false);document.dispatchEvent(new Event('record-pause'))}else document.dispatchEvent(new Event('record-play'))});
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
function updateAlbum(){document.body.dataset.album=selected.id;$('#album-title').textContent=selected.title;$('#album-number').textContent=selected.number;$('#album-subtitle').textContent=selected.english;$('#album-detail').href=`#${selected.id}`;$('#current-section').textContent=`${selected.number} / ${selected.title}`;cabinet();document.dispatchEvent(new CustomEvent('album-change',{detail:selected}))}
async function closeShelf(){if(!shelf.open)return;await animate(shelf,{x:[0,-45],opacity:[1,0],duration:220,ease:'inQuad'});shelf.close();shelf.style.removeProperty('transform');shelf.style.removeProperty('opacity');document.body.classList.remove('shelf-open');$('#shelf-open').setAttribute('aria-expanded','false');$('#shelf-open').focus()}
$('#shelf-open').addEventListener('click',()=>{cabinet();shelf.showModal();document.body.classList.add('shelf-open');$('#shelf-open').setAttribute('aria-expanded','true');animate(shelf,{x:['-100%',0],opacity:[.5,1],duration:520,ease:'outCubic'});$('#shelf-close').focus()});
$('#shelf-close').addEventListener('click',closeShelf);shelf.addEventListener('cancel',e=>{e.preventDefault();closeShelf()});shelf.addEventListener('click',e=>{if(e.target===shelf){const r=shelf.getBoundingClientRect();if(e.clientX>r.right||e.clientY>r.bottom||e.clientX<r.left||e.clientY<r.top)closeShelf()}});
async function selectAlbum(album,button){if(changing)return;changing=true;await animate(button,{y:[0,-12],scale:[1,1.04],opacity:[1,0],duration:240,ease:'inQuad'});selected=album;updateAlbum();await closeShelf();changing=false;$('#album-detail').focus({preventScroll:true})}
function renderSlide(){const [tag,title,copy]=selected.entries[slide];$('#detail-kicker').textContent=`${selected.number} / ${selected.title} · ${selected.era}`;$('#detail-number').textContent=String(slide+1).padStart(2,'0');$('#detail-title').textContent=title;$('#detail-description').textContent=tag;$('#detail-content').replaceChildren();const p=document.createElement('p');p.className='slide-copy';p.textContent=copy;$('#detail-content').append(p);if(selected.id==='about'&&slide===2){const link=document.createElement('a');link.className='github-link';link.href='https://github.com/H-SeungWoo';link.target='_blank';link.rel='noopener noreferrer';link.textContent='GitHub · H-SeungWoo ↗';$('#detail-content').append(link)}$('#slide-count').textContent=`${String(slide+1).padStart(2,'0')} / ${String(selected.entries.length).padStart(2,'0')}`;$('#previous').disabled=slide===0;$('#next').disabled=slide===selected.entries.length-1}
async function step(direction){if(changing||detail.hidden)return;const next=slide+direction;if(next<0||next>=selected.entries.length)return;changing=true;await animate([$('.detail-heading'),$('#detail-content')],{opacity:[1,0],x:[0,-direction*24],duration:160,ease:'inQuad'});slide=next;renderSlide();await animate([$('.detail-heading'),$('#detail-content')],{opacity:[0,1],x:[direction*32,0],duration:360,ease:'outCubic'});changing=false}
const notice=$('#preparing');
function showPreparing(){if(!notice.open)notice.showModal()}
$('#preparing-close').addEventListener('click',()=>notice.close());
notice.addEventListener('close',()=>$('#album-detail').focus({preventScroll:true}));
$('#album-detail').addEventListener('click',e=>{if(selected.id!=='about'){e.preventDefault();showPreparing()}});
function route(){let album=albums.find(a=>a.id===location.hash.slice(1));const unavailable=album&&album.id!=='about';if(unavailable){if(selected!==album){selected=album;updateAlbum()}history.replaceState(null,'',location.pathname+location.search);album=null}if(album){if(selected!==album){selected=album;updateAlbum()}slide=0;renderSlide()}detail.hidden=!album;document.body.classList.toggle('detail-mode',!!album);$('.collection').inert=!!album;$('#shelf-open').hidden=!!album;document.title=album?`${album.title} — Personal Records`:'Personal Records — The Listening Room';if(album){animate(detail,{opacity:[0,1],y:[40,0],duration:550,ease:'outCubic'});$('#detail-title').focus({preventScroll:true})}window.scrollTo(0,0);if(unavailable)showPreparing()}
$('#back').addEventListener('click',()=>{location.hash='';setTimeout(()=>$('#album-detail').focus({preventScroll:true}),0)});$('#previous').addEventListener('click',()=>step(-1));$('#next').addEventListener('click',()=>step(1));
let wheelSum=0,wheelTime=0;detail.addEventListener('wheel',e=>{if(e.ctrlKey)return;const canScroll=detail.scrollHeight>detail.clientHeight+2;if(canScroll&&((e.deltaY>0&&detail.scrollTop+detail.clientHeight<detail.scrollHeight-2)||(e.deltaY<0&&detail.scrollTop>0)))return;e.preventDefault();const now=Date.now();if(now-wheelTime<650||changing)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)>45){step(Math.sign(wheelSum));wheelSum=0;wheelTime=now}},{passive:false});
document.addEventListener('keydown',e=>{if(detail.hidden||shelf.open||e.altKey||e.ctrlKey||e.metaKey)return;if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();step(e.key==='ArrowRight'?1:-1)}});
window.addEventListener('hashchange',route);$('#year').textContent=new Date().getFullYear();updateAlbum();route();setupSoundtrack();

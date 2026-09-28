import { albums } from './albums.js';
import { motionReady } from './motion.js';
// A compact, procedural Three.js turntable. No external model or texture files.
const host = document.querySelector('#scene');
try {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  host.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const camera = new THREE.PerspectiveCamera(36,1,.1,50);
  const rig = new THREE.Group();scene.add(rig);rig.rotation.y=-.18;
  function canvasTexture(draw,size=1024){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;}
  // Studio reflections: broad warm light and a narrow cool reflection strip.
  const envCanvas=document.createElement('canvas');envCanvas.width=1024;envCanvas.height=512;
  const e=envCanvas.getContext('2d');e.fillStyle='#090b0c';e.fillRect(0,0,1024,512);
  const glow=e.createRadialGradient(270,170,10,270,170,260);glow.addColorStop(0,'#fff7e8');glow.addColorStop(.3,'#8e9494');glow.addColorStop(1,'#090b0c');e.fillStyle=glow;e.fillRect(0,0,650,512);
  e.fillStyle='#a6b5b8';e.fillRect(735,80,35,210);e.fillStyle='#e7d4b1';e.fillRect(350,30,230,35);
  const env=new THREE.CanvasTexture(envCanvas);env.mapping=THREE.EquirectangularReflectionMapping;env.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer);const envTarget=pmrem.fromEquirectangular(env);scene.environment=envTarget.texture;env.dispose();pmrem.dispose();
  const walnut=canvasTexture((ctx,s)=>{ctx.fillStyle='#3e2518';ctx.fillRect(0,0,s,s);let seed=41;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};for(let i=0;i<1800;i++){const y=rand()*s;ctx.strokeStyle=`rgba(${rand()>.5?'125,83,44':'12,8,5'},${.06+rand()*.2})`;ctx.lineWidth=.3+rand()*2.8;ctx.beginPath();for(let x=0;x<=s;x+=16){const yy=y+Math.sin(x*.009+y*.022)*3+Math.sin(x*.024+y)*1.2;x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy)}ctx.stroke()}});
  const grooves=canvasTexture((ctx,s)=>{ctx.fillStyle='#747474';ctx.fillRect(0,0,s,s);for(let r=160;r<510;r+=5){const v=Math.round(90+32*Math.sin(r*2.6));ctx.strokeStyle=`rgb(${v},${v},${v})`;ctx.lineWidth=.7;ctx.beginPath();ctx.arc(s/2,s/2,r,0,Math.PI*2);ctx.stroke()}});grooves.colorSpace=THREE.NoColorSpace;
  const label=canvasTexture((ctx,s)=>{ctx.fillStyle='#916a47';ctx.fillRect(0,0,s,s);ctx.strokeStyle='#30221955';ctx.lineWidth=3;for(const r of [450,430,150]){ctx.beginPath();ctx.arc(s/2,s/2,r,0,Math.PI*2);ctx.stroke()}ctx.fillStyle='#302218';ctx.textAlign='center';ctx.font='24px sans-serif';ctx.fillText('P E R S O N A L   R E C O R D S',512,220);ctx.font='italic 86px Georgia';ctx.fillText('After hours.',512,365);ctx.font='23px sans-serif';ctx.fillText('H - S E U N G W O O',512,425);ctx.font='21px sans-serif';ctx.fillText('SIDE A     •     STEREO',512,705);ctx.font='17px sans-serif';ctx.fillText('THE ORIGINAL COLLECTION / 001',512,760);ctx.font='34px Georgia';ctx.fillText('33⅓',512,835)});
  const black=new THREE.MeshStandardMaterial({color:0x101210,roughness:.45,metalness:.25});
  const silver=new THREE.MeshStandardMaterial({color:0xb0aba0,metalness:.95,roughness:.23});
  const brass=new THREE.MeshStandardMaterial({color:0xb89353,metalness:.8,roughness:.32});
  const wood=new THREE.MeshStandardMaterial({map:walnut,roughness:.48,metalness:0});
  function mesh(geo,mat,parent=rig){const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
  function cylinder(radius,height,mat,x,y,z,parent=rig){const m=mesh(new THREE.CylinderGeometry(radius,radius,height,96),mat,parent);m.position.set(x,y,z);return m}
  function box(w,h,d,mat,x,y,z,parent=rig){const m=mesh(new THREE.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m}
  // Soft bevels keep the wooden chassis from looking like an unlit block.
  const shape=new THREE.Shape(),w=5.5,d=4.15,r=.18;
  shape.moveTo(-w/2+r,-d/2);shape.lineTo(w/2-r,-d/2);shape.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);shape.lineTo(w/2,d/2-r);shape.quadraticCurveTo(w/2,d/2,w/2-r,d/2);shape.lineTo(-w/2+r,d/2);shape.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);shape.lineTo(-w/2,-d/2+r);shape.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);
  const chassis=mesh(new THREE.ExtrudeGeometry(shape,{depth:.36,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.045,bevelThickness:.045}),wood);chassis.rotation.x=-Math.PI/2;chassis.position.y=.22;
  box(5.24,.04,3.9,new THREE.MeshStandardMaterial({color:0x121614,roughness:.65,metalness:.25}),0,.63,0);
  for(const x of [-2.1,2.1])for(const z of [-1.5,1.5])cylinder(.24,.2,black,x,.13,z);
  cylinder(1.86,.12,silver,-.52,.72,0);cylinder(1.82,.06,black,-.52,.8,0);
  // Platter strobe marks catch the light along the silver rim.
  const dotGeo=new THREE.BoxGeometry(.035,.035,.025);const marks=new THREE.InstancedMesh(dotGeo,silver,140);const transform=new THREE.Object3D();for(let i=0;i<140;i++){const a=i/140*Math.PI*2;transform.position.set(-.52+Math.cos(a)*1.866,.725,Math.sin(a)*1.866);transform.rotation.y=-a;transform.updateMatrix();marks.setMatrixAt(i,transform.matrix)}rig.add(marks);
  const vinyl=new THREE.Group();vinyl.position.set(-.52,.87,0);rig.add(vinyl);
  const vinylMat=new THREE.MeshPhysicalMaterial({color:0x050606,metalness:.38,roughness:.24,clearcoat:.35,clearcoatRoughness:.18,bumpMap:grooves,bumpScale:.008,envMapIntensity:.7});
  cylinder(1.77,.035,black,0,0,0,vinyl);
  const surface=mesh(new THREE.CircleGeometry(1.765,160),vinylMat,vinyl);surface.rotation.x=-Math.PI/2;surface.position.y=.02;
  // Sparse, subdued rings remain readable at lower pixel density.
  const ringMat=new THREE.MeshStandardMaterial({color:0x555b58,roughness:.3,metalness:.55,transparent:true,opacity:.28});
  for(let i=0;i<70;i++){const rr=.66+i*.0154;const ring=mesh(new THREE.RingGeometry(rr,rr+.003,128),ringMat,vinyl);ring.rotation.x=-Math.PI/2;ring.position.y=.021}
  const paper=mesh(new THREE.CircleGeometry(.59,96),new THREE.MeshStandardMaterial({map:label,roughness:.9}),vinyl);paper.rotation.x=-Math.PI/2;paper.position.y=.025;
  cylinder(.055,.17,silver,-.52,.955,0);cylinder(.14,.013,brass,-.52,.904,0);
  // Tonearm pivot and articulated arm.
  cylinder(.23,.08,silver,1.96,.71,-1.34);cylinder(.16,.38,black,1.96,.91,-1.34);cylinder(.1,.44,silver,1.96,1.03,-1.34);
  const arm=new THREE.Group();arm.position.set(1.96,1.19,-1.34);rig.add(arm);
  const points=[new THREE.Vector3(0,0,-.4),new THREE.Vector3(0,0,0),new THREE.Vector3(-.03,-.015,.75),new THREE.Vector3(-.22,-.13,1.57),new THREE.Vector3(-.4,-.16,1.85)];
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,.038,12,false),silver,arm);
  const counter=mesh(new THREE.CylinderGeometry(.14,.14,.3,48),silver,arm);counter.rotation.x=Math.PI/2;counter.position.z=-.36;
  const head=box(.18,.085,.34,black,-.39,-.16,1.82,arm);head.rotation.y=-.35;
  box(.09,.07,.14,new THREE.MeshStandardMaterial({color:0x9e6f37,metalness:.3,roughness:.5}),-.4,-.235,1.84,arm);
  box(.015,.08,.015,silver,-.4,-.29,1.87,arm);
  cylinder(.13,.065,silver,-2.24,.7,1.5);cylinder(.09,.02,black,-2.24,.744,1.5);
  const led=new THREE.MeshStandardMaterial({color:0xe9b76b,emissive:0xf29c35,emissiveIntensity:1.6});cylinder(.025,.018,led,-1.95,.667,1.54);
  box(.52,.012,.2,brass,1.96,.667,1.6);
  const floor=mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.38}),scene);floor.rotation.x=-Math.PI/2;floor.position.y=-.015;
  scene.add(new THREE.HemisphereLight(0xc0c8c0,0x302116,1.0));
  const key=new THREE.SpotLight(0xffd29a,48,25,Math.PI/5,.75,1.5);key.position.set(-3,7,-3);key.target.position.set(-.6,0,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0003;key.shadow.normalBias=.035;scene.add(key,key.target);
  const rim=new THREE.DirectionalLight(0xb3c5ca,1.4);rim.position.set(4,3,-3);scene.add(rim);
  const warm=new THREE.PointLight(0xe7a864,7,12,2);warm.position.set(-4,1.8,-2);scene.add(warm);
  let rotating=document.body.classList.contains('record-playing');
  let width=1,height=1,active=false,hover=0,targetHover=0,angle=0,velocity=3.49,last=0,raf=0,disposed=false;
  const look=new THREE.Vector3(), target=new THREE.Vector3(); const cameraIntro={progress:reduced.matches?1:0}; let introAnimation; camera.up.set(0,0,-1);
  function resize(){const rect=host.getBoundingClientRect();width=rect.width;height=rect.height;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();if(reduced.matches)draw(performance.now())}
  const observer=new ResizeObserver(resize);observer.observe(host);
  function state(){active=albums.some(a=>'#'+a.id===location.hash);if(reduced.matches)draw(performance.now())}
  window.addEventListener('hashchange',state);state();
  const rotationButton=document.querySelector('#rotation');
  function play(){rotating=true;document.body.classList.add('record-playing');rotationButton.setAttribute('aria-pressed','true');rotationButton.textContent='Ⅱ  33⅓ RPM';rotationButton.setAttribute('aria-label','레코드 회전 일시정지')}
  document.addEventListener('record-play',play);
  document.addEventListener('record-pause',()=>rotating=false);
  function albumLabel(album){const ctx=label.image.getContext('2d');ctx.fillStyle=album.color;ctx.fillRect(0,0,1024,1024);ctx.fillStyle='#231c17';ctx.textAlign='center';ctx.font='26px sans-serif';ctx.fillText('P E R S O N A L   R E C O R D S',512,230);ctx.font='italic 80px Georgia';album.cover.split('\n').forEach((line,i)=>ctx.fillText(line,512,355+i*95));ctx.font='30px sans-serif';ctx.fillText(album.title,512,680);ctx.font='24px sans-serif';ctx.fillText(album.era,512,745);ctx.fillText('No. '+album.number+'     /     33⅓ RPM',512,825);label.needsUpdate=true;if(reduced.matches)draw(performance.now())}
  document.addEventListener('album-change',event=>{albumLabel(event.detail);motionReady.then(m=>{if(m&&!reduced.matches)m.animate(vinyl.position,{y:[1.9,.87],duration:850,ease:'outCubic'})})});
  albumLabel(albums.find(a=>a.id===document.body.dataset.album)||albums[0]);
  document.querySelectorAll('[data-track]').forEach((el,index)=>{el.addEventListener('pointerenter',()=>targetHover=(index%2?1:-1));el.addEventListener('pointerleave',()=>targetHover=0)});
  function draw(time){if(disposed)return;const dt=Math.min((time-last)/1000||.016,.05);last=time;const narrow=matchMedia('(max-width:900px)').matches;
    const blend=reduced.matches?1:1-Math.exp(-dt*3);velocity=3.49;
    if(!reduced.matches&&rotating)angle+=dt*velocity;vinyl.rotation.y=-angle;
    hover+=(targetHover-hover)*blend;
    const p=reduced.matches?1:cameraIntro.progress;
    target.set(0,THREE.MathUtils.lerp(7.6,10.4,p),THREE.MathUtils.lerp(8.6,0,p));
    if(narrow)target.multiplyScalar(1.07);
    camera.position.copy(target);look.set(0,.4,0);camera.lookAt(look);
    rig.rotation.y=THREE.MathUtils.lerp(-.18,0,p);arm.rotation.y=-.37;
    if(!document.body.classList.contains('detail-mode'))renderer.render(scene,camera);
    if(!reduced.matches&&!document.hidden)raf=requestAnimationFrame(draw);
  }
  camera.position.set(0,7.6,8.6);resize();draw(performance.now());document.body.classList.add('scene-ready');
  motionReady.then(motion=>{if(reduced.matches||active||!motion){cameraIntro.progress=1;return}introAnimation=motion.animate(cameraIntro,{progress:1,delay:400,duration:2600,ease:'inOutCubic',onComplete:()=>{document.body.dataset.cameraView='top'}})});
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);if(!document.hidden){last=performance.now();draw(last)}});
  reduced.addEventListener('change',()=>{introAnimation?.pause();cameraIntro.progress=1;cancelAnimationFrame(raf);draw(performance.now())});
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(raf);document.body.classList.remove('scene-ready');document.body.classList.add('scene-failed')});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{document.body.classList.add('scene-ready');document.body.classList.remove('scene-failed');draw(performance.now())});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf)});
  window.addEventListener('pageshow',event=>{if(event.persisted){last=performance.now();draw(last)}});
} catch(error) {
  document.body.classList.add('scene-failed');
  console.warn('3D scene unavailable; showing the static record.',error);
}







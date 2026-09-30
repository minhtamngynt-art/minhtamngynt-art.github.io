/* One visual playhead: native reading scroll plus quick desktop wheel transitions. */
(()=>{
const M=window.CinematicMotion,sections=[...document.querySelectorAll('section')];
// The owner explicitly requests full motion; a per-site toggle remains available.
const motionEvents=new EventTarget(),reduced={matches:false,addEventListener:(...args)=>motionEvents.addEventListener(...args)};
try{reduced.matches=localStorage.getItem('minhtam-motion')==='reduced'}catch{}
document.body.classList.toggle('motion-enabled',!reduced.matches);document.body.classList.toggle('motion-reduced',reduced.matches);
const motionButton=document.createElement('button');motionButton.className='motion-toggle';motionButton.type='button';document.body.append(motionButton);
function motionLabel(){motionButton.textContent=reduced.matches?'Motion · reduced':'Motion · on';motionButton.setAttribute('aria-label',reduced.matches?'Enable full motion':'Reduce motion');motionButton.setAttribute('aria-pressed',String(!reduced.matches))}motionLabel();
motionButton.addEventListener('click',()=>{reduced.matches=!reduced.matches;document.body.classList.toggle('motion-enabled',!reduced.matches);document.body.classList.toggle('motion-reduced',reduced.matches);try{localStorage.setItem('minhtam-motion',reduced.matches?'reduced':'full')}catch{}motionLabel();motionEvents.dispatchEvent(new Event('change'))});
const coin=document.querySelector('#traveler');window.history.scrollRestoration='manual';document.body.classList.add('cinematic');
for(const s of sections){const inner=document.createElement('div');inner.className='scene-inner';while(s.firstChild)inner.append(s.firstChild);s.append(inner)}
// Independent transparent botanical layers; never include baked coins, cloth or columns.
for(const [id,asset] of Object.entries(window.SceneSettings.flowers)){
 const scene=document.getElementById(id),decor=document.createElement('div');decor.className='botanical-decor';decor.setAttribute('aria-hidden','true');
 for(const side of ['left','right']){const img=document.createElement('img');img.src=`assets/botanical/${asset}.png`;img.alt='';img.className=`botanical-${side}`;img.decoding='async';decor.append(img)}scene.prepend(decor);
}
sections.at(-1).querySelector('.scene-inner').append(document.querySelector('footer'));
const runway=document.createElement('div');runway.id='scroll-runway';runway.setAttribute('aria-hidden','true');document.body.append(runway);
const atmosphere=document.createElement('div');atmosphere.className='atmosphere';atmosphere.setAttribute('aria-hidden','true');atmosphere.innerHTML='<div class="halo"></div><div class="portal portal-one"></div><div class="portal portal-two"></div><div class="portal portal-three"></div><div class="perspective-floor"></div>'+Array.from({length:20},(_,i)=>`<i class="mote" style="--x:${(i*37)%100}%;--y:${(i*19)%100}%;--s:${2+i%3}px"></i>`).join('');document.body.prepend(atmosphere);
const passage=document.createElement('div');passage.className='lens-passage';passage.setAttribute('aria-hidden','true');passage.innerHTML='<i></i><i></i><i></i>';document.body.append(passage);
const timeline=document.querySelector('.timeline');timeline.innerHTML=sections.map((s,i)=>`<a href="#${s.id}" aria-label="0${i+1} ${s.dataset.name}"><b>0${i+1}</b><span>${s.dataset.name}</span></a>`).join('');
const readout=document.createElement('div');readout.className='scene-readout';readout.innerHTML='<span id="scene-title">01 / HOME</span><span class="journey-line"><i></i></span><span>SCROLL TO EXPLORE ↓</span>';document.body.append(readout);
const label=readout.querySelector('#scene-title'),progressBar=readout.querySelector('i'),links=[...timeline.querySelectorAll('a')];
coin.innerHTML='<span class="drum-disc"></span>';
const finalSeal=document.createElement('span');finalSeal.className='final-drum-seal';finalSeal.setAttribute('aria-hidden','true');finalSeal.innerHTML='<span class="drum-disc"></span>';document.querySelector('.notes-anchor').append(finalSeal);
const record=document.querySelector('.record');
record.querySelector('.record-label').textContent='';
document.querySelector('.player-info').insertAdjacentHTML('afterbegin','<div class="music-levels" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>');
const trail=document.querySelector('#trail-path'),trailSvg=document.querySelector('.trail'),inners=sections.map(s=>s.querySelector('.scene-inner'));
const layers=sections.map(s=>[...s.querySelectorAll('.hero-grid>div,.arch,.section-heading,.player-info,.about-copy,.portrait,.paper-grid>.paper,.gallery:not(.more)>.photo-card,.scrapbook>.paper,.scrapbook>.memory')]);layers.flat().forEach(el=>el.classList.add('scene-layer'));
let layout=[],total=0,width=0,height=0,rendered=scrollY,target=scrollY,lastTime=0,raf=0,active=-1,visibleKey='',measureRaf=0,lastPose=null,tail=[],spin=0,playing=false;
let wheelTween=null,lastWheelAt=-Infinity,lastWheelDirection=0;
const identity={x:0,y:0,s:1,r:0,opacity:1};
function localPoint(el){if(!el)return null;const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}}
function measure(){const previousTween=wheelTween&&{...wheelTween,destination:context(wheelTween.to)};wheelTween=null;const previous=layout.length?context(M.clamp(scrollY,0,total)):null;measureRaf=0;const saved=sections.map((s,i)=>[s.style.transform,inners[i].style.transform]);sections.forEach((s,i)=>{s.style.transform='none';inners[i].style.transform='none'});const layerSaved=layers.flat().map(el=>el.style.translate);layers.flat().forEach(el=>el.style.translate='none');const recordTransform=record.style.transform;record.style.transform='none';width=document.documentElement.clientWidth;height=innerHeight;let start=0;layout=sections.map((s,i)=>{const overflow=Math.max(0,inners[i].offsetHeight-height+28),read=i===1?height*.015:Math.max(height*.34,overflow+height*.25),transition=i===6?0:height*[.85,.65,1.15,1.08,1.15,1.1][i];const l={start,read,transition,overflow,anchor:localPoint(s.querySelector(i===2?'.turntable':'[data-anchor]')),recordWidth:i===2?s.querySelector('.turntable').getBoundingClientRect().width:0};start+=read+transition;return l});sections.forEach((s,i)=>{s.style.transform=saved[i][0];inners[i].style.transform=saved[i][1]});layers.flat().forEach((el,i)=>el.style.translate=layerSaved[i]);record.style.transform=recordTransform;total=start;runway.style.height=`${total+height}px`;if(previous){const next=layout[previous.index],newY=next.start+(previous.t>0?next.read+previous.t*next.transition:previous.reading*next.read);if(Math.abs(newY-scrollY)>.5){scrollTo({top:newY,behavior:'instant'});rendered=newY}}target=M.clamp(scrollY,0,total);rendered=M.clamp(rendered,0,total);window.medallionRenderer?.resize();if(previousTween){const d=previousTween.destination,l=layout[d.index],to=l.start+(d.t>0?l.read+d.t*l.transition:d.reading*l.read);wheelTween={from:rendered,to:M.clamp(to,0,total),time:performance.now(),duration:Math.max(160,previousTween.duration-(performance.now()-previousTween.time))}}wake()}
function queueMeasure(){if(!measureRaf)measureRaf=requestAnimationFrame(measure)}
function context(y){const index=layout.findIndex((l,i)=>y<l.start+l.read+l.transition||i===6),l=layout[index],local=Math.max(0,y-l.start);return{index,next:Math.min(index+1,6),reading:M.clamp(local/l.read),t:M.clamp((local-l.read)/Math.max(1,l.transition)),l}}
function shiftFor(l,reading){return l.overflow*M.clamp((reading-.07)/.86)}
function resting(index,reading=0){const w=width,h=height,mobile=w<700,l=layout[index],shift=shiftFor(l,reading);let p;
if(index===0)p={x:w*.5,y:mobile?h*.77:h/2+403*Math.min(w/1440,h/1200),size:mobile?70:180*Math.min(w/1440,h/1200),rx:0,ry:-12,rz:0};
else if(index===1)p={x:w*(mobile?.67:.64),y:h*.48,size:Math.min(w*.27,205),rx:5,ry:-15,rz:12};
else if(index===2)p={x:l.anchor.x,y:l.anchor.y-shift,size:l.recordWidth*.42,rx:0,ry:0,rz:spin};
else if(index<6){const stop=window.SceneSettings.stops[index],point=stop[mobile?'mobile':'desktop'];p={x:w*point.x,y:h*point.y,size:point.size,rx:stop.rx,ry:stop.ry,rz:stop.rz}}
else{const a=l.anchor;p={x:a.x,y:a.y-shift,size:mobile?76:96,rx:0,ry:0,rz:7}}
if(index>2&&index!==6&&!reduced.matches){const d=Math.sin(reading*Math.PI)**2;p.y-=d*h*.018;p.ry+=d*5}return p}
function sceneTransform(index,c,shift){const s=sections[index];s.style.transform=`translate3d(${c.x}px,${c.y}px,0) rotate(${c.r}deg) scale(${c.s})`;s.style.opacity=String(c.opacity);inners[index].style.transform=`translate3d(0,${-shift}px,0)`}
function layerMotion(index,t,incoming){layers[index].forEach((el,j)=>{const q=incoming?1-M.phase(t,.48+j%3*.05,.94):M.phase(t,.02+j%3*.03,.42),distance=(incoming?1:-1)*(22+(j%3)*17);el.style.translate=`0 ${reduced.matches?0:q*distance}px`;el.style.opacity=String(1-q*.65)})}
function restoreLayers(index){layers[index].forEach(el=>{el.style.translate='0 0';el.style.opacity='1'})}
const flowerLayers=sections.map(s=>s.querySelector('.botanical-decor'));
function animateFlowers(index,reading,t,mode){const el=flowerLayers[index];if(!el)return;const f=M.flowerState(index,reading,t,mode,reduced.matches);el.style.transform=`scale(${f.scale}) rotate(${f.rotate}deg)`;el.style.opacity=String(f.opacity)}
function render(now){const {index,next,t,reading,l}=context(rendered),q=M.ease(t),shift=shiftFor(l,reading),isTransition=t>0&&index!==next;
const key=`${index}:${isTransition}`;if(key!==visibleKey){visibleKey=key;sections.forEach((s,i)=>{s.style.visibility=i===index||(isTransition&&i===next)?'visible':'hidden';const visible=i===index||(isTransition&&i===next);s.style.willChange=visible?'transform,opacity':'auto';inners[i].style.willChange=visible?'transform':'auto';const flowers=s.querySelector('.botanical-decor');if(flowers)flowers.style.willChange=visible?'transform,opacity':'auto'});restoreLayers(index);if(next!==index)restoreLayers(next)}
const which=t>.56?next:index;if(active!==which){active=which;label.textContent=`0${active+1} / ${sections[active].dataset.name.toUpperCase()}`;sections.forEach((s,i)=>{s.inert=i!==active;s.style.pointerEvents=i===active?'auto':'none';s.setAttribute('aria-hidden',String(i!==active))});links.forEach((a,i)=>{a.classList.toggle('active',i===active);i===active?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current')})}
let outgoing=isTransition?M.camera(index,t,false,width,height):identity,incoming=isTransition?M.camera(index,t,true,width,height):identity;if(reduced.matches){outgoing={...identity,opacity:active===index?1:0};incoming={...identity,opacity:active===next?1:0}}
sceneTransform(index,outgoing,shift);if(isTransition){sceneTransform(next,incoming,0);layerMotion(index,t,false);layerMotion(next,t,true)}
animateFlowers(index,reading,t,isTransition?'exit':'rest');if(isTransition)animateFlowers(next,0,t,'enter');
const from=resting(index,reading),to=resting(next,0);let pose;
if(isTransition&&!reduced.matches){pose=M.transition(index,t,from,to,width,height);if(index===2){const dock=M.project(from,outgoing,width,height),weight=1-M.phase(t,0,.28);pose.x=M.lerp(pose.x,dock.x,weight);pose.y=M.lerp(pose.y,dock.y,weight)}if(next===2){const dock=M.project(to,incoming,width,height),weight=M.phase(t,.68,1);pose.x=M.lerp(pose.x,dock.x,weight);pose.y=M.lerp(pose.y,dock.y,weight);pose.size=M.lerp(pose.size,to.size*incoming.s,weight)}}else pose=resting(active,active===index?reading:0);
if(reduced.matches)pose.rx=pose.ry=pose.rz=0;
// The final seal belongs to the letter, so it can never drift to the footer.
const landed=index===6;finalSeal.style.opacity=landed?'1':'0';pose.opacity=landed?0:index===1?M.lerp(1,.8,q):index===2?M.lerp(.8,1,q):1;pose.glow=(pose.glow||0)+window.SceneSettings.glow;
coin.style.visibility=landed?'hidden':'visible';record.style.transform=`rotate(${spin}deg)`;
coin.style.transform=`translate3d(${pose.x-50}px,${pose.y-50}px,0) perspective(700px) rotateX(${pose.rx||0}deg) rotateY(${pose.ry||0}deg) rotateZ(${pose.rz||0}deg) scale(${pose.size/100})`;if(window.medallionRenderer?.ready){window.medallionRenderer.setPose(pose);window.medallionRenderer.render(now)}
const distance=lastPose?Math.hypot(pose.x-lastPose.x,pose.y-lastPose.y):0;if(distance>.4){tail.push({x:pose.x,y:pose.y,time:now});if(tail.length>16)tail.shift()}tail=tail.filter(p=>now-p.time<220);lastPose=pose;if(tail.length>2&&isTransition&&!reduced.matches){trail.setAttribute('d','M '+tail.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L '));trailSvg.style.opacity=String(Math.min(.45,distance*.04))}else trailSvg.style.opacity='0';
window.OpeningStoryboard?.render({index,t,pose,from,to,width,height,reduced:reduced.matches});
const travel=(index+q)/6;atmosphere.style.setProperty('--travel',travel.toFixed(4));atmosphere.style.setProperty('--zoom',(1+travel*.36).toFixed(4));atmosphere.style.setProperty('--orbit',`${travel*-24}deg`);
const near=(index===0?1:index===1?.65:.24)*Math.sin(q*Math.PI)**2;passage.style.opacity=reduced.matches?'0':String(index<3?0:near*.65);passage.style.transform=`translate3d(${(q-.5)*width*.35}px,${(1-q)*height*.55}px,0) scale(${M.scale(.62,2.4,q)}) rotate(${q*-20}deg)`;progressBar.style.transform=`scaleX(${rendered/Math.max(1,total)})`;
}
function tick(now){
 raf=0;if(!layout.length||document.hidden){lastTime=0;return}
 const dt=Math.min(64,lastTime?now-lastTime:16.67);lastTime=now;
 if(wheelTween){
  const q=M.clamp((now-wheelTween.time)/wheelTween.duration);
  // Choreography already eases each scene; avoid a second slow settling filter.
  rendered=M.lerp(wheelTween.from,wheelTween.to,q);target=rendered;
  scrollTo({top:rendered,behavior:'instant'});
  if(q===1)wheelTween=null;
 }else{
  target=M.clamp(scrollY,0,total);const error=target-rendered;
  rendered=reduced.matches?target:rendered+error*(1-Math.exp(-dt/55));
  if(Math.abs(error)<.08)rendered=target;
 }
 const c=context(rendered),needsSpin=playing&&!reduced.matches&&c.index===2&&c.t===0;
 if(needsSpin)spin=(spin+dt*.03)%360;
 render(now);
 if(wheelTween||Math.abs(target-rendered)>.08||needsSpin)raf=requestAnimationFrame(tick);else lastTime=0;
}
// Leave forms, dialogs, embedded players and nested scrolling lists in control of their wheel.
function ownsWheel(node){
 if(!(node instanceof Element))return false;
 if(node.closest('input,textarea,select,[contenteditable="true"],dialog,.youtube-panel,#music-queue'))return true;
 for(let el=node;el&&el!==document.body;el=el.parentElement){
  if(el.scrollHeight>el.clientHeight+2&&/auto|scroll/.test(getComputedStyle(el).overflowY))return true;
 }
 return false;
}
addEventListener('wheel',e=>{
 if(!layout.length||width<=700||!matchMedia('(any-pointer: fine)').matches||e.ctrlKey||e.metaKey||e.shiftKey||e.defaultPrevented||!e.cancelable||Math.abs(e.deltaX)>Math.abs(e.deltaY)||!e.deltaY||ownsWheel(e.target))return;
 const now=performance.now(),direction=Math.sign(e.deltaY),gap=now-lastWheelAt;
 // Ignore the remaining events of the same gesture, so it cannot skip chapters.
 if((wheelTween||gap<160)&&direction===lastWheelDirection){lastWheelAt=now;if(wheelTween||lastWheelDirection){e.preventDefault();return}}
 // Small/fractional trackpad deltas keep continuous scrubbing.
 const discrete=e.deltaMode!==0||(Number.isInteger(e.deltaY)&&Math.abs(e.deltaY)>=40);
 if(!discrete){wheelTween=null;return}
 wheelTween=null;
 const step=M.wheelStep(layout,M.clamp(scrollY,0,total),direction);
 if(!step){lastWheelDirection=0;return}
 e.preventDefault();lastWheelAt=now;lastWheelDirection=direction;
 const to=M.clamp(step.to,0,total);
 if(reduced.matches){scrollTo({top:to,behavior:'instant'});rendered=to}
 else{wheelTween={from:step.from,to,time:now,duration:context(step.from).index===1?(window.SceneSettings.wheelFallDuration||700):(window.SceneSettings.wheelDuration||1000)};rendered=step.from;scrollTo({top:step.from,behavior:'instant'})}
 wake();
},{passive:false});
for(const type of ['touchstart','pointerdown','keydown'])addEventListener(type,()=>{wheelTween=null;lastWheelDirection=0},{passive:true});
function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(tick)}
addEventListener('scroll',wake,{passive:true});addEventListener('resize',queueMeasure);document.fonts.ready.then(queueMeasure);new ResizeObserver(queueMeasure).observe(document.querySelector('main'));const ro=new ResizeObserver(queueMeasure);inners.forEach(el=>ro.observe(el));reduced.addEventListener('change',wake);document.addEventListener('visibilitychange',()=>{if(!document.hidden){rendered=M.clamp(scrollY,0,total);wake()}});document.addEventListener('medallion-ready',wake);
document.addEventListener('soundtrack-state',e=>{playing=!!e.detail.playing;wake()});
function goTo(id,instant=false){wheelTween=null;lastWheelDirection=0;const i=sections.findIndex(s=>s.id===id);if(i<0)return;const top=Math.min(total,Math.ceil(layout[i].start)+1);scrollTo({top,behavior:instant||reduced.matches?'instant':'smooth'});if(instant){rendered=top;wake()}}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const id=a.getAttribute('href').slice(1);window.history.replaceState(null,'','#'+id);goTo(id)}));
addEventListener('hashchange',()=>goTo(location.hash.slice(1)||'home',true));
measure();if(location.hash)goTo(location.hash.slice(1),true);else{rendered=scrollY;wake()}
})();





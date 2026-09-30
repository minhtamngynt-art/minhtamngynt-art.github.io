/* The seven opening keyframes share the existing scroll playhead and audio. */
(()=>{
 const header=document.querySelector('#home header').cloneNode(true);header.className='opening-nav';header.setAttribute('aria-label','Main navigation');document.body.append(header);
 const columns=document.createElement('div');columns.className='opening-columns';columns.setAttribute('aria-hidden','true');columns.innerHTML='<i></i><i></i>';document.body.append(columns);
 // Figma stacking: silk → pillars → dark radial overlay → foreground content.
 const backdrop=document.createElement('div');backdrop.className='opening-backdrop';backdrop.setAttribute('aria-hidden','true');document.body.append(backdrop);
 const shade=document.createElement('div');shade.className='opening-vignette';shade.setAttribute('aria-hidden','true');document.body.append(shade);
 const openingFrames=[
  {nav:1,lx:-9,ly:83,rx:990,ry:17,sx:1.827,sy:-78.859,sw:2246.709,sh:1208.394,angle:-25},
  {nav:0,lx:-65,ly:33,rx:1099,ry:11,sx:-311,sy:48,sw:2246.709,sh:1208.394,angle:0},
  {nav:.8,lx:-65,ly:33,rx:1042,ry:17,sx:-328,sy:-413,sw:2627,sh:1413,angle:0}
 ];
 const table=document.querySelector('.turntable'),deck=document.createElement('div');deck.className='deck';table.before(deck);deck.append(table);deck.insertAdjacentHTML('beforeend','<i class="deck-screw"></i><i class="deck-screw"></i><i class="deck-screw"></i><i class="deck-screw"></i>');
 const canvas=document.createElement('canvas');canvas.className='opening-glitter';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);const ctx=canvas.getContext('2d');let cw=0,ch=0;
 window.OpeningStoryboard={render({index,t,pose,from,to,width:w,height:h,reduced}){
  const M=window.CinematicMotion,opening=index<2?1:index===2?1-M.phase(t,.22,1):0;
  const a=openingFrames[Math.min(index,2)],b=openingFrames[Math.min(index+1,2)],q=M.ease(t);
  const opacity=index<2?M.lerp(a.nav,b.nav,q):index===2?M.lerp(.8,1,q):1;
  const sectionId=["home","home","home","about","papers","world","notes"][t>.56?Math.min(index+1,6):index];
  header.querySelectorAll("nav a").forEach(a=>{const selected=a.getAttribute("href")==="#"+sectionId;a.classList.toggle("active",selected);if(selected)a.setAttribute("aria-current","location");else a.removeAttribute("aria-current")});
  header.style.opacity=String(opacity);header.style.visibility=opacity>.01?'visible':'hidden';header.inert=opacity<.15;
  columns.style.opacity=String(opening);backdrop.style.opacity=String(opening);shade.style.opacity='1';
  document.body.style.setProperty('--opening-visibility',String(opening));
  document.body.classList.toggle('opening-active',index<3);
  if(index<3){
   for(const key of ['lx','ly','rx','ry'])columns.style.setProperty('--'+key,String(M.lerp(a[key],b[key],q)));
   for(const key of ['sx','sy','sw','sh','angle'])backdrop.style.setProperty('--'+key,String(M.lerp(a[key],b[key],q)));
  }
  // Home keeps its own local header for the non-cinematic fallback.
  if(cw!==w||ch!==h){cw=w;ch=h;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(d,0,0,d,0,0)}
  ctx.clearRect(0,0,w,h);if(reduced||index>=6||t<=0||t>=1)return;
  const points=[];for(let k=0;k<=42;k++){const u=Math.max(0,t-.42)+Math.min(t,.42)*k/42;points.push(M.transition(index,u,from,to,w,h))}points[points.length-1]=pose;
  const envelope=Math.sin(Math.PI*M.clamp(t))**.65;ctx.globalCompositeOperation='lighter';
  for(let ribbon=0;ribbon<3;ribbon++){
   ctx.beginPath();points.forEach((p,i)=>{const off=Math.sin(i*.16)*ribbon*4;i?ctx.lineTo(p.x+off,p.y-off):ctx.moveTo(p.x,p.y)});
   ctx.lineWidth=ribbon===0?9:1.2;ctx.strokeStyle=ribbon===0?`rgba(204,129,26,${envelope*.15})`:`rgba(255,205,101,${envelope*.65})`;ctx.shadowBlur=ribbon===0?24:8;ctx.shadowColor='#ffb938';ctx.stroke();
  }
  for(let j=0;j<72;j++){const n=(j*31)%points.length,p=points[n],f=n/(points.length-1),spread=(1-f)*25+6,seed=Math.sin(j*127.1+index*17)*43758.5453,r=seed-Math.floor(seed),a=j*2.39996,x=p.x+Math.cos(a)*spread*r,y=p.y+Math.sin(a)*spread*r;ctx.globalAlpha=envelope*(.12+.7*f)*(.4+.6*r);ctx.fillStyle=j%7?'#efbb60':'#fff1c6';ctx.shadowBlur=j%7?0:13;const size=j%13===0?2.5:.5+r;ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();if(j%19===0){ctx.fillRect(x-4,y-.4,8,.8);ctx.fillRect(x-.4,y-4,.8,8)}}
  ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';
 }};
})();

/* Deterministic camera and object choreography. Angles in degrees, positions in px. */
(function(root){
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{const t=clamp(v);return t*t*t*(t*(t*6-15)+10)};
const lerp=(a,b,t)=>a+(b-a)*t;
const scale=(a,b,t)=>Math.exp(lerp(Math.log(a),Math.log(b),t));
const phase=(t,a,b)=>ease((t-a)/(b-a));
function pose(a,b,t){const q=ease(t),out={};for(const k of ['x','y','rx','ry','rz'])out[k]=lerp(a[k]||0,b[k]||0,q);out.size=scale(a.size,b.size,q);out.glow=lerp(a.glow||0,b.glow||0,q);return out}
const cameras=[
{out:{x:-.04,y:.07,s:1.2,r:0},in:{x:0,y:.03,s:.93,r:0}},
{out:{x:0,y:-.13,s:1.06,r:0},in:{x:.16,y:1.04,s:1.8,r:0}},
{out:{x:-.44,y:.26,s:1.95,r:-8},in:{x:.12,y:.48,s:.85,r:2}},
{out:{x:-.04,y:-.58,s:1.08,r:-1.5},in:{x:.06,y:.68,s:.87,r:2}},
{out:{x:-.14,y:-.58,s:1.1,r:-3},in:{x:.12,y:.56,s:.88,r:2}},
{out:{x:.08,y:-.5,s:.93,r:2},in:{x:-.04,y:.58,s:.93,r:-1}}];
function camera(index,t,incoming,w,h){const c=cameras[index]||cameras[5],q=ease(t),f=incoming?1-q:q,p=incoming?c.in:c.out;return{x:p.x*w*f,y:p.y*h*f,s:scale(1,p.s,f),r:p.r*f,opacity:incoming?phase(t,index<2?.35:.38,index<2?.82:.76):1-phase(t,index<2?.2:.26,index<2?.78:.61)}}
function project(p,c,w,h){let x=(p.x-w/2)*c.s,y=(p.y-h/2)*c.s;const r=c.r*Math.PI/180;return{x:w/2+x*Math.cos(r)-y*Math.sin(r)+c.x,y:h/2+x*Math.sin(r)+y*Math.cos(r)+c.y}}
function transition(index,t,from,to,w,h){const mobile=w<700;let middle;
if(index===0)middle={x:w*.49,y:-h*.2,size:Math.min(w*.35,300),rx:10,ry:25,rz:-18,glow:.95};
else if(index===1)middle={x:w*.75,y:h*.15,size:Math.min(w*.3,200),rx:-12,ry:-20,rz:20,glow:.8};
else if(index===2)middle={x:w*.88,y:h*.14,size:mobile?115:178,rx:-17,ry:48,rz:15,glow:.3};
else if(index===3)middle={x:w*.72,y:h*.37,size:mobile?108:150,rx:14,ry:-35,rz:-23,glow:.2};
else if(index===4)middle={x:w*.69,y:h*.32,size:mobile?105:165,rx:-20,ry:43,rz:23,glow:.3};
else middle={x:w*(mobile?.6:.71),y:h*.36,size:mobile?105:142,rx:10,ry:-24,rz:-15,glow:.3};
const custom=root.SceneSettings?.arcs[index];if(custom)middle={...custom,x:w*(custom.x??.5),y:h*(custom.y??.3),size:mobile?Math.min(108,custom.size):custom.size};
const q=ease(t),out=pose(from,to,t);out.x=(1-q)*(1-q)*from.x+2*(1-q)*q*middle.x+q*q*to.x;out.y=(1-q)*(1-q)*from.y+2*(1-q)*q*middle.y+q*q*to.y;
if(custom?.c1&&custom?.c2){const u=1-q;out.x=u*u*u*from.x+3*u*u*q*w*custom.c1.x+3*u*q*q*w*custom.c2.x+q*q*q*to.x;out.y=u*u*u*from.y+3*u*u*q*h*custom.c1.y+3*u*q*q*h*custom.c2.y+q*q*q*to.y}
const bump=16*q*q*(1-q)*(1-q);out.size*=Math.exp(bump*Math.log(middle.size/Math.sqrt(from.size*to.size)));out.rx+=bump*middle.rx;out.ry+=bump*middle.ry;out.rz+=bump*middle.rz;out.glow=bump*middle.glow;return out}
function flowerState(index,reading,t,mode,reduced=false){
 if(reduced)return{scale:1,opacity:1,rotate:0};
 const preset=root.SceneSettings?.flowerMotion[index]||{enter:.8,exit:1.4,turn:0};
 if(mode==='enter'){const q=phase(t,.36,.96);return{scale:lerp(preset.enter,1,q),opacity:q,rotate:lerp(-preset.turn,0,q)}}
 if(mode==='exit'){const q=phase(t,.04,.6);return{scale:lerp(1.04,preset.exit,q),opacity:1-phase(t,.06,.56),rotate:preset.turn*q}}
 if(index===6){const q=phase(reading,.6,1);return{scale:lerp(1,preset.exit,q),opacity:1-q,rotate:preset.turn*q}}
 return{scale:1+.04*ease(reading),opacity:1,rotate:0};
}
// A short chapter advances in one wheel gesture. Long chapters keep their reading space.
function wheelStep(layout,y,direction){
 const index=layout.findIndex((l,i)=>y<l.start+l.read+l.transition||i===layout.length-1);
 if(index<0)return null;
 const l=layout[index],local=Math.max(0,y-l.start),long=l.overflow>48;
 if(direction>0){
  if(index===layout.length-1||(long&&local<l.read*.93))return null;
  return{from:Math.max(y,l.start+l.read),to:Math.ceil(layout[index+1].start)+1};
 }
 if(local>l.read)return{from:y,to:Math.ceil(l.start+(long?l.read*.93:0))+1};
 if(index===0||(long&&local>l.read*.07))return null;
 const prev=layout[index-1];
 return{from:Math.min(y,l.start),to:Math.ceil(prev.start+(prev.overflow>48?prev.read*.93:0))+1};
}
root.CinematicMotion={clamp,ease,lerp,scale,phase,pose,camera,project,transition,flowerState,wheelStep};
})(typeof window!=='undefined'?window:globalThis);

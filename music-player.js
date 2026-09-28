/* Local audio + YouTube. The video is optional; both drive the needle and record. */
(()=>{
 const $=s=>document.querySelector(s),audio=$('#audio'),needle=$('#needle'),play=$('#play'),mini=$('#mini-player'),status=$('#music-status'),seek=$('#seek'),picker=$('#music-file'),queueElement=$('#music-queue');
 const videoPanel=document.createElement('aside');videoPanel.className='youtube-panel';videoPanel.setAttribute('aria-label','YouTube music video');
 videoPanel.innerHTML='<div id="youtube-player"></div><a target="_blank" rel="noopener">Open on YouTube ↗</a>';document.body.append(videoPanel);
 const videoToggle=document.createElement('button');videoToggle.type='button';videoToggle.className='video-toggle';videoToggle.textContent='Show YouTube video';videoToggle.hidden=true;videoToggle.setAttribute('aria-expanded','false');status.after(videoToggle);
 const youtubeFallback=document.createElement('a');youtubeFallback.className='youtube-fallback';youtubeFallback.textContent='Open this track on YouTube ↗';youtubeFallback.target='_blank';youtubeFallback.rel='noopener';youtubeFallback.hidden=true;videoToggle.after(youtubeFallback);
 function showVideo(show){videoPanel.classList.toggle('video-collapsed',!show);videoPanel.setAttribute('aria-hidden',String(!show));videoPanel.inert=!show;videoToggle.setAttribute('aria-expanded',String(show));videoToggle.textContent=show?'Hide YouTube video':'Show YouTube video'}
 videoToggle.addEventListener('click',()=>showVideo(videoToggle.getAttribute('aria-expanded')!=='true'));showVideo(false);
 const closeVideo=document.createElement('button');closeVideo.type='button';closeVideo.className='close-video';closeVideo.textContent='×';closeVideo.setAttribute('aria-label','Hide YouTube video');closeVideo.addEventListener('click',()=>showVideo(false));videoPanel.append(closeVideo);
 let queue=[],current=-1,playing=false,pending=false,player,readyPromise,apiPromise,playerReady=false,selection=0,connectionVersion=0,wantedPlayback=false;
 const active=()=>queue[current],time=v=>Number.isFinite(v)?`${Math.floor(v/60)}:${String(Math.floor(v%60)).padStart(2,'0')}`:'0:00';
 let playbackTimer;
 function clearPlaybackWait(){clearTimeout(playbackTimer);playbackTimer=null}
 function startYouTube(load=false){
  clearPlaybackWait();const token=selection;
  wantedPlayback=true;status.textContent='Starting YouTube…';
  if(load)player.loadVideoById(active().id);else player.playVideo();
  playbackTimer=setTimeout(()=>{
   if(token!==selection||playing||!wantedPlayback||active()?.kind!=='youtube')return;
   wantedPlayback=false;sync(false);showVideo(true);youtubeFallback.hidden=false;
   status.textContent='Playback has not started. Try Play inside the video, or open this track on YouTube.';
  },10000);
 }
 function stopYouTube(){if(playerReady)try{player.stopVideo()}catch{/* A disconnected iframe must not prevent queue edits. */}}
 function sync(on){playing=on;document.body.classList.toggle('playing',on);[needle,play].forEach(b=>{b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'Pause music':'Play music')});play.textContent=on?'Ⅱ':'▶';mini.hidden=!on;document.dispatchEvent(new CustomEvent('soundtrack-state',{detail:{playing:on}}));}
 function progress(elapsed,duration){seek.disabled=!(duration>0&&Number.isFinite(duration));seek.value=duration?elapsed/duration*100:0;$('#elapsed').textContent=time(elapsed);$('#duration').textContent=time(duration)}
 function connectAPI(){
  if(window.YT?.Player){videoPanel.dataset.api='ready';return Promise.resolve()}
  if(apiPromise)return apiPromise;
  videoPanel.dataset.api='loading';
  apiPromise=new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Cannot reach YouTube. Check your connection or choose a music file.')),15000);
   window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);videoPanel.dataset.api='ready';resolve()};
   document.getElementById('youtube-api-script')?.remove();const script=document.createElement('script');script.id='youtube-api-script';script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{clearTimeout(timer);reject(Error('Cannot load YouTube. Check your connection or choose a music file.'))};document.head.append(script);
  }).catch(error=>{apiPromise=null;videoPanel.dataset.api='error';throw error});return apiPromise;
 }
 function youtubeReady(){
  if(playerReady)return Promise.resolve(player);
  if(readyPromise)return readyPromise;
  const initialTrack=active(),attempt=++connectionVersion;
  videoPanel.dataset.connection='loading';
  readyPromise=new Promise((resolve,reject)=>{
   // A slow handshake is not a failed video. Keep listening so late readiness
   // can recover without destroying a video which may already be playable.
   const fail=message=>{clearTimeout(timeout);videoPanel.dataset.connection='error';reject(Error(message))};
   const timeout=setTimeout(()=>{if(attempt!==connectionVersion||playerReady)return;videoPanel.dataset.connection='slow';if(active()?.kind==='youtube')youtubeFallback.hidden=false;reject(Error('The YouTube video player did not respond in this browser. Try opening this website in Chrome or Edge, or choose a music file.'))},20000);
   function setup(){
    if(attempt!==connectionVersion)return;
    try{player?.destroy?.()}catch{/* Rebuild a partially initialized iframe. */}
    document.getElementById('youtube-player')?.remove();
    const mount=document.createElement('iframe');mount.id='youtube-player';mount.title=initialTrack?.title||'YouTube music player';
    mount.width='360';mount.height='203';mount.setAttribute('loading','eager');
    mount.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
    mount.setAttribute('allow','autoplay; encrypted-media; picture-in-picture; fullscreen');
    const params=new URLSearchParams({enablejsapi:'1',playsinline:'1',origin:location.origin,rel:'0'});
    mount.src='https://www.youtube.com/embed/'+initialTrack.id+'?'+params;
    videoPanel.prepend(mount);
    // Attach the official API to a configured iframe; its URL carries only the video ID.
    try{player=new YT.Player('youtube-player',{events:{
    onReady:e=>{if(attempt!==connectionVersion)return;clearTimeout(timeout);player=e.target;playerReady=true;youtubeFallback.hidden=true;videoPanel.dataset.connection='ready';readyPromise=Promise.resolve(player);
     if(active()?.kind==='youtube'){if(wantedPlayback)startYouTube(true);else{player.cueVideoById(active().id);status.textContent='Ready. Lower the needle to play.'}}resolve(player)},
    onStateChange:e=>{
     if(attempt!==connectionVersion||active()?.kind!=='youtube')return;
     const on=e.data===YT.PlayerState.PLAYING;sync(on);
     if(on){clearPlaybackWait();wantedPlayback=true;youtubeFallback.hidden=true;status.textContent='Playing'}else if(e.data===YT.PlayerState.PAUSED){clearPlaybackWait();wantedPlayback=false;status.textContent='Paused'}
     if(e.data===YT.PlayerState.CUED&&!wantedPlayback)status.textContent='Ready. Click the needle or the video to play.';
     const data=player.getVideoData();if(data.video_id===active().id&&data.title)updateTitle(active(),data.title);
     if(e.data===YT.PlayerState.ENDED)next();
    },
    onError:e=>{if(attempt!==connectionVersion||active()?.kind!=='youtube')return;clearPlaybackWait();wantedPlayback=false;sync(false);showVideo(true);youtubeFallback.hidden=false;const message=[101,150].includes(e.data)?'This video cannot play on other websites. Open it on YouTube or choose another track.':e.data===153?'YouTube error 153: this browser did not identify the website. Try the same page in Chrome/Edge.':`YouTube error ${e.data}: this video cannot play here. Choose another track.`;status.textContent=message;fail(message)},
    onAutoplayBlocked:()=>{if(attempt!==connectionVersion||active()?.kind!=='youtube')return;clearPlaybackWait();wantedPlayback=false;sync(false);showVideo(true);status.textContent='Click Play inside the YouTube video to start. You can hide the video afterward.'}
   }})}catch(error){fail('Unable to initialize YouTube. Press Play to reconnect.')}}
   connectAPI().then(setup).catch(error=>fail(error.message));
  }).catch(error=>{if(attempt===connectionVersion&&!playerReady)readyPromise=null;throw error});return readyPromise;
 }
 function updateTitle(track,title){track.title=title;if(active()===track){$('#track-title').textContent=title;const frame=videoPanel.querySelector('iframe');if(frame)frame.title=title}showQueue()}
 async function loadTitle(track){
  if(track.kind!=='youtube')return;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{const response=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(track.url),{signal:controller.signal});if(!response.ok)throw Error('Metadata unavailable');const data=await response.json();if(data.title)updateTitle(track,data.title)}
  catch{/* The video remains selectable even when metadata is unavailable. */}finally{clearTimeout(timer)}
 }
 async function toggle(){
  if(pending)return;if(!active()){picker.click();return}pending=true;const token=selection;
  try{if(active().kind==='youtube'){wantedPlayback=!playing;status.textContent=playerReady?(playing?'Pausing…':'Starting YouTube…'):'Preparing YouTube…';if(playerReady){if(playing){clearPlaybackWait();player.pauseVideo()}else startYouTube()}else{await youtubeReady();if(token!==selection)return}}else{audio.paused?await audio.play():audio.pause()}}
  catch(e){if(token===selection)status.textContent=e.message||'Unable to play this track.'}finally{if(token===selection)pending=false}
 }
 function showQueue(){queueElement.replaceChildren();queue.forEach((track,i)=>{const row=document.createElement('div');row.className='queue-track';const b=document.createElement('button');b.type='button';b.className='queue-select';b.textContent=track.title;b.setAttribute('aria-current',String(i===current));b.addEventListener('click',()=>select(i,true));const remove=document.createElement('button');remove.type='button';remove.className='queue-delete';remove.textContent='×';remove.setAttribute('aria-label','Delete '+track.title);remove.addEventListener('click',()=>removeTrack(i));row.append(b,remove);queueElement.append(row)})}
 function removeTrack(i){
  const track=queue[i];if(!track)return;const isCurrent=i===current,resume=playing||wantedPlayback;
  if(isCurrent){clearPlaybackWait();++selection;pending=false;wantedPlayback=false;current=-1;audio.pause();stopYouTube();audio.removeAttribute('src');audio.load();sync(false)}
  queue.splice(i,1);if(track.local)URL.revokeObjectURL(track.url);
  if(isCurrent&&queue.length){select(Math.min(i,queue.length-1),resume);return}
  if(!isCurrent&&i<current)current--;
  if(!queue.length){$('#track-title').textContent='Your personal soundtrack';status.textContent='Add a track, then lower the needle.';videoToggle.hidden=youtubeFallback.hidden=true;showVideo(false);progress(0,0)}showQueue();
 }
 async function select(i,autoplay=false){
  if(i===current){if(autoplay)toggle();return}
  clearPlaybackWait();const token=++selection;pending=false;wantedPlayback=autoplay;audio.pause();stopYouTube();sync(false);current=i;audio.removeAttribute('src');audio.load();
  const track=active();$('#track-title').textContent=track.title;progress(0,0);showQueue();videoToggle.hidden=track.kind!=='youtube';youtubeFallback.hidden=true;showVideo(false);
  if(track.kind==='youtube'){
   videoPanel.querySelector('a').href=youtubeFallback.href=track.url;status.textContent='Preparing YouTube…';
   try{const wasReady=playerReady,p=await youtubeReady();if(token!==selection)return;if(wasReady){if(autoplay)startYouTube(true);else{p.cueVideoById(track.id);status.textContent='Ready. Lower the needle to play.'}}}
   catch(e){if(token===selection)status.textContent=e.message}
  }else{audio.src=track.url;status.textContent='Ready. Lower the needle to play.';if(autoplay)toggle()}
 }
 function add(tracks){const first=queue.length;queue.push(...tracks);if(current<0&&tracks.length)select(first);else showQueue();tracks.forEach(loadTitle)}
 function next(){if(!queue.length)return;const i=(current+1)%queue.length;if(i===current){if(active().kind==='youtube'){player.seekTo(0,true);startYouTube()}else{audio.currentTime=0;toggle()}}else select(i,true)}
 picker.addEventListener('change',()=>{add([...picker.files].map(f=>({kind:'audio',title:f.name.replace(/\.[^.]+$/,''),url:URL.createObjectURL(f),local:true})));picker.value=''});
 const sourceInput=$('#music-url'),sourceNote=$('#music-url-note');
 function normalizeSource(value){
  const track=window.parseMusicSource(value);
  if(track.kind==='youtube'){
   sourceInput.value=track.url;sourceNote.hidden=false;
   sourceNote.textContent=value.trim()===track.url?'YouTube video link ready.':'YouTube link cleaned. Playlist and sharing parameters removed.';
  }
  return track;
 }
 sourceInput.addEventListener('paste',e=>{
  const text=e.clipboardData?.getData('text/plain');if(!text)return;
  // Only replace a complete paste; partial edits use normal text-field behavior.
  if(sourceInput.value&&!(sourceInput.selectionStart===0&&sourceInput.selectionEnd===sourceInput.value.length))return;
  try{const track=window.parseMusicSource(text);if(track.kind==='youtube'){e.preventDefault();normalizeSource(text)}}catch{/* Keep the paste; submit will explain any invalid URL. */}
 });
 sourceInput.addEventListener('input',()=>{sourceNote.hidden=true});
 sourceInput.addEventListener('change',()=>{try{normalizeSource(sourceInput.value)}catch{sourceNote.hidden=true}});
 $('#music-source').addEventListener('submit',e=>{
  e.preventDefault();try{const track=normalizeSource(sourceInput.value);add([track]);if(track.kind!=='youtube'){sourceInput.value='';sourceNote.hidden=true}}
  catch(error){sourceNote.hidden=false;sourceNote.textContent=error.message;status.textContent=error.message}
 });
 [needle,play,mini].forEach(b=>b.addEventListener('click',toggle));
 audio.addEventListener('play',()=>{if(active()?.kind==='audio'){sync(true);status.textContent='Playing'}});
 audio.addEventListener('pause',()=>{if(active()?.kind==='audio'){sync(false);status.textContent='Paused'}});
 audio.addEventListener('error',()=>{if(active()?.kind==='audio'){sync(false);status.textContent='Unable to load this audio URL. Use a direct MP3/WAV URL or choose a file.'}});
 ['loadedmetadata','timeupdate'].forEach(event=>audio.addEventListener(event,()=>{if(active()?.kind==='audio')progress(audio.currentTime,audio.duration)}));
 seek.addEventListener('input',()=>{if(active()?.kind==='youtube'){const d=player?.getDuration();if(d)player.seekTo(seek.value/100*d,true)}else if(Number.isFinite(audio.duration))audio.currentTime=seek.value/100*audio.duration});
 setInterval(()=>{if(active()?.kind==='youtube'&&playerReady)progress(player.getCurrentTime(),player.getDuration())},500);
 audio.loop=false;audio.addEventListener('ended',next);
 addEventListener('pagehide',e=>{if(!e.persisted)queue.filter(t=>t.local).forEach(t=>URL.revokeObjectURL(t.url))});
 // Connect the API on entry; construct the video player as soon as a URL is added.
 // This avoids trying to initialize an empty video and never autoplays audio.
 connectAPI().catch(e=>{if(active()?.kind==='youtube')status.textContent=e.message});
})();

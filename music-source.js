/* URL recognition shared by the player and its regression tests. */
(function(root){
 function parseMusicSource(value){
  let source=String(value||'').trim().replace(/[\u200B-\u200D\uFEFF]/g,'');
  // Accept common clipboard wrappers without treating arbitrary prose as a URL.
  const markdown=source.match(/^\[[^\]]*\]\(\s*(\S+)\s*\)$/);
  if(markdown)source=markdown[1];
  source=source.replace(/^<([^<>]+)>$/,'$1').replace(/^(["'`])([\s\S]*)\1$/,'$2');
  source=source.replace(/&amp;|&#0*38;|&#x0*26;/gi,'&').replace(/\\([&?=])/g,'$1');
  if(/^(?:(?:www|m|music)\.)?youtube\.com(?:[/?#]|$)|^(?:www\.)?youtu\.be(?:[/?#]|$)|^(?:www\.)?youtube-nocookie\.com(?:[/?#]|$)/i.test(source))source='https://'+source;
  if(source.startsWith('//'))source='https:'+source;
  let url;try{url=new URL(source)}catch{throw Error('Paste a YouTube video link or a direct audio URL.');}
  if(!['https:','http:'].includes(url.protocol))throw Error('Enter an HTTPS YouTube or direct audio URL.');
  const host=url.hostname.toLowerCase().replace(/^www\./,'');
  const youtube=['youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com'].includes(host);
  if(youtube||host==='youtu.be'){
   const parts=url.pathname.split('/').filter(Boolean);
   const id=host==='youtu.be'?parts[0]:url.searchParams.get('v')||(['embed','shorts','live'].includes(parts[0])?parts[1]:'');
   if(!/^[\w-]{11}$/.test(id||''))throw Error(url.searchParams.has('list')?'This is a playlist without a video. Open a song and copy its video link.':'Paste a link to a specific YouTube video.');
   return {kind:'youtube',id,url:'https://www.youtube.com/watch?v='+id,title:'YouTube · '+id};
  }
  if(host==='open.spotify.com'||host==='spotify.com')throw Error('Use a YouTube video or a direct audio file URL.');
  let title=url.pathname.split('/').pop()||'Your soundtrack';try{title=decodeURIComponent(title)}catch{}
  return {kind:'audio',url:url.href,title:title.replace(/\.[^.]+$/,'')};
 }
 if(typeof module!=='undefined')module.exports=parseMusicSource;else root.parseMusicSource=parseMusicSource;
})(typeof window==='undefined'?{}:window);

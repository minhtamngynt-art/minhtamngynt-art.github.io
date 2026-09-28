// Run: node serve.cjs — then open http://127.0.0.1:4173
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname,types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.wav':'audio/wav','.woff2':'font/woff2'};
http.createServer((req,res)=>{let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname))}catch{res.writeHead(400);return res.end()}
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 if(file===root)file=path.join(root,'index.html');fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end('Not found')}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(data)});
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173 — Ctrl+C to stop'));

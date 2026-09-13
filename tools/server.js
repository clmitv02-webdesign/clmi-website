// Minimal static file server for local preview: node tools/server.js [port]
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'public');
const PORT = process.argv[2] || 8123;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webp': 'image/webp', '.ico': 'image/x-icon', '.JPG': 'image/jpeg' };
http.createServer((req, res) => {
  if (req.url.split('?')[0] === '/api/live-service') return require('../api/live-service.js')(req,res);
  let p = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
  const size=fs.statSync(file).size;
  const headers={'Content-Type':MIME[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Content-Length':size};
  if(req.headers.range){
    const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
    const start=match?Number(match[1]):NaN;
    const end=match?Math.min(size-1,match[2]?Number(match[2]):size-1):NaN;
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||end<start){res.writeHead(416,{'Content-Range':`bytes */${size}`});return res.end();}
    res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${size}`});
    if(req.method==='HEAD')return res.end();
    return fs.createReadStream(file,{start,end}).pipe(res);
  }
  res.writeHead(200,headers);
  if(req.method==='HEAD')return res.end();
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log('serving on http://localhost:' + PORT));

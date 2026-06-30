// Minimal static file server for local preview testing — binds 127.0.0.1 only,
// serves files from the repo working directory. Used by Claude Preview (launch.json).
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8742;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };

http.createServer(function (req, res) {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  const full = path.resolve(ROOT, '.' + rel);
  // Security: never serve outside ROOT
  if (full.indexOf(ROOT) !== 0) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(full, function (err, data) {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', function () {
  console.log('preview server on http://127.0.0.1:' + PORT);
});

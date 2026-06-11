const http=require("http"),fs=require("fs"),path=require("path");
const root=path.resolve("C:/Users/dapat/Downloads/Prompt Generator");
http.createServer((q,s)=>{const f=path.resolve(path.join(root,decodeURIComponent(q.url.split("?")[0])));
if(!f.startsWith(root)){s.writeHead(403);s.end();return}
fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);s.end("nf");return}
s.writeHead(200,{"Content-Type":f.endsWith(".pdf")?"application/pdf":"text/html"});s.end(d)})}).listen(8741,"127.0.0.1",()=>console.log("up"));

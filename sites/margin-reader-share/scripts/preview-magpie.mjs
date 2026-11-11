// Local-only bridge for testing the deployed Worker logic, with secrets read into memory.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join,resolve,extname} from 'node:path';
import {Readable} from 'node:stream';
import {createLookupService} from '../worker/lookup.js';
const root=resolve(new URL('..',import.meta.url).pathname);
const provider=JSON.parse(await readFile(join(homedir(),'.config/magpie/providers.json'),'utf8')).providers.find(p=>p.id==='deepseek');
if(!provider?.key)throw new Error('Magpie DeepSeek configuration not found');
const env={DEEPSEEK_API_KEY:provider.key,DEEPSEEK_BASE_URL:provider.chat,DEEPSEEK_MODEL:provider.models[0]};
const catalog=JSON.parse(await readFile(join(root,'public/content/catalog.json'),'utf8'));
const handler=createLookupService({loadCatalog:async()=>catalog});
const port=Number(process.env.PORT||4198),mimes={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1:'+port);
  if(url.pathname.startsWith('/api/')){
   if(!['/api/lookup','/api/summary','/api/ai/status'].includes(url.pathname)){res.writeHead(404);res.end();return;}
   const headers=new Headers();for(const [k,v]of Object.entries(req.headers)){if(!k.startsWith('oai-authenticated-')&&typeof v==='string')headers.set(k,v);}
   headers.set('cf-connecting-ip',req.socket.remoteAddress||'127.0.0.1');
   const chunks=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>16000){res.writeHead(413);res.end();return;}chunks.push(chunk);}
   const request=new Request(url,{method:req.method,headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})});
   const response=await handler(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  const relative=decodeURIComponent(url.pathname);const file=resolve(root,'dist/client','.'+relative);if(file!==join(root,'dist/client')&&!file.startsWith(join(root,'dist/client')+'/')){res.writeHead(403);res.end();return;}
  let path=file;if(relative==='/')path=join(root,'dist/client/index.html');let data;try{data=await readFile(path);}catch{res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':mimes[extname(path)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(500);res.end('Preview failed');}
}).listen(port,'127.0.0.1',()=>console.log('Magpie-backed preview: http://127.0.0.1:'+port));

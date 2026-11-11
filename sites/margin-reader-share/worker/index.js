import {createLookupService} from './lookup.js';
let catalog;
const lookup=createLookupService({loadCatalog:async(request,env)=>{
 if(!catalog)catalog=(async()=>{const r=await env.ASSETS.fetch(new Request(new URL('/content/catalog.json',request.url)));if(!r.ok)throw new Error('catalog unavailable');return r.json();})();
 try{return await catalog;}catch(e){catalog=undefined;throw e;}
}});
export default {async fetch(request,env){
 const path=new URL(request.url).pathname;
 if(path.startsWith('/api/'))return ['/api/lookup','/api/summary','/api/ai/status'].includes(path)?lookup(request,env):new Response('Not found',{status:404});
 return env.ASSETS.fetch(request);
}};

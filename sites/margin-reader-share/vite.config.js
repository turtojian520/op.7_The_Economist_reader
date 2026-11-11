import {defineConfig} from 'vite';
import {cloudflare} from '@cloudflare/vite-plugin';
import {cp,mkdir} from 'node:fs/promises';
const manifest=()=>({name:'sites-hosting-manifest',async closeBundle(){await mkdir('dist/.openai',{recursive:true});await cp('.openai/hosting.json','dist/.openai/hosting.json');}});
export default defineConfig({plugins:[cloudflare({viteEnvironment:{name:'server'},inspectorPort:false,config:{name:'margin-reader-share',main:'./worker/index.js',compatibility_date:'2026-11-10',compatibility_flags:['nodejs_compat'],assets:{binding:'ASSETS',run_worker_first:['/api/*'],not_found_handling:'single-page-application'}}}),manifest()]});

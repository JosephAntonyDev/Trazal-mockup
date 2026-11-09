import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../dist');
const data=(path,type)=>`data:${type};base64,${readFileSync(resolve(root,path)).toString('base64')}`;
const assets=readdirSync(resolve(root,'assets'));
const jsName=assets.find(x=>x.endsWith('.js'));
const cssName=assets.find(x=>x.endsWith('.css'));
let js=readFileSync(resolve(root,'assets',jsName),'utf8');
let css=readFileSync(resolve(root,'assets',cssName),'utf8');
for(const name of readdirSync(resolve(root,'brand'))){
  js=js.replaceAll(`/brand/${name}`,data(`brand/${name}`,'image/svg+xml'));
}
css=css.replace(/url\(["']?\/fonts\/([^"')]+)["']?\)/g,(_,name)=>`url("${data('fonts/'+name,'font/woff2')}")`);
let html=readFileSync(resolve(root,'index.html'),'utf8');
html=html.replace(/<script[^>]*src="[^"]+"[^>]*><\/script>/,()=>`<script type="module">${js.replaceAll('</script','<\\/script')}</script>`);
html=html.replace(/<link[^>]*rel="stylesheet"[^>]*>/,()=>`<style>${css}</style>`);
html=html.replace('/brand/app-icon-color.svg',data('brand/app-icon-color.svg','image/svg+xml'));
const notices=['public/fonts/dm-sans-OFL.txt','public/fonts/manrope-OFL.txt','node_modules/react/LICENSE','node_modules/react-dom/LICENSE','node_modules/lucide-react/LICENSE'].map(path=>`${path}\n${readFileSync(resolve(root,'..',path),'utf8')}`).join('\n\n');
html=html.replace('</head>',`<!-- Third-party notices\n${notices.replaceAll('--','—')}\n-->\n</head>`);
writeFileSync(resolve(root,'Trazal-demo.html'),html);
console.log('Demo autónoma: dist/Trazal-demo.html (recursos incluidos; sin servidor).');

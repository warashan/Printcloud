/* Build offline de Tailwind v4 desde el paquete NPM. No requiere CDN. */
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tw=require('tailwindcss');
const pkgDir=path.dirname(path.dirname(require.resolve('tailwindcss')));
const input=fs.readFileSync(path.join(root,'src/styles.css'),'utf8');
const compiled=await tw.compile(input,{
  base:path.join(root,'src'),
  loadStylesheet:async(id,base)=>{
    const resolved=id==='tailwindcss' ? path.join(pkgDir,'index.css') : path.resolve(base,id);
    return {content:fs.readFileSync(resolved,'utf8'),base:path.dirname(resolved)};
  }
});
const files=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
const names=new Set();
for(const file of files){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  for(const match of html.matchAll(/\bclass=["']([^"']+)["']/g))for(const cls of match[1].split(/\s+/))if(cls)names.add(cls);
}
const css=compiled.build([...names]);
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.writeFileSync(path.join(root,'dist/styles.css'),css);
console.log(`Tailwind CSS compilado: ${names.size} clases candidatas · ${css.length} bytes · ${files.length} páginas`);

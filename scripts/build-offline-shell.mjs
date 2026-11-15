import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// All route bundles are required before the new offline release can activate.
const names=(await readdir('dist/assets')).filter(n=>/\.(?:js|css)$/.test(n)).sort();
const paths=names.map(name=>'/assets/'+name);
const html=await readFile('dist/index.html','utf8');
const worker=await readFile('public/power-sw.js','utf8');
const core=['manifest.json','power-boot.js','recover.html','icons/spread-more-tlc.svg','brand/spread-tlc-original-20261115.jpg','icons/tlc-prime-20261115-192.png','icons/tlc-prime-20261115-512.png','icons/tlc-prime-20261115-maskable-512.png'];
const hash=createHash('sha256').update(html).update(worker).update(paths.join('\n'));
for(const path of core)hash.update(await readFile('public/'+path));
const revision=hash.digest('hex').slice(0,12);
const page=html.replace(/name="tlc-build" content="[^"]*"/,'name="tlc-build" content="'+revision+'"');
if(page===html)throw Error('Missing build marker in HTML');
await writeFile('dist/index.html',page);
await writeFile('dist/power-version.json',JSON.stringify({revision})+'\n');
await writeFile('dist/power-sw.js',worker.replace(/const CACHE='tlc-prime-offline-[^']+';/,"const CACHE='tlc-prime-offline-"+revision+"';").replace('const BUILD_ASSETS=[];','const BUILD_ASSETS='+JSON.stringify(paths)+';'));
console.log('OFFLINE: '+paths.length+' required scripts/styles; verified shell '+revision+'.');

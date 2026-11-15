import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// Include all split JS/CSS, so opening a different training screen works offline.
// Media remains on-demand; user data and account responses are never precached.
const names=(await readdir('dist/assets')).filter(n=>/\.(?:js|css)$/.test(n)).sort();
const paths=names.map(name=>'/assets/'+name);
const html=await readFile('dist/index.html','utf8');
const revision=createHash('sha256').update(html+paths.join('\n')).digest('hex').slice(0,12);
const worker=await readFile('public/power-sw.js','utf8');
await writeFile('dist/power-sw.js',worker.replace(/const CACHE='tlc-prime-offline-[^']+';/,`const CACHE='tlc-prime-offline-${revision}';`).replace('const BUILD_ASSETS=[];',`const BUILD_ASSETS=${JSON.stringify(paths)};`));
console.log(`OFFLINE: ${paths.length} split scripts/styles included; revision ${revision}. External videos and unvisited media require a connection.`);

import { build } from 'esbuild';
// The API uses the exact same catalog and rules as the UI. Bundle them for Node ESM.
await build({entryPoints:['src/lib/coachServerExports.ts'],outfile:'server/coach-policy.mjs',bundle:true,platform:'node',format:'esm',target:'node22',logLevel:'silent',banner:{js:'// Generated from src/lib/coachServerExports.ts. Run node scripts/build-coach-policy.mjs; do not edit.'}});

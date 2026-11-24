import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(p,'utf8');
const catalog=JSON.parse(read('src/data/publicExerciseCatalog.json'));
const art=JSON.parse(read('src/data/movementIllustrations.json'));
const photos=JSON.parse(read('src/data/reviewedMovementPhotos.json'));
const review=JSON.parse(read('src/data/thumbnailReview.json'));
const audit=JSON.parse(read('src/data/videoAudit.json'));
const file=read('src/lib/conceptArtwork.ts'),mapper=read('src/lib/movementThumbnails.ts');
const approved=new Map(review.exercises.map(r=>[r.slug,r.approvedVideoIds||[]]));
const availability=new Map(audit.videos.map(v=>[v.videoId,v.availability]));
const missing=catalog.filter(e=>!art[e.slug]&&!photos[e.slug]&&!(approved.get(e.slug)||[]).some(id=>availability.get(id)==='reachable'));
const keys=[...file.matchAll(/'([^']+)':'(?:seated|lunge|row|press|plank|inverted|hang|bridge|yoga|onehang|squat|curl|wrist|pinch|grip|band|stand|calf|jump)'/g)].map(x=>x[1]);
assert.equal(catalog.length,303,'Movement catalog changed; review new exercises');
assert.equal(missing.length,55,'Missing thumbnail count changed; re-audit');
assert.equal(keys.length,55,'Exactly one concept image needed per uncovered exercise');
for(const exercise of missing){
 assert(keys.includes(exercise.slug),'Missing illustration for '+exercise.slug);
}
for(const key of keys)assert(missing.some(e=>e.slug===key),'Unexpected unrelated generated art '+key);
assert(mapper.includes("approved.length?approved:(conceptArtwork(input)?[conceptArtwork(input)!]:[])"),'Concept artwork should only fill genuine gaps');
assert(file.includes('data:image/svg+xml'),'Missing locally rendered art');
assert(file.includes('not a certified exercise demonstration'),'Artwork must disclose uncertainty');
assert(file.includes('CONCEPT ART · NOT FORM INSTRUCTION'),'Artwork must not masquerade as verified exercise form');
console.log('PASS: all 303 catalog exercises have a thumbnail path; exactly 55 local DBZ concept thumbnails fill prior imagery gaps; reviewed media stays preferred.');
console.log('LIMIT: SVG pose art is conceptual visual reference, not validated instructional form or a replacement for verified demonstrations.');

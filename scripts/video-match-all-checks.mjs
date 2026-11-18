import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const catalog=JSON.parse(read('src/data/publicExerciseCatalog.json'));
const audit=JSON.parse(read('src/data/videoAudit.json'));
const review=JSON.parse(read('src/data/thumbnailReview.json'));
const mapping=read('src/lib/movementThumbnails.ts');
const policy=read('src/lib/videoMatchPolicy.ts');
const lesson=read('src/lib/videoLessonCoverage.ts');
const studio=read('src/components/Exercise/InlineTlcTv.tsx');
const library=new Map(audit.videos.map(v=>[v.videoId,v]));
const reviewed=new Map(review.exercises.map(v=>[v.slug,v]));
const ids=new Set();
const re=/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/;
const videoId=url=>typeof url==='string'?url.match(re)?.[1]:undefined;
let counts={total:0,missing:0,reviewed:0,related:0,unverified:0,unavailable:0,withheld:0};
for(const item of catalog){
 assert(!ids.has(item.slug),'Duplicate exercise slug '+item.slug);ids.add(item.slug);counts.total++;
 const id=videoId(item.youtube_url);
 if(!id){counts.missing++;continue}
 const record=library.get(id),decision=reviewed.get(item.slug);
 if((item.slug==='frog-stand'&&id==='SrYBD4yCI84')||(item.slug==='bridge-pose'&&id==='wPM8icPu6H8')||decision?.rejectedVideoIds.includes(id)){counts.withheld++;continue}
 if(['invalid','unavailable'].includes(record?.availability)){counts.unavailable++;continue}
 if(decision?.relatedVideoIds.includes(id)){counts.related++;continue}
 if(decision?.approvedVideoIds.includes(id)&&record?.availability==='reachable'){counts.reviewed++;continue}
 counts.unverified++;
}
assert.equal(counts.total,303,'Full catalog count has changed; review new movements');
assert(mapping.includes('reviewedVideoForExercise(slug,id)'),'Thumbnails must require reviewed-specific clips');
assert(mapping.includes("status==='reviewed'||status==='related'"),'Direct source must not bypass mapping gate');
assert(policy.includes("'frog-stand':['SrYBD4yCI84']"),'Crow pose must be rejected for frog stand');
assert(policy.includes("'bridge-pose':['wPM8icPu6H8']"),'Yoga bridge must never show a glute-bridge demo');
assert(policy.includes("'toes-to-bar':['_03pCKOv4l4']"),'Kipping toes-to-bar must not be labelled strict');
assert(lesson.includes("scope:'guide',provider:'instagram'"),'Instagram source must not imply exact coverage');
assert(studio.includes('REVIEWED PREVIEW')&&studio.includes('RELATED / TITLE-MATCHED LESSON'),'Playback labels must disclose evidence level');
const media=read('src/data/movementMedia.ts');
assert(media.includes("'frog-stand':{id:'IaMCpp6CcWE'"),'Frog stand needs a specifically titled video instead of Crow Pose');
assert(media.includes("'false-grip-ring-hang':{id:'CtAui84zEAU'"),'False-grip drill needs a ring-specific title-matched source');
const report=read('docs/VIDEO_IDENTITY_AUDIT_20261117.md');
for(const e of catalog)assert(report.includes('| '+e.name.replaceAll('|','/')+' |'),'The full mapping report omits '+e.name);
console.log('VIDEO AUDIT',counts);
console.log('PASS: all 303 exercise identities checked against reviewed metadata; 2 hard mismatch overrides, grip and variant safeguards, and conservative reviewed-preview labeling.');
console.log('LIMIT: video titles and thumbnails do not independently certify each clip’s exercise form or live playback.');

import { tutorialState } from '@/lib/mediaAudit';
import { movementThumbnailSources, type ThumbnailExercise } from '@/lib/movementThumbnails';
import { VideoPlayer } from './VideoPlayer';
export function MovementVideo({exercise}:{exercise:ThumbnailExercise}){
 const direct=tutorialState(exercise.youtube_url,exercise.name);
 if(direct.id&&!direct.blocked&&(direct.mapping?.titleSignal!=='title_needs_review'||direct.repair))return <VideoPlayer youtubeUrl={direct.url} title={exercise.name} thumbnailMode/>;
 const guide=movementThumbnailSources(exercise).find(source=>source.url);
 if(guide?.scope==='clip')return <VideoPlayer youtubeUrl={guide.url} title={guide.title} thumbnailMode/>;
 return guide?<div className="space-y-2"><p className="text-xs text-muted-foreground">Related coaching · {guide.title}. This guide may show other variations.</p><VideoPlayer youtubeUrl={guide.url} title={guide.title} thumbnailMode/></div>:<p className="text-xs text-muted-foreground">An exact tutorial is not sourced for this movement yet. Use the cues and a variation you already understand.</p>;
}

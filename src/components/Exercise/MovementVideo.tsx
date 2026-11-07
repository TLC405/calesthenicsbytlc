import { movementThumbnailSources, type ThumbnailExercise } from '@/lib/movementThumbnails';
import { VideoPlayer } from './VideoPlayer';
export function MovementVideo({exercise}:{exercise:ThumbnailExercise}){
 const lesson=movementThumbnailSources(exercise).find(source=>source.url);
 if(!lesson)return <p className="text-sm text-muted-foreground">A matching video is still needed for this exercise. Follow the written steps or choose an exercise you know.</p>;
 return <div className="power-clean-lesson">{lesson.scope==='guide'&&<p className="power-related-note">Related lesson: {lesson.title}. It may show other exercises too.</p>}<VideoPlayer youtubeUrl={lesson.url} title={lesson.title} thumbnailMode clean/><a className="power-lesson-source" href={lesson.url!} target="_blank" rel="noreferrer">Open this lesson on YouTube ↗</a></div>;
}

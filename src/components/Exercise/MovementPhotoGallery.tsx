import { movementPhotoSet, movementIllustration, type ThumbnailExercise } from '@/lib/movementThumbnails';
import { MovementThumbnail } from './MovementThumbnail';
import './movement-photo-gallery.css';
export function MovementPhotoGallery({exercise}:{exercise:ThumbnailExercise}) {
 const photos=movementPhotoSet(exercise);
 const illustration=movementIllustration(exercise);
 if(!photos&&illustration)return <section className="power-illustration-gallery" aria-label={`${exercise.name} illustration`}><img src={illustration.src} alt={`${exercise.name} · movement illustration`} loading="lazy"/><p>AI illustration · Use the tutorial and written cues for technique.</p></section>;
 if(!photos)return <MovementThumbnail exercise={exercise} className="power-detail-thumbnail"/>;
 return <section className="power-photo-gallery" aria-label={`${exercise.name} photographs`}><div>{photos.images.map((src,index)=><figure key={src}><img src={src} alt={`${exercise.name}, demonstration photo ${index+1}`} loading="lazy"/><figcaption>{photos.images.length>1?`View ${index+1}`:'Movement photo'}</figcaption></figure>)}</div><p>Photo: {photos.author} · <a href={photos.source} target="_blank" rel="noreferrer">Source</a> · <a href={photos.licenseUrl} target="_blank" rel="noreferrer">{photos.license}</a></p></section>;
}

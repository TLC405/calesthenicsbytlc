import { exercisePaths } from './exerciseProgressions';
/** Saved categories and exercise IDs stay intact; navigation follows movement families. */
export function exerciseLabel(slug:string,category:string){
 const paths=exercisePaths(slug);
 return (paths.find(p=>p.id!=='foundation')||paths[0])?.title||category;
}

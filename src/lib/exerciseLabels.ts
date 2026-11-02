import { SKILL_PATHS } from '@/data/skillPaths';
/** Presentation labels keep the original exercise taxonomy and saved records intact. */
export function exerciseLabel(slug: string, category: string) {
  const studio=SKILL_PATHS.find(path=>path.slugs.includes(slug));
  if(studio)return studio.title;
  if(category==='Push'||category==='Pull')return 'Strength foundations';
  if(category==='Legs')return 'Lower body';
  if(category==='Flexibility'||category==='Yoga')return 'Mobility';
  return category;
}

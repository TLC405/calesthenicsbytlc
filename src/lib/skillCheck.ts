import { getSkillPath, type SkillPath } from '@/data/skillPaths';
import { nodeDose } from '@/lib/skillGraph';

export type SkillCheck = {
  pathId: string;
  slug: string | null;
  metric: 'seconds' | 'reps';
  value: number | null;
  quality: number;
  assistance: 'none' | 'wall' | 'feet' | 'band';
  comfortable: boolean;
  at: string;
};

function key(owner: string) { return 'power-skill-check-v1:' + owner; }

export function readSkillChecks(owner: string): Record<string, SkillCheck> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(key(owner)) || '{}');
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const result: Record<string, SkillCheck> = {};
    for (const [id, candidate] of Object.entries(raw)) {
      const path = getSkillPath(id);
      if (!path || !candidate || typeof candidate !== 'object') continue;
      const c = candidate as Partial<SkillCheck>;
      if (c.slug !== null && (!c.slug || !path.slugs.includes(c.slug))) continue;
      if (!Number.isFinite(Date.parse(c.at || ''))) continue;
      if (c.slug !== null && (c.quality === undefined || c.quality < 1 || c.quality > 5)) continue;
      if (c.value !== null && (typeof c.value !== 'number' || !Number.isFinite(c.value) || c.value < 0 || c.value > 999)) continue;
      result[id] = c as SkillCheck;
    }
    return result;
  } catch { return {}; }
}

export function saveSkillCheck(owner: string, check: SkillCheck) {
  const path = getSkillPath(check.pathId);
  if (!path || (check.slug !== null && !path.slugs.includes(check.slug))) return false;
  try {
    localStorage.setItem(key(owner), JSON.stringify({ ...readSkillChecks(owner), [check.pathId]: check }));
    window.dispatchEvent(new Event('power-skill-check'));
    return true;
  } catch { return false; }
}

export function suggestedSkillStep(path: SkillPath, check?: SkillCheck) {
  const slugs = path.slugs;
  if (!slugs.length) return { slug: null as string | null, label: 'No movement available', reason: 'Browse other skills.' };
  if (!check || !check.slug) return {
    slug: slugs[0], label: 'Start with a comfortable foundation',
    reason: 'No verified baseline yet. Explore the first variation; it is not a prescribed workout.',
  };
  const position = slugs.indexOf(check.slug);
  if (position < 0) return { slug: slugs[0], label: 'Explore the foundation', reason: 'Review your starting variation.' };
  if (!check.comfortable || check.quality <= 2) return {
    slug: slugs[Math.max(0, position - 1)],
    label: 'Consider an easier variation',
    reason: 'Discomfort or loss of technique calls for an easier option, not harder loading.',
  };
  const threshold = nodeDose(check.slug).target;
  if (path.kind !== 'collection' && check.quality >= 4 &&
    check.assistance === 'none' && check.value !== null &&
    check.value >= threshold && position < slugs.length - 1) return {
    slug: slugs[position + 1], label: 'Explore the next variation',
    reason: 'Your self-reported result suggests checking the next step. This does not certify readiness or automatically promote you.',
  };
  return {
    slug: check.slug, label: 'Build consistency at this variation',
    reason: 'Repeat good technique comfortably across sessions before considering a harder step.',
  };
}

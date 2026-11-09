import { GraduationCap, ExternalLink } from 'lucide-react';

interface Educator {
  name: string;
  website: string;
  specialization: string;
  access: string;
}
const people: Record<string, Educator> = {
  fitnessFAQs: {
    name: 'FitnessFAQs · Daniel Vadnal',
    website: 'https://fitnessfaqs.com/',
    specialization: 'Planche, levers, pull strength, rings and muscle-ups',
    access: 'Official site · programs and educational videos',
  },
  fitnessLever: {
    name: 'FitnessFAQs · Lever Tutorials',
    website: 'https://fitnessfaqs.com/articles/ff-video-tag/front-lever-tutorial/',
    specialization: 'Front lever stages and pulling technique',
    access: 'Official video archive',
  },
  handstandFactory: {
    name: 'Handstand Factory',
    website: 'https://handstandfactory.com/free/',
    specialization: 'Handstand entries, wrist preparation, safe exits and press foundations',
    access: 'Official free introductory courses',
  },
  caliMove: {
    name: 'Calisthenicmovement / Cali Move',
    website: 'https://www.calimove.com/',
    specialization: 'Technique progressions, mobility and full-body control',
    access: 'Official coaching and education site',
  },
  gmb: {
    name: 'GMB Fitness',
    website: 'https://gmb.io/',
    specialization: 'Joint preparation, mobility, balance and body control',
    access: 'Official learning resources',
  },
};

function teachersFor(slug: string, category: string): Educator[] {
  const key = (slug + ' ' + category).toLowerCase();
  if (/handstand|stalder|press-to-hs|hspu/.test(key))
    return [people.handstandFactory, people.caliMove];
  if (/front-lever|back-lever/.test(key))
    return [people.fitnessLever, people.fitnessFAQs];
  if (/planche|ring|muscle-up|pull-up|iron-cross|straight-arm/.test(key))
    return [people.fitnessFAQs, people.caliMove];
  if (/mobility|wrist|finger|grip|towel|hang|pinch|carry|flag/.test(key))
    return [people.gmb, people.caliMove];
  if (/calf|tibial|squat|pistol|leg/.test(key))
    return [people.caliMove, people.gmb];
  return [people.caliMove, people.gmb];
}

/** External educational discovery, not per-variant verified or licensed content. */
export function CoachResources({ slug, category }: {slug: string; category: string}) {
  const educators = teachersFor(slug, category);
  return <details className="power-coach-resources rounded-2xl border border-border/70 bg-card">
    <summary className="min-h-12 cursor-pointer flex items-center justify-between gap-2 p-3 font-semibold text-sm">
      <span className="flex items-center gap-2"><GraduationCap size={17} className="text-primary"/> Learn from specialist coaches</span>
      <span className="text-xs text-muted-foreground font-normal">Explore</span>
    </summary>
    <div className="px-3 pb-3 border-t border-border/60 pt-3 space-y-2">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Official educational resources related to this skill. These links are not a verified
        video match for the exact exercise or evidence of a POWER partnership.
      </p>
      {educators.map(teacher=><a key={teacher.name}
        className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-border/50 p-3 hover:bg-accent/30 focus-visible:ring-2 focus-visible:ring-primary"
        href={teacher.website} target="_blank" rel="noopener noreferrer">
        <span className="min-w-0">
          <strong className="block text-sm">{teacher.name}</strong>
          <span className="block text-xs text-muted-foreground leading-relaxed">{teacher.specialization}</span>
          <span className="block text-xs text-muted-foreground mt-1">{teacher.access}</span>
        </span>
        <ExternalLink size={16} className="text-primary shrink-0" aria-hidden="true"/>
      </a>)}
    </div>
  </details>;
}

import { ExternalLink, GraduationCap } from 'lucide-react';

interface LearningSource {
  name: string;
  url: string;
  focus: string;
}
const fitnessFAQs: LearningSource = {
  name: 'FitnessFAQs', url: 'https://fitnessfaqs.com/',
  focus: 'Advanced strength, rings, planche and pull progressions',
};
const caliMove: LearningSource = {
  name: 'Cali Move', url: 'https://www.calimove.com/',
  focus: 'Bodyweight training, mobility and fundamentals',
};
const gmb: LearningSource = {
  name: 'GMB Fitness', url: 'https://gmb.io/',
  focus: 'Movement control, flexibility and bodyweight progressions',
};
const handstandFactory: LearningSource = {
  name: 'Handstand Factory', url: 'https://handstandfactory.com/free/',
  focus: 'Handstand foundations and handbalancing lessons',
};

function sourceForExercise(name: string, category: string): LearningSource[] {
  const text = (name + ' ' + category).toLowerCase();
  if (/handstand|hand stand|press handstand/.test(text)) return [handstandFactory, gmb];
  if (/mobility|stretch|yoga|flexib|balance|flow/.test(text)) return [gmb, caliMove];
  if (/rings?|lever|planche|pull|push|muscle.?up|cross/.test(text)) return [fitnessFAQs, caliMove];
  if (/grip|wrist|finger|hang|towel|flag/.test(text)) return [caliMove, gmb];
  return [caliMove, gmb];
}

/**
 * Official instructor sites only. Links are discovery resources,
 * NOT automatically verified demonstrations of the selected movement.
 * No creator affiliation or commercial licensing is implied.
 */
export function CoachResources({ exerciseName, category }: {
  exerciseName: string;
  category: string;
}) {
  const sources = sourceForExercise(exerciseName, category);
  return (
    <details className="rounded-2xl border border-border/70 bg-card group">
      <summary className="flex items-center gap-3 cursor-pointer list-none p-4 min-h-14 font-semibold text-sm">
        <GraduationCap size={19} className="text-primary" aria-hidden="true"/>
        <span className="flex-1">Learn from specialist educators</span>
        <span className="text-xs font-normal text-muted-foreground group-open:hidden">Explore</span>
      </summary>
      <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Curated educator websites for related skills. These are external resources,
          not vetted tutorials for this exact variation or confirmed POWER partners.
        </p>
        {sources.map(source => (
          <a key={source.name} href={source.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3 min-h-14 hover:bg-accent/30 focus-visible:ring-2 focus-visible:ring-primary">
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{source.name}</span>
              <span className="block text-xs text-muted-foreground leading-relaxed">{source.focus}</span>
            </span>
            <ExternalLink size={17} className="shrink-0 text-primary" aria-hidden="true"/>
          </a>
        ))}
      </div>
    </details>
  );
}

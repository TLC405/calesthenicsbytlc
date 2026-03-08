import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface MuscleGroup {
  id: string;
  label: string;
  aliases: string[];
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  { id: 'chest', label: 'Chest', aliases: ['chest', 'pectorals', 'pecs'] },
  { id: 'shoulders', label: 'Shoulders', aliases: ['shoulders', 'deltoids', 'delts', 'anterior deltoid', 'lateral deltoid', 'posterior deltoid'] },
  { id: 'biceps', label: 'Biceps', aliases: ['biceps', 'bicep'] },
  { id: 'triceps', label: 'Triceps', aliases: ['triceps', 'tricep'] },
  { id: 'forearms', label: 'Forearms', aliases: ['forearms', 'wrist flexors', 'wrist extensors', 'grip'] },
  { id: 'abs', label: 'Abs', aliases: ['abs', 'core', 'abdominals', 'rectus abdominis', 'obliques', 'transverse abdominis'] },
  { id: 'obliques', label: 'Obliques', aliases: ['obliques', 'external obliques', 'internal obliques'] },
  { id: 'quads', label: 'Quadriceps', aliases: ['quads', 'quadriceps', 'quad'] },
  { id: 'adductors', label: 'Adductors', aliases: ['adductors', 'inner thigh', 'groin'] },
  { id: 'calves', label: 'Calves', aliases: ['calves', 'calf', 'gastrocnemius', 'soleus'] },
  { id: 'traps', label: 'Traps', aliases: ['traps', 'trapezius', 'upper traps', 'lower traps'] },
  { id: 'lats', label: 'Lats', aliases: ['lats', 'latissimus dorsi', 'latissimus'] },
  { id: 'upper-back', label: 'Upper Back', aliases: ['upper back', 'rhomboids', 'rear delts', 'mid-back'] },
  { id: 'lower-back', label: 'Lower Back', aliases: ['lower back', 'erector spinae', 'spinal erectors'] },
  { id: 'glutes', label: 'Glutes', aliases: ['glutes', 'gluteus maximus', 'gluteus medius', 'gluteal'] },
  { id: 'hamstrings', label: 'Hamstrings', aliases: ['hamstrings', 'hamstring', 'posterior chain'] },
  { id: 'hip-flexors', label: 'Hip Flexors', aliases: ['hip flexors', 'hip', 'iliopsoas', 'psoas'] },
  { id: 'neck', label: 'Neck', aliases: ['neck', 'sternocleidomastoid'] },
  { id: 'serratus', label: 'Serratus', aliases: ['serratus', 'serratus anterior'] },
  { id: 'tibialis', label: 'Tibialis', aliases: ['tibialis', 'tibialis anterior', 'shins'] },
];

interface MuscleMapProps {
  selectedMuscle: string | null;
  onSelectMuscle: (muscleId: string | null) => void;
  view: 'front' | 'back';
}

// SVG-based interactive body with clickable muscle zones
function FrontBody({ selectedMuscle, onSelectMuscle }: Omit<MuscleMapProps, 'view'>) {
  const zones: { id: string; path: string; }[] = [
    // Neck
    { id: 'neck', path: 'M 145,62 Q 150,55 160,55 Q 170,55 175,62 L 172,78 Q 160,80 148,78 Z' },
    // Shoulders left
    { id: 'shoulders', path: 'M 115,85 Q 105,82 100,90 Q 95,100 98,115 L 118,108 L 120,88 Z' },
    // Shoulders right
    { id: 'shoulders', path: 'M 205,85 Q 215,82 220,90 Q 225,100 222,115 L 202,108 L 200,88 Z' },
    // Chest left
    { id: 'chest', path: 'M 120,88 L 118,108 L 130,120 L 155,118 L 155,88 Q 140,82 120,88 Z' },
    // Chest right
    { id: 'chest', path: 'M 200,88 L 202,108 L 190,120 L 165,118 L 165,88 Q 180,82 200,88 Z' },
    // Biceps left
    { id: 'biceps', path: 'M 98,115 Q 92,130 90,150 L 100,152 L 115,135 L 118,108 Z' },
    // Biceps right
    { id: 'biceps', path: 'M 222,115 Q 228,130 230,150 L 220,152 L 205,135 L 202,108 Z' },
    // Forearms left
    { id: 'forearms', path: 'M 90,150 Q 85,175 82,200 L 92,202 L 100,175 L 100,152 Z' },
    // Forearms right
    { id: 'forearms', path: 'M 230,150 Q 235,175 238,200 L 228,202 L 220,175 L 220,152 Z' },
    // Abs
    { id: 'abs', path: 'M 145,120 L 145,195 Q 155,200 165,200 L 175,195 L 175,120 Q 165,118 155,118 Z' },
    // Obliques left
    { id: 'obliques', path: 'M 130,120 L 125,155 L 130,195 L 145,195 L 145,120 Z' },
    // Obliques right
    { id: 'obliques', path: 'M 190,120 L 195,155 L 190,195 L 175,195 L 175,120 Z' },
    // Serratus left
    { id: 'serratus', path: 'M 118,108 L 115,135 L 125,140 L 130,120 Z' },
    // Serratus right
    { id: 'serratus', path: 'M 202,108 L 205,135 L 195,140 L 190,120 Z' },
    // Hip flexors left
    { id: 'hip-flexors', path: 'M 130,195 L 128,215 L 142,220 L 145,195 Z' },
    // Hip flexors right
    { id: 'hip-flexors', path: 'M 190,195 L 192,215 L 178,220 L 175,195 Z' },
    // Quads left
    { id: 'quads', path: 'M 128,215 L 122,275 L 135,290 L 148,280 L 142,220 Z' },
    // Quads right
    { id: 'quads', path: 'M 192,215 L 198,275 L 185,290 L 172,280 L 178,220 Z' },
    // Adductors left
    { id: 'adductors', path: 'M 142,220 L 148,280 L 160,260 L 155,200 L 145,195 Z' },
    // Adductors right
    { id: 'adductors', path: 'M 178,220 L 172,280 L 160,260 L 165,200 L 175,195 Z' },
    // Tibialis left
    { id: 'tibialis', path: 'M 122,295 L 120,350 L 130,360 L 138,350 L 135,295 Z' },
    // Tibialis right
    { id: 'tibialis', path: 'M 198,295 L 200,350 L 190,360 L 182,350 L 185,295 Z' },
    // Calves left (front view - partial)
    { id: 'calves', path: 'M 120,350 L 118,385 L 135,390 L 138,350 Z' },
    // Calves right (front view - partial)
    { id: 'calves', path: 'M 200,350 L 202,385 L 185,390 L 182,350 Z' },
  ];

  return (
    <svg viewBox="60 30 200 380" className="w-full h-full max-h-[65vh]">
      {/* Body outline */}
      <ellipse cx="160" cy="42" rx="22" ry="18" className="fill-muted stroke-foreground/30" strokeWidth="1" />
      {zones.map((zone, i) => (
        <path
          key={`${zone.id}-${i}`}
          d={zone.path}
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-foreground/20",
            selectedMuscle === zone.id
              ? "fill-primary/70 stroke-primary stroke-[1.5]"
              : "fill-muted-foreground/15 hover:fill-primary/30"
          )}
          strokeWidth="0.8"
          onClick={() => onSelectMuscle(selectedMuscle === zone.id ? null : zone.id)}
        />
      ))}
      {/* Labels */}
      <text x="160" y="42" textAnchor="middle" className="fill-foreground/50 text-[6px] font-mono pointer-events-none select-none">HEAD</text>
    </svg>
  );
}

function BackBody({ selectedMuscle, onSelectMuscle }: Omit<MuscleMapProps, 'view'>) {
  const zones: { id: string; path: string }[] = [
    // Neck
    { id: 'neck', path: 'M 145,62 Q 150,55 160,55 Q 170,55 175,62 L 172,78 Q 160,80 148,78 Z' },
    // Traps
    { id: 'traps', path: 'M 148,78 L 120,88 L 125,105 L 155,100 L 165,100 L 195,105 L 200,88 L 172,78 Q 160,82 148,78 Z' },
    // Shoulders left
    { id: 'shoulders', path: 'M 120,88 Q 105,85 100,95 Q 96,105 98,118 L 118,110 L 120,88 Z' },
    // Shoulders right
    { id: 'shoulders', path: 'M 200,88 Q 215,85 220,95 Q 224,105 222,118 L 202,110 L 200,88 Z' },
    // Upper back left
    { id: 'upper-back', path: 'M 125,105 L 118,110 L 120,135 L 145,130 L 155,100 Z' },
    // Upper back right
    { id: 'upper-back', path: 'M 195,105 L 202,110 L 200,135 L 175,130 L 165,100 Z' },
    // Lats left
    { id: 'lats', path: 'M 120,135 L 125,170 L 140,180 L 145,130 Z' },
    // Lats right
    { id: 'lats', path: 'M 200,135 L 195,170 L 180,180 L 175,130 Z' },
    // Lower back
    { id: 'lower-back', path: 'M 140,170 L 135,200 L 160,205 L 185,200 L 180,170 L 160,175 Z' },
    // Triceps left
    { id: 'triceps', path: 'M 98,118 Q 92,135 90,155 L 102,155 L 115,135 L 118,110 Z' },
    // Triceps right
    { id: 'triceps', path: 'M 222,118 Q 228,135 230,155 L 218,155 L 205,135 L 202,110 Z' },
    // Forearms left
    { id: 'forearms', path: 'M 90,155 Q 85,178 82,202 L 94,204 L 102,178 L 102,155 Z' },
    // Forearms right
    { id: 'forearms', path: 'M 230,155 Q 235,178 238,202 L 226,204 L 218,178 L 218,155 Z' },
    // Glutes left
    { id: 'glutes', path: 'M 135,200 L 130,230 L 150,235 L 160,205 Z' },
    // Glutes right
    { id: 'glutes', path: 'M 185,200 L 190,230 L 170,235 L 160,205 Z' },
    // Hamstrings left
    { id: 'hamstrings', path: 'M 130,230 L 124,295 L 140,300 L 150,290 L 150,235 Z' },
    // Hamstrings right
    { id: 'hamstrings', path: 'M 190,230 L 196,295 L 180,300 L 170,290 L 170,235 Z' },
    // Calves left
    { id: 'calves', path: 'M 124,300 L 120,360 L 138,365 L 140,305 Z' },
    // Calves right
    { id: 'calves', path: 'M 196,300 L 200,360 L 182,365 L 180,305 Z' },
  ];

  return (
    <svg viewBox="60 30 200 380" className="w-full h-full max-h-[65vh]">
      <ellipse cx="160" cy="42" rx="22" ry="18" className="fill-muted stroke-foreground/30" strokeWidth="1" />
      {zones.map((zone, i) => (
        <path
          key={`${zone.id}-${i}`}
          d={zone.path}
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-foreground/20",
            selectedMuscle === zone.id
              ? "fill-primary/70 stroke-primary stroke-[1.5]"
              : "fill-muted-foreground/15 hover:fill-primary/30"
          )}
          strokeWidth="0.8"
          onClick={() => onSelectMuscle(selectedMuscle === zone.id ? null : zone.id)}
        />
      ))}
      <text x="160" y="42" textAnchor="middle" className="fill-foreground/50 text-[6px] font-mono pointer-events-none select-none">HEAD</text>
    </svg>
  );
}

export function MuscleMap({ selectedMuscle, onSelectMuscle, view }: MuscleMapProps) {
  return view === 'front'
    ? <FrontBody selectedMuscle={selectedMuscle} onSelectMuscle={onSelectMuscle} />
    : <BackBody selectedMuscle={selectedMuscle} onSelectMuscle={onSelectMuscle} />;
}

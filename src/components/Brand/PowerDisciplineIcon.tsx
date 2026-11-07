import type { SVGProps } from 'react';

export type PowerDiscipline = 'planche' | 'handstand' | 'rings' | 'muscle-up' | 'mobility' | 'core' | 'yoga' | 'ballet';

/** A consistent line-drawn movement alphabet, sharp at every screen size. */
export function PowerDisciplineIcon({ discipline, ...props }: SVGProps<SVGSVGElement> & { discipline: PowerDiscipline }) {
  return <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {discipline === 'yoga' && <><circle cx="18" cy="7" r="3"/><path d="M18 11v10m-7-6 7-4 7 4M18 21l-8 7h16l-8-7M5 32h26"/></>}
    {discipline === 'ballet' && <><circle cx="18" cy="5" r="2.5"/><path d="M18 9v13m0-11L8 8l-3-5m13 8 9 2 5-4M18 22l-3 9h4m-1-9 10-6 3 1"/></>}
    {discipline === 'rings' && <>
      <path d="M11 3v15m14-15v15" /><ellipse cx="11" cy="23" rx="5" ry="7" />
      <ellipse cx="25" cy="23" rx="5" ry="7" /><path d="M8 7h6m8 0h6" />
    </>}
    {discipline === 'handstand' && <>
      <circle cx="18" cy="23" r="2.5" /><path d="m15 18 3-9 3 9m-3-9L13 3m5 6 5-6M14 18l-2 12h-3m13-12 2 12h3M8 33h20" />
    </>}
    {discipline === 'muscle-up' && <>
      <path d="M4 17h28M6 17v15m24-15v15" /><circle cx="18" cy="6" r="3" />
      <path d="m15 11-4 3v6m10-9 4 3v6m-10-9h6l-1 10-4 8m4-8 3 8" />
    </>}
    {discipline === 'planche' && <>
      <circle cx="8" cy="17" r="2.7" /><path d="m11 18 10 1 11-2m-12 2 11 3M14 19l-1 10h4M7 32h23" />
    </>}
    {discipline === 'mobility' && <>
      <circle cx="18" cy="7" r="2.5" /><path d="m17 12-4 9 8 4 5 7m-13-11-5 9H4m14-17 5 5 8 1m-13-7-7 3-6-3" />
    </>}
    {discipline === 'core' && <>
      <path d="m11 4-5 6 4 7 2 14h12l2-14 4-7-5-6m-12 8 5 2 5-2m-11 7 6 2 6-2m-11 7 5 2 5-2m-5-11v16" />
    </>}
  </svg>;
}

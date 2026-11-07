import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useMusic } from '@/providers/MusicProvider';
import { Button } from '@/components/ui/button';
import { Music, Play } from 'lucide-react';

/** A stable, visible page shelf: the official video is never hidden behind training UI. */
export function InlineSoundtrackSlot() {
  const {pathname}=useLocation();
  const target=useRef<HTMLDivElement>(null);
  const {playerVisible,isPlaying,playIntroAnthem,togglePlay}=useMusic();
  useEffect(()=>{
    if(pathname==='/intro')return;
    window.dispatchEvent(new CustomEvent('power-music-inline-target',{detail:target.current}));
    return()=>{window.dispatchEvent(new CustomEvent('power-music-inline-target',{detail:null}));};
  },[pathname]);
  if(pathname==='/intro')return null;
  return <section hidden={!playerVisible && pathname!=='/more'} className="power-inline-soundtrack mx-auto w-[calc(100%-2rem)] max-w-6xl border border-border bg-card rounded-xl p-4 mb-6" aria-label="Embedded POWER soundtrack">
    <div className="flex flex-wrap gap-3 items-center justify-between"><div><p className="text-xs text-primary uppercase tracking-widest flex gap-2 items-center"><Music className="h-4 w-4"/>POWER soundtrack</p><p className="text-xs text-muted-foreground mt-2">SNAP! — The Power · tap to play inside the page.</p></div><Button className="h-12" variant="outline" onClick={()=>playerVisible?togglePlay():playIntroAnthem()}><Play className="h-4 w-4 mr-2"/>{isPlaying?'Pause anthem':playerVisible?'Resume anthem':'Play anthem'}</Button></div>
    <div ref={target} className={playerVisible?'mt-4':'hidden'} />
  </section>;
}

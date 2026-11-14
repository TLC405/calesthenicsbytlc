import { Play, TvMinimal, ArrowRight } from 'lucide-react';

export function TlcTvTopBar({compact=false}:{compact?:boolean}){
 return <section className={'tlctv-topbar '+(compact?'is-compact':'')} aria-label="TLCtv">
  <span className="tlctv-topbar__mark"><img src="/icons/tlc-doodle-180.png" width={38} height={38} alt="TLC doodle"/></span>
  <span className="tlctv-topbar__copy"><strong>TLC<span>tv</span></strong><small>Watch the move. Then try it.</small></span>
  <button type="button" onClick={()=>window.dispatchEvent(new Event('power-open-tlctv'))} aria-label="Open TLCtv"><TvMinimal size={17}/><span>Open TV</span><ArrowRight size={14}/></button>
 </section>;
}

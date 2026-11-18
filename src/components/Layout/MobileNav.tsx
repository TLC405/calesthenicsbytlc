import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigationType } from 'react-router-dom';
import { Target, MoreHorizontal, Home, CalendarDays } from 'lucide-react';

/** Keep four readable tabs on narrow Fold screens; clients, tools and coach live in More. */
export function MobileNav() {
  const {pathname}=useLocation();
  const navigationType=useNavigationType();
  const previousPath=useRef(pathname);
  const [keyboardOpen,setKeyboardOpen]=useState(false);
  useEffect(()=>{
    const viewport=window.visualViewport;
    if(!viewport)return;
    const measure=()=>{
      const active=document.activeElement;
      const typing=active?.matches('input,textarea,select,[contenteditable="true"]')??false;
      setKeyboardOpen(window.innerWidth<=900&&typing&&window.innerHeight-viewport.height>140);
    };
    viewport.addEventListener('resize',measure);
    window.addEventListener('focusin',measure);
    window.addEventListener('focusout',measure);
    measure();
    return ()=>{viewport.removeEventListener('resize',measure);window.removeEventListener('focusin',measure);window.removeEventListener('focusout',measure);};
  },[]);
  // Remember where each destination was left, so returning via the dock
  // does not drop an athlete back at the top of a long progression list.
  const scrollPositions=useRef<Map<string,number>>(new Map());
  useLayoutEffect(()=>{
    const from=previousPath.current;
    previousPath.current=pathname;
    // Search, filters, selected tree nodes, tab views and history replacements
    // must never reset page scroll. Client tabs are one continuous workspace.
    if(from===pathname || navigationType==='POP')return;
    if(from.startsWith('/client')&&pathname.startsWith('/client'))return;
    const saved=scrollPositions.current.get(pathname);
    window.requestAnimationFrame(()=>{
      window.scrollTo({top:saved??0,left:0,behavior:'instant'});
    });
  },[pathname,navigationType]);
  if (pathname === '/workout') return null;
  const items = [
    {path:'/',label:'Train',icon:Home,active:pathname==='/'||pathname==='/intro'||['/today','/build','/train'].includes(pathname)},
    {path:'/program',label:'My Plan',icon:CalendarDays,active:pathname==='/program'||pathname==='/planner'},
    {path:'/skills',label:'Skills',icon:Target,active:pathname.startsWith('/skills')},
    {path:'/more',label:'More',icon:MoreHorizontal,active:pathname==='/more'||['/coach','/integrations','/tlctv/analyzer','/client','/assessment','/dashboard','/library','/videos','/community','/ai-lab','/anatomy','/settings','/account-settings'].some(route=>pathname===route||pathname.startsWith(route+'/'))},
  ];
  return <nav className={"power-mobile-nav power-simple-nav power-mobile-dock-v3"+(keyboardOpen?" is-keyboard-open":"")} aria-label="Bottom navigation" aria-hidden={keyboardOpen||undefined}>
    <div className="power-nav-surface">{items.map(({path,label,icon:Icon,active}) =>
      <Link key={path} to={path} aria-label={label} aria-current={active ? 'page' : undefined}
        onClick={event=>{
          scrollPositions.current.set(pathname,window.scrollY);
          if(path===pathname)event.preventDefault();
        }}
        className={`power-simple-nav-link ${active ? 'is-active' : ''}`}>
        <span className="power-dock-icon"><Icon size={22} strokeWidth={active?2.4:1.95} aria-hidden="true"/></span>
        <span className="power-dock-label">{label}</span>
      </Link>
    )}</div>
  </nav>;
}

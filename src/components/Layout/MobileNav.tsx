import { useLayoutEffect, useRef } from 'react';
import { Link, useLocation, useNavigationType } from 'react-router-dom';
import { Target, MoreHorizontal, Home, CalendarDays } from 'lucide-react';

/** Keep four readable tabs on narrow Fold screens; clients, tools and coach live in More. */
export function MobileNav() {
  const {pathname}=useLocation();
  const navigationType=useNavigationType();
  const previousPath=useRef(pathname);
  useLayoutEffect(()=>{
    const from=previousPath.current;
    previousPath.current=pathname;
    // Search, filters, selected tree nodes, tab views and history replacements
    // must never reset page scroll. Client tabs are one continuous workspace.
    if(from===pathname || navigationType==='POP')return;
    if(from.startsWith('/client')&&pathname.startsWith('/client'))return;
    window.scrollTo({top:0,left:0,behavior:'instant'});
  },[pathname,navigationType]);
  if (pathname === '/workout') return null;
  const items = [
    {path:'/',label:'Train',icon:Home,active:pathname==='/'||pathname==='/intro'||['/today','/build','/train'].includes(pathname)},
    {path:'/program',label:'My Plan',icon:CalendarDays,active:pathname==='/program'},
    {path:'/skills',label:'Skills',icon:Target,active:pathname.startsWith('/skills')},
    {path:'/more',label:'More',icon:MoreHorizontal,active:pathname==='/more'||['/integrations','/tlctv/analyzer','/client','/assessment','/dashboard','/library','/videos','/community','/ai-lab','/anatomy','/settings','/account-settings'].some(route=>pathname===route||pathname.startsWith(route+'/'))},
  ];
  return <nav className="power-mobile-nav power-simple-nav" aria-label="Primary navigation">
    <div className="power-nav-surface" style={{gridTemplateColumns:`repeat(${items.length},minmax(0,1fr))`}}>{items.map(({path,label,sublabel,icon:Icon,active}) =>
      <Link key={path} to={path} aria-label={sublabel ? `${label} / ${sublabel}` : label} aria-current={active ? 'page' : undefined} className={`power-simple-nav-link ${active ? 'is-active' : ''}`}>
        <Icon size={21} aria-hidden="true"/><span className={sublabel ? 'power-nav-two-line' : undefined}>{label}{sublabel && <small>{sublabel}</small>}</span>
      </Link>
    )}</div>
  </nav>;
}

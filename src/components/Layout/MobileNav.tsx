import { useLayoutEffect } from 'react';
import { Link, useLocation, useNavigationType } from 'react-router-dom';
import { Target, ClipboardCheck, Home } from 'lucide-react';

/** One navigation bar. Secondary tools live on More, away from workout controls. */
export function MobileNav() {
  const { pathname, key } = useLocation();
  const navigationType=useNavigationType();
  useLayoutEffect(()=>{
    if(navigationType!=='POP')window.scrollTo(0,0);
  },[key,navigationType]);
  if (pathname === '/workout') return null;
  const items = [
    {path:'/',label:'Home',icon:Home,active:pathname==='/'||pathname==='/intro'||['/today','/build','/train'].includes(pathname)},
    {path:'/skills',label:'Strength Skills',icon:Target,active:pathname.startsWith('/skills')},
    {path:'/assessment',label:'Test Strength',icon:ClipboardCheck,active:pathname==='/assessment'},
  ];
  return <nav className="power-mobile-nav power-simple-nav" aria-label="Primary navigation">
    <div className="power-nav-surface">{items.map(({path,label,icon:Icon,active}) =>
      <Link key={path} to={path} aria-current={active ? 'page' : undefined} className={`power-simple-nav-link ${active ? 'is-active' : ''}`}>
        <Icon size={21} aria-hidden="true"/><span>{label}</span>
      </Link>
    )}</div>
  </nav>;
}

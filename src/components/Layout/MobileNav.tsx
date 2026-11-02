import { Link, useLocation } from 'react-router-dom';
import { Target, Dumbbell, Menu } from 'lucide-react';

/** One navigation bar. Secondary tools live on More, away from workout controls. */
export function MobileNav() {
  const { pathname } = useLocation();
  if (['/auth', '/admin-login', '/workout'].includes(pathname)) return null;
  const items = [
    { path: '/skills', label: 'Skills', icon: Target, active: pathname === '/' || pathname.startsWith('/skills') },
    { path: '/build', label: 'Workout', icon: Dumbbell, active: ['/build', '/planner', '/train', '/routine-days'].includes(pathname) },
    { path: '/more', label: 'More', icon: Menu, active: !['/', '/build', '/planner', '/train', '/routine-days'].includes(pathname) && !pathname.startsWith('/skills') },
  ];
  return <nav className="power-mobile-nav power-simple-nav" aria-label="Primary navigation">
    <div className="power-nav-surface">{items.map(({path,label,icon:Icon,active}) =>
      <Link key={path} to={path} aria-current={active ? 'page' : undefined} className={`power-simple-nav-link ${active ? 'is-active' : ''}`}>
        <Icon size={21} aria-hidden="true"/><span>{label}</span>
      </Link>
    )}</div>
  </nav>;
}

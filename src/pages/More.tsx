import { Link } from 'react-router-dom';
import { ArrowRight, Library, TrendingUp, SlidersHorizontal, GitBranch, Crown, FileText, Shield, Target, BrainCircuit, PlugZap } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { MusicControl } from '@/components/Music/MusicControl';
import { InstallPowerApp } from '@/components/InstallPowerApp';

export default function More() {
  const {user}=useAuth();
  const links=[
    {to:'/skills?view=tree',label:'Skill Tree',note:'80 skills across 13 connected pathways',icon:GitBranch},
    {to:'/integrations',label:'My ChatGPT & Integrations',note:'ChatGPT, research and training tools',icon:PlugZap},
    {to:'/client',label:'Client Portal',note:'Sign up, test your skills, and view your results',icon:Target},
    {to:'/program',label:'My skill training plan',note:'Training days, handstands and skill steps',icon:Target},
    {to:'/library',label:'All exercises',note:'Search, videos and your own movements',icon:Library},
    {to:'/videos',label:'Tutorial checks',note:'Missing sources, playback and movement review',icon:Shield},
    {to:'/tlctv/analyzer',label:'TLCtv AI Video Analyzer',note:'Review exercise clips',icon:BrainCircuit},
    {to:'/dashboard',label:'My strength progress',note:'Workout history and recorded activity',icon:TrendingUp},
    {to:'/planner',label:'Custom workout',note:'Add your own exercises and sets',icon:FileText},
  ];
  return <main className="power-simple-page"><header className="power-simple-heading"><div><p className="power-simple-eyebrow">TLC / SUPER HUMAN TOOLS</p><h1>Your Strength Studio</h1><p>All the tools behind your super human progress.</p></div></header>
    <div className="power-more-links">{links.map(({to,label,note,icon:Icon})=><Link key={to} to={to}><Icon size={21}/><span><strong>{label}</strong><small>{note}</small></span><ArrowRight size={18}/></Link>)}</div>
    <details className="power-more-section su-appearance-details"><summary><SlidersHorizontal size={20}/> Change app theme</summary><div className="pt-4"><ThemeSwitcher/></div></details>
    <MusicControl/>

    <div className="power-more-links"><Link to="/intro"><Crown size={20}/><span>Super Human intro and soundtrack</span><ArrowRight size={18}/></Link><Link to={user?'/settings':'/admin-login'}><Shield size={20}/><span>{user?'Account settings':'Owner sign-in'}</span><ArrowRight size={18}/></Link></div>
    <div className="mt-5"><InstallPowerApp/></div>
  </main>;
}

import { InstallPowerApp } from '@/components/InstallPowerApp';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Gauge, Palette, Music2, ArrowUpRight } from 'lucide-react';
import { TrainingLevelControls } from '@/components/Progression/TrainingLevelControls';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { DifficultyBadge } from '@/components/Exercise/DifficultyBadge';
import { readTrainingProfile, writeTrainingProfile } from '@/lib/skillGraph';
export function TrainingSettings(){
 const {user}=useAuth();const [profile,setProfile]=useState(readTrainingProfile);
 useEffect(()=>{const sync=()=>setProfile(readTrainingProfile());window.addEventListener('power-training-profile',sync);return()=>window.removeEventListener('power-training-profile',sync);},[]);
 return <div className="power-settings-content"><InstallPowerApp/><details className="power-setting-section"><summary><Gauge size={19}/><span><strong>Training level</strong><small>Your level and starting checks</small></span><DifficultyBadge level={profile.tier||1} showLabel={false}/><ChevronDown size={16}/></summary><TrainingLevelControls profile={profile} onChange={next=>{setProfile(next);writeTrainingProfile(next);}}/></details><details className="power-setting-section"><summary><Palette size={19}/><span><strong>Look & feel</strong><small>Gym themes and appearance</small></span><ChevronDown size={16}/></summary><ThemeSwitcher/></details><details className="power-setting-section"><summary><Music2 size={19}/><span><strong>App & music</strong><small>Soundtrack, account and other tools</small></span><ChevronDown size={16}/></summary><Link to="/more">Music & extra tools <ArrowUpRight size={16}/></Link>{user&&<Link to="/account-settings">Account settings <ArrowUpRight size={16}/></Link>}<Link to="/admin-login">Owner sign-in <ArrowUpRight size={16}/></Link></details><p className="power-settings-note">Preferences save on this device. Workouts have no time cutoff.</p></div>;
}

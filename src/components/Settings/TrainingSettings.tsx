import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrainingLevelControls } from '@/components/Progression/TrainingLevelControls';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { readTrainingProfile, writeTrainingProfile, type TrainingEquipment } from '@/lib/skillGraph';
const equipment:TrainingEquipment[]=['floor','wall','rings','bar','parallettes','bands','bench'];
export function TrainingSettings(){
 const {user}=useAuth();const [profile,setProfile]=useState(readTrainingProfile);
 useEffect(()=>{const sync=()=>setProfile(readTrainingProfile());window.addEventListener('power-training-profile',sync);return()=>window.removeEventListener('power-training-profile',sync);},[]);
 return <div className="power-settings-content"><section><h2>Equipment available</h2><p>Choose what you can use today.</p><div className="power-settings-gear">{equipment.map(gear=><button type="button" aria-pressed={profile.equipment.includes(gear)} key={gear} onClick={()=>{const next={...profile,equipment:profile.equipment.includes(gear)?profile.equipment.filter(g=>g!==gear):[...profile.equipment,gear]};setProfile(next);writeTrainingProfile(next);}}>{gear==='bar'?'Pull-up bar':gear==='bench'?'Bench / box':gear}</button>)}</div></section><details><summary>Level & readiness · L{profile.tier||1}</summary><TrainingLevelControls profile={profile} onChange={next=>{setProfile(next);writeTrainingProfile(next);}}/></details><details><summary>Appearance</summary><ThemeSwitcher/></details><details><summary>Account, music & other tools</summary><Link to="/more">Music, intro & extra tools</Link>{user&&<Link to="/account-settings">Account settings</Link>}<Link to="/admin-login">Owner sign-in</Link></details><p className="power-settings-note">Changes save on this device. Training level changes never create workout results.</p></div>;
}

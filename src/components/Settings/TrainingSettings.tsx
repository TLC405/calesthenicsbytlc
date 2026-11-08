import { InstallPowerApp } from '@/components/InstallPowerApp';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrainingLevelControls } from '@/components/Progression/TrainingLevelControls';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { readTrainingProfile, writeTrainingProfile } from '@/lib/skillGraph';
export function TrainingSettings(){
 const {user}=useAuth();const [profile,setProfile]=useState(readTrainingProfile);
 useEffect(()=>{const sync=()=>setProfile(readTrainingProfile());window.addEventListener('power-training-profile',sync);return()=>window.removeEventListener('power-training-profile',sync);},[]);
 return <div className="power-settings-content"><InstallPowerApp/><details><summary>Level & starting checks · L{profile.tier||1}</summary><TrainingLevelControls profile={profile} onChange={next=>{setProfile(next);writeTrainingProfile(next);}}/></details><details><summary>Appearance</summary><ThemeSwitcher/></details><details><summary>Account, music & other tools</summary><Link to="/more">Music, intro & extra tools</Link>{user&&<Link to="/account-settings">Account settings</Link>}<Link to="/admin-login">Owner sign-in</Link></details><p className="power-settings-note">Changes save on this device. Training level changes never create workout results.</p></div>;
}

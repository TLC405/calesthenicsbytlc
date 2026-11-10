import { useEffect, useState } from 'react';
import { Smartphone, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog,DialogContent,DialogTitle,DialogDescription } from '@/components/ui/dialog';
import { isPowerStandalone,promptPowerInstall } from '@/lib/installPower';
export function InstallPowerApp({compact=false}:{compact?:boolean}){
 const [installed,setInstalled]=useState(isPowerStandalone),[open,setOpen]=useState(false),[copied,setCopied]=useState(false);
 useEffect(()=>{const sync=()=>setInstalled(isPowerStandalone());const installed=()=>setInstalled(true);window.addEventListener('power-install-ready',sync);window.addEventListener('appinstalled',installed);return()=>{window.removeEventListener('power-install-ready',sync);window.removeEventListener('appinstalled',installed);};},[]);
 async function install(){try{const result=await promptPowerInstall();if(result==='accepted')setInstalled(true);else if(result==='unavailable')setOpen(true);}catch{setOpen(true);}}
 if(installed)return null;
 const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);const android=/android/i.test(navigator.userAgent);
 return <><Button type="button" variant="outline" className={`power-install-button ${compact?'is-compact':''}`} onClick={()=>void install()}><Smartphone size={17}/>Install TLC Strength</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="power-install-dialog max-w-sm rounded-2xl"><DialogTitle>TLC's Super Human Strength</DialogTitle><DialogDescription>Install TLC Strength once, then launch your super human training hub directly from your home screen.</DialogDescription>{ios?<p>In Safari, tap <strong>Share → Add to Home Screen → Add</strong>.</p>:<><p>If the install prompt isn’t available here, open this page in Chrome or Samsung Internet and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>{android&&<a className="focus-primary" href={`intent://${location.host}/#Intent;scheme=https;package=com.android.chrome;end`}><ExternalLink size={17}/>Open in Chrome</a>}</>}<Button variant="outline" onClick={()=>{void navigator.clipboard.writeText(location.origin+'/').then(()=>setCopied(true)).catch(()=>setCopied(false));}}><Copy size={16}/>{copied?'Link copied':'Copy POWER link'}</Button><p className="text-xs text-muted-foreground">The phone must confirm installation. Some in-app browsers cannot show the install prompt.</p></DialogContent></Dialog></>;
}

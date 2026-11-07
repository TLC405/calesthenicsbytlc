type PowerInstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};
let deferred:PowerInstallEvent|null=null;
let listening=false;
export function preparePowerInstall(){if(listening)return;listening=true;window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferred=event as PowerInstallEvent;window.dispatchEvent(new Event('power-install-ready'));});window.addEventListener('appinstalled',()=>{deferred=null;window.dispatchEvent(new Event('power-install-ready'));});}
export function isPowerStandalone(){return window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone);}
export async function promptPowerInstall(){const prompt=deferred;if(!prompt)return'unavailable' as const;deferred=null;await prompt.prompt();return(await prompt.userChoice).outcome;}

/** The PWA manifest already launches at Home. Never replace a direct link
 * to a skill, workout, client profile, video, or assessment with Home.
 * Only a legacy explicit launch path can be redirected. */
export function shouldLaunchHome(standalone:boolean,pathname:string,firstDocumentVisit:boolean){
  return standalone && firstDocumentVisit && pathname==='/launch-home';
}

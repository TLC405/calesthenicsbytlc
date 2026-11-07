export const DEFAULT_THEME='vasa';
const allowed=new Set(['default','vasa','planet-fitness','ymca','okc-thunder']);
export function initialTheme(){
 try{
  let selected=localStorage.getItem('power-theme');
  // Upgrade the former default once. A later explicit theme choice is retained.
  if(!localStorage.getItem('power-vasa-default-v1')){
   if(!selected||selected==='default')selected=DEFAULT_THEME;
   localStorage.setItem('power-vasa-default-v1','1');
   localStorage.setItem('power-theme',selected||DEFAULT_THEME);
  }
  return selected&&allowed.has(selected)?selected:DEFAULT_THEME;
 }catch{return DEFAULT_THEME;}
}

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

const chromeColors:Record<string,string>={default:'#EAD9B2',vasa:'#AD1D32','planet-fitness':'#140D1B',ymca:'#DCEBF0','okc-thunder':'#07162D'};
let currentTheme:string|undefined;
export function applyThemeAppearance(theme:string){
 if(theme==='default')document.documentElement.removeAttribute('data-theme');
 else document.documentElement.dataset.theme=theme;
 const meta=document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
 if(meta)meta.content=chromeColors[theme]||chromeColors.vasa;
}
export function themeSnapshot(){return currentTheme??(currentTheme=initialTheme());}
export function selectTheme(theme:string){
 if(!allowed.has(theme))return;
 currentTheme=theme;
 try{localStorage.setItem('power-theme',theme);}catch{/* Appearance still works when storage is unavailable. */}
 applyThemeAppearance(theme);
 window.dispatchEvent(new Event('power-theme-changed'));
}
export function subscribeTheme(listener:()=>void){
 const storage=(event:StorageEvent)=>{
  if(event.key!=='power-theme'&&event.key!==null)return;
  currentTheme=event.newValue&&allowed.has(event.newValue)?event.newValue:initialTheme();
  applyThemeAppearance(currentTheme);
  listener();
 };
 window.addEventListener('power-theme-changed',listener);
 window.addEventListener('storage',storage);
 return()=>{window.removeEventListener('power-theme-changed',listener);window.removeEventListener('storage',storage);};
}

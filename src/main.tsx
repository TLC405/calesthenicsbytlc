import { createRoot } from "react-dom/client";
import { preparePowerInstall } from "./lib/installPower";
import { themeSnapshot, applyThemeAppearance } from "./lib/themePreference";
import "./index.css";
import "./styles/neumorph.css";
import "./styles/power-gold.css";
import "./styles/beginner-practice.css";
import "./styles/ui-sweep.css";
// Foundations precede the theme and screen layers imported by App.
import App from "./App.tsx";
import "./styles/prime-refinement.css";

// Match the HTML bootstrap before React paints, including direct Library links.
// Only appearance preferences are migrated; training records stay intact.
applyThemeAppearance(themeSnapshot());

preparePowerInstall();
if(import.meta.env.PROD&&"serviceWorker" in navigator){window.addEventListener("load",()=>{void navigator.serviceWorker.register("/power-sw.js",{scope:"/",updateViaCache:"none"}).catch(()=>{});});}

const bootStarted=performance.now();
const rootElement=document.getElementById("root")!;
createRoot(rootElement).render(<App />);
const boot=document.getElementById("tlc-prime-boot");
if(boot){
 const release=()=>{
  boot.classList.add("is-leaving");
  window.setTimeout(()=>boot.remove(),340);
 };
 const waitForApp=()=>{
  const elapsed=performance.now()-bootStarted;
  const hasApp=Boolean(rootElement.querySelector(".power-app-shell"))&&!rootElement.querySelector('[data-route-loading]');
  if(hasApp||elapsed>=10000){release();return;}
  window.setTimeout(waitForApp,90);
 };
 waitForApp();
}

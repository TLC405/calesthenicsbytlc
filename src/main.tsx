import { createRoot } from "react-dom/client";
import { preparePowerInstall } from "./lib/installPower";
import App from "./App.tsx";
import { initialTheme } from "./lib/themePreference";
import "./index.css";
import "./styles/neumorph.css";
import "./styles/power-gold.css";
import "./styles/beginner-practice.css";
import "./styles/ui-sweep.css";

// Match the HTML bootstrap before React paints, including direct Library links.
// Only appearance preferences are migrated; training records stay intact.
const theme=initialTheme();
if(theme==='default')document.documentElement.removeAttribute('data-theme');
else document.documentElement.setAttribute('data-theme',theme);

preparePowerInstall();
if(import.meta.env.PROD&&"serviceWorker" in navigator){window.addEventListener("load",()=>{void navigator.serviceWorker.register("/power-sw.js",{scope:"/",updateViaCache:"none"}).catch(()=>{});});}

createRoot(document.getElementById("root")!).render(<App />);

import { createRoot } from "react-dom/client";
import { preparePowerInstall } from "./lib/installPower";
import { prepareAppUpdates } from "./lib/appUpdates";
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
prepareAppUpdates();
const rootElement=document.getElementById("root")!;
createRoot(rootElement).render(<App />);
window.TLCBoot?.ready();

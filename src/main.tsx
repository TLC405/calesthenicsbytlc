import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initialTheme } from "./lib/themePreference";
import "./index.css";
import "./styles/neumorph.css";
import "./styles/power-gold.css";
import "./styles/beginner-practice.css";

// Match the HTML bootstrap before React paints, including direct Library links.
// Only appearance preferences are migrated; training records stay intact.
const theme=initialTheme();
if(theme==='default')document.documentElement.removeAttribute('data-theme');
else document.documentElement.setAttribute('data-theme',theme);

createRoot(document.getElementById("root")!).render(<App />);

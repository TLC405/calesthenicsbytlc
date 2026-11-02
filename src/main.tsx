import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/neumorph.css";
import "./styles/power-gold.css";

// Apply the requested brand before the first paint, including direct Library links.
// This changes appearance only; workout, exercise and session storage stay intact.
try {
  if (localStorage.getItem('power-brand-release') !== 'gold-2026-11') {
    localStorage.setItem('power-theme', 'default');
    localStorage.setItem('power-brand-release', 'gold-2026-11');
  }
  const theme = localStorage.getItem('power-theme');
  if (theme && theme !== 'default') document.documentElement.setAttribute('data-theme', theme);
  else document.documentElement.removeAttribute('data-theme');
} catch {
  document.documentElement.removeAttribute('data-theme');
}

createRoot(document.getElementById("root")!).render(<App />);

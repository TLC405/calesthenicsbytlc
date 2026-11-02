/** Generated art is decorative; labels, lines and controls remain native UI. */
export function PowerAthleteArt() {
  return <div className="power-hero-art" aria-hidden="true">
    <svg className="power-art-orbits" viewBox="0 0 600 600" fill="none">
      <g stroke="currentColor" strokeWidth=".8">
        <circle cx="300" cy="300" r="245" />
        <circle cx="300" cy="300" r="212" strokeDasharray="2 12" />
        <circle cx="300" cy="300" r="167" />
        <path d="M300 28v38m0 468v38M28 300h38m468 0h38M91 91l26 26m366 366 26 26" />
      </g>
      <g fill="currentColor"><circle cx="55" cy="300" r="3" /><circle cx="545" cy="300" r="3" /></g>
    </svg>
    <img className="power-athlete-image" src="/art/power-ring-athlete.webp" alt=""
      width="1024" height="1536" fetchPriority="high" decoding="async" />
  </div>;
}

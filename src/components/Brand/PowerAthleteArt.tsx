/** Original vector illustration. Accessible as decoration; UI text and controls stay real DOM elements. */
export function PowerAthleteArt() {
  return (
    <div className="power-hero-art" aria-hidden="true">
      <svg viewBox="0 0 550 550" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="powerMetal" x1="150" y1="125" x2="414" y2="463" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFDF9B"/>
            <stop offset=".38" stopColor="#BA8947"/>
            <stop offset=".8" stopColor="#6F4D2C"/>
            <stop offset="1" stopColor="#DDAB64"/>
          </linearGradient>
          <linearGradient id="powerSuit" x1="200" y1="202" x2="360" y2="505" gradientUnits="userSpaceOnUse">
            <stop stopColor="#353027"/><stop offset=".7" stopColor="#0B0E0E"/><stop offset="1" stopColor="#1B1916"/>
          </linearGradient>
        </defs>
        <g opacity=".28" stroke="#E9BC68" strokeWidth="1">
          <circle cx="278" cy="268" r="212"/>
          <circle cx="278" cy="268" r="154"/>
          <circle cx="278" cy="268" r="98"/>
          <path d="M0 268H550M278 0V550M50 40L505 505M500 43L51 501"/>
        </g>
        <g stroke="#AA8247" strokeWidth="5" strokeLinecap="round">
          <path d="M126 -20V298"/><path d="M428 -20V298"/>
        </g>
        <g stroke="url(#powerMetal)" strokeWidth="12">
          <ellipse cx="126" cy="320" rx="31" ry="40"/>
          <ellipse cx="428" cy="320" rx="31" ry="40"/>
        </g>
        <g stroke="#F5CC80" strokeOpacity=".45" strokeWidth="2">
          <path d="M121 283V356M423 283V356"/>
        </g>
        {/* Heroic athlete drawn as hand-designed geometric metallic figure */}
        <path d="M253 170C237 160 232 141 237 115C242 86 272 70 295 79C324 86 341 107 333 137C329 156 311 175 295 180Z" fill="url(#powerMetal)" stroke="#D2A160" strokeWidth="3"/>
        <path d="M237 118Q266 76 310 94Q321 98 334 119Q296 111 278 121Z" fill="#131516"/>
        <path d="M243 151Q268 160 295 155Q314 149 325 137" stroke="#32271C" strokeWidth="5" strokeLinecap="round"/>
        <path d="M267 164L259 199L303 214L312 164Z" fill="#B58650"/>
        <path d="M262 193C232 194 210 199 186 216C163 230 153 258 141 288L115 300L132 326C169 320 183 289 192 270L208 258L213 324L229 384L213 449L249 507L292 517L337 481L341 421L356 338L352 251L375 270L398 302L422 326L445 299L427 284C409 239 381 213 351 202C333 195 315 193 302 194L288 223Z" fill="url(#powerMetal)" stroke="#B78849" strokeWidth="4"/>
        <path d="M233 221Q280 236 336 217L348 279L338 372L345 457L306 504L247 486L218 416L219 281Z" fill="url(#powerSuit)" stroke="#B98B51" strokeWidth="3"/>
        <path d="M229 225Q244 251 278 262Q312 253 335 225M222 285Q269 291 347 285M232 313L337 321M240 351L332 360M253 390L325 402M262 436L322 448" stroke="#CD9B5C" strokeOpacity=".7" strokeWidth="3"/>
        <path d="M197 223Q168 248 158 283L140 298M358 215Q386 242 403 283L422 298" stroke="#F7D595" strokeWidth="8" strokeLinecap="round" strokeOpacity=".65"/>
        <path d="M115 297L104 316L120 339L140 328L150 306ZM427 295L409 315L421 337L445 331L452 312Z" fill="#BD8E55"/>
        <path d="M248 112Q269 103 285 110M300 110Q319 108 328 116" stroke="#181716" strokeWidth="5" strokeLinecap="round"/>
        <path d="M259 141Q281 150 311 141M265 154Q294 169 314 149" stroke="#5A3B20" strokeWidth="3"/>
        <path d="M219 471Q232 502 251 521M340 477Q330 511 311 526" stroke="#6E4E2A" strokeWidth="14" strokeLinecap="round"/>
        <g fill="#E9BC68"><circle cx="75" cy="405" r="3"/><circle cx="483" cy="135" r="3"/><circle cx="493" cy="469" r="4"/></g>
        <path d="M60 405H150M436 135H500M440 469H513" stroke="#E9BC68" strokeOpacity=".6"/>
      </svg>
    </div>
  );
}

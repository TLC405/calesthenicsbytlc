/** Indeterminate feedback: bundle loading has no measurable percentage. */
export function LoadingScreen() {
 return <div data-route-loading role="status" aria-label="Loading TLC Prime" className="tlc-prime-loading">
  <div className="tlc-prime-loading__inner">
   <img src="/brand/spread-tlc-original-20261115.jpg" width={1536} height={877}
    alt="Spread More TLC — Oklahoma City community artwork" loading="eager"/>
   <span className="sr-only">Opening your training screen…</span>
  </div>
 </div>;
}

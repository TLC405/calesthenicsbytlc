import catalog from '@/data/publicExerciseCatalog.json';
import { minimumTier } from '@/lib/trainingPolicy';
import { canonicalSlug } from '@/lib/exerciseProgressions';

/** Band guidance is NOT an instruction to improvise bodyweight-bearing anchors.
 * Classification is per movement family. "Alternative" is not biomechanically equivalent
 * to the named movement; "supervised" explicitly disallows DIY installation.
 * Band color/width has no universal force rating across makers or anchor geometry.
 */
export type BandMode = 'assisted' | 'alternative' | 'supervised' | 'skip';
export type BandGuide = {
  mode: BandMode;
  title: string;
  summary: string;
  setup: string[];
  progression: string;
  caution: string;
  logHint: string;
};
const known = new Map(catalog.map(row => [row.slug, row]));
const universal = 'Inspect the band and attachment before every set; follow the manufacturer\'s stretch limit. Secure rated anchors, keep elastic recoil clear of your face and others, and never release a stretched band.';
const logHint = 'Record the band brand/size, anchor height, loop length, support position and actual reps or seconds. Band colors and stated resistance are not comparable across manufacturers.';

function plan(mode: BandMode, title: string, summary: string, setup: string[], progression: string, caution = universal, log = logHint): BandGuide {
  return {mode,title,summary,setup,progression,caution,logHint:log};
}
const skip=(reason:string,alternative:string):BandGuide=>plan(
  'skip','Use a simpler movement, not band assistance',reason,
  [alternative,'Continue with your linked easier progression at a comfortable, controlled range.'],
  'Advance only when the easier variation is repeatable without joint pain or loss of control.',
  'A stretched band changes loading across the movement and can slip. Do not rig a band to hold your body or prevent a fall.');

export function bandGuideFor(rawSlug:string):BandGuide {
  const slug=canonicalSlug(rawSlug);
  const exercise=known.get(slug)||known.get(rawSlug);
  if(!exercise)return skip('No validated band setup is documented for this custom movement.','Ask a qualified coach to assess the movement before choosing an assisted setup.');
  const tier=minimumTier(slug);
  const category=exercise.category.toLowerCase();

  // Advanced straight-arm and inversion skills need a dedicated rated system or live coaching.
  // We intentionally do not provide a home-made load-bearing rig recipe.
  if(/iron-cross|maltese|victorian|ring-back-lever|ring-muscle-up|one-arm-chin-up|one-arm-hang|360-pull|ring-fly|german-hang|skin-the-cat|ringmaster/.test(slug)||
    tier>=5&&(/lever|planche|flag|press|handstand|manna|stalder|cross|support|hang|muscle-up/.test(slug)))
    return plan('supervised','Bands only with a coach-approved setup',
      'A loop band may offset some load in advanced training, but it does not make this elite skill automatically safe.',
      ['Build the listed prerequisites before attempting the full skill.','If a coach uses bands, have them select and verify rated attachment hardware, assisted load, entry and exit.','Otherwise use stable feet support, spotting or an easier leverage progression instead.'],
      'Progress by repeating controlled prerequisites and gradually reducing assistance only under supervision.',
      'Do not improvise overhead, ring, flag or straight-arm load-bearing anchors. Elastic recoil and an uncontrolled dismount can cause injury.');

  if(/(human-flag|clutch-flag|vertical-human-flag|feet-assisted-human-flag|band-assisted-human-flag|tuck-human-flag|one-leg-human-flag|straddle-human-flag)/.test(slug))
    return plan('supervised','Coach-supervised band-assisted flag',
      'Some flag drills can use elastic assistance, but anchor direction and rotation make an unsupervised rig unreliable.',
      ['Practice the top-arm pull and bottom-arm push with a stable foot on the floor or step first.','Use a band only if a coach has verified the anchor, apparatus, entry/exit and direction of assistance.','Do not let the band rotate or sling the torso during release.'],
      'Work on supported holds on both sides; reduce elastic help only when stable form is consistent.',
      'Never use a band as fall protection or improvise a load-bearing flag anchor.');

  if(/planche|press-to-hs|stalder|handstand-push-up|hspu|wall-press|bent-arm-handstand/.test(slug))
    return plan('supervised','Band support requires a verified setup',
      'Elastic assistance is sometimes used for planche, press and handstand-strength drills, but it cannot replace prerequisites, spotting or a controlled inversion exit.',
      ['First select the easier linked lean, tuck, incline-pike or wall variation.','If using an assisted harness or overhead band, follow a qualified coach and equipment instructions for a rated rig.','Do not suspend yourself from an improvised door, ring or pull-up-bar attachment.'],
      'Build repeatable sets with the same setup, then reduce assistance with coaching while preserving straight-arm or shoulder control.',
      'Do not use elastic support as a fall-arrest device. Stop for wrist, elbow, shoulder or neck discomfort.');

  if(/handstand|headstand|forearm-stand|elbow-stand|wall-pull-away|hs-kick-up|wall-toe-taps|handstand-walk/.test(slug))
    return skip('Inverted balance is not a safe place for an improvised elastic lifeline.',
      'Use wall support, a stable partial inversion or supervised spotting; confirm you can exit safely before progressing.');

  if(/pull-up|chin-up|scapular-pull-up|scapular-pulls|muscle-up/.test(slug)){
    if(/muscle-up/.test(slug))return plan('supervised','Assisted pull and transition drills first',
      'Band-assisted muscle-up work changes force and momentum through the transition. Do not treat a band as clearance for an unsupported skill.',
      ['Train band-assisted pull-ups and feet-assisted low-ring transitions separately.','For a full muscle-up, use only a coach-checked apparatus and assisted technique.'],
      'Progress from controlled pulling and transitions toward a less-assisted pattern, not from bouncing in the loop.',
      'Avoid elastic recoil toward the face and uncontrolled swings or landings.');
    return plan('assisted','Band-assisted vertical pulling',
      'A correctly fitted loop can reduce your effective bodyweight during a pull-up or chin-up.',
      ['Use a stable, rated bar. Inspect a continuous loop band and attach it according to its instructions.','Use a stable step to safely place a knee or foot in the loop (not the toes), then take full control of the bar.','Pull and lower steadily; stop if the band shifts or your form breaks. Step off under control.'],
      'Start with enough assistance for clean controlled reps. As reps become repeatable, use a band that gives less assistance while keeping the same setup and range.',
      'Assistance varies across the rep and by loop stretch. Avoid swinging, snapping back, unstable bars and band recoil near the face.');

  }

  if(/dip/.test(slug)){
    return plan('supervised','Band-assisted dips: setup dependent',
      'A band may reduce load on a suitable dip station, but a slipping loop or unstable bars is not worth the risk.',
      ['Use foot-assisted support, a stable machine or an easier push-up first.','If using a band, follow a manufacturer-approved dip attachment or trained coach\'s setup; check clearance for hands, feet and exit.'],
      'Use progressively less assistance only after the same depth and controlled shoulder position are comfortable.',
      'Do not loop improvised bands across sharp handles or use a band that could recoil toward the face.');
  }

  if(/pistol-squat|shrimp-squat|sissy-squat|single-leg-squat|cossack-squat|assisted-box-pistol/.test(slug)){
    return plan('assisted','Light band counterbalance — optional',
      'A light band can help with balance and position if held from a securely rated anchor; it does not eliminate the need for leg control.',
      ['Choose a stable hand-height attachment that does not slide or pull sideways. Hold the band lightly in front as counterbalance; keep both feet on a clear floor.','Prefer a sturdy rail or rings if the band makes your balance less predictable. Do not let the anchor pull you deeper.'],
      'Gradually hold less tension as repeated squat depth and alignment become comfortable, then try the unassisted box or pistol progression.',
      'Do not use bands to force knee or hip range. Keep hands and face clear of recoil.');
  }

  if(/nordic-curl|reverse-nordic|nordic-negative/.test(slug)){
    return plan('supervised','Nordic assistance requires a rated setup',
      'A band can reduce the eccentric lowering demand, but it needs a deliberately secured anchor and a reliable return position.',
      ['Use foot/ankle anchoring designed for Nordic curls and begin with a partial range or easier hamstring curl.','Only use an overhead assistance band in a coach-verified setup that stays secure through the entire lowering phase.'],
      'Increase controlled range before reducing band assistance; keep the return safe.',
      'A dislodged band or ankle anchor can cause a fall. Do not improvise either attachment.');
  }

  if(/(front-lever|back-lever|tuck-front-lever|advanced-tuck-front-lever|tuck-back-lever)/.test(slug))
    return plan('supervised','Band-assisted levers need coached rigging',
      'Elastic bodyweight support may reduce lever demand, but it cannot substitute for a secure bar, controlled dismount or shoulder readiness.',
      ['Use tuck and shorter lever progressions first.','Only perform band-assisted full-body hangs with a coach-verified rated attachment and controlled entry/exit.'],
      'Progress by reducing leverage first, then assistance, without losing trunk and scapular control.',
      'Do not attempt unsupported aerial loading using homemade loops or unknown hardware.');

  if(/push-up|pushup/.test(slug))
    return plan('alternative','Use an incline; a back-loop band makes push-ups harder',
      'A band stretched across your back typically adds resistance rather than assisting the push-up. Incline and wall push-ups are safer load reductions.',
      ['Start with a wall or elevated-hands push-up at a stable surface.','For a separate chest-strength accessory, use a light band chest press with a suitable fixed anchor and controlled return. It is not the same movement.'],
      'Lower the incline as you build controlled reps. Reduce the band resistance if training the accessory separately.',
      'Do not describe a resistance-band push-up as an assisted push-up. Avoid poorly secured door anchors or recoil toward your head.');

  if(/(ring-row|ring-rows|australian-row|bodyweight-row|archer-ring-row|ring-scapular-row|false-grip-ring-row)/.test(slug))
    return plan('alternative','Band row as a lighter pulling accessory',
      'A banded row provides adjustable horizontal pulling work, but is a separate exercise from a bodyweight or ring row.',
      ['Secure the band at a rated torso-height attachment and hold its ends while standing on stable ground.','Pull toward the ribs without jerking, and return the band slowly; or simply raise the ring handles and stand more upright.'],
      'Decrease help in your bodyweight row by lowering the handles or becoming more horizontal when you can control the existing variation.',
      universal);

  if(category==='rings'||/ring-|rings/.test(slug))
    return plan('alternative','Use foot support before elastic assistance',
      'On rings, stable foot support and a shorter body lever are usually more predictable than a band.',
      ['Lower the rings or use a stable floor-supported angle for the movement.','A separate light band press or row can be an accessory if it matches the muscle group and has a safe anchor.'],
      'Gradually remove foot support or change body angle; do not confuse band resistance with actual ring stability.',
      'Do not attach an improvised band to suspension straps, rings or overhead points to catch your bodyweight.');

  if(category==='pull')
    return plan('alternative','Choose a lighter resistance-band pull',
      'A band pull can be a useful lower-load accessory, but does not directly replace grip and hanging technique.',
      ['Use a rated anchor at the appropriate height for a standing row or pull, keeping the band away from the face.','Practice a lighter band variation with a steady return, or choose a foot-supported pulling progression.'],
      'Progress by increasing controlled range and reducing support in the actual movement; adjust the accessory band separately.',
      universal);

  if(category==='push')
    return plan('alternative','Light band pressing is an accessory',
      'A light elastic press can develop pushing strength, but is not automatically a lighter version of a floor or straight-arm skill.',
      ['Choose the linked incline, wall or support drill to reduce bodyweight load.','For separate band work, use a supported standing press at a rated anchor with a smaller resistance.'],
      'Build repeatable reps in the original easier progression before advancing.',
      'Do not loop the band to suspend your body or use an overhead anchor as fall protection.');

  if(category==='legs')
    return plan('alternative','Light band lower-body accessory',
      'Band side steps, hinge or hip work may be useful accessories; they are not direct substitutions for a loaded squat, jump or single-leg skill.',
      ['Use a manufacturer-approved short loop for a small controlled range, avoiding sharp edges.','Use stable rail, box or partial-range support for the original exercise instead of trying to sling your body with a band.'],
      'Gradually increase exercise range and control; change band resistance independently.',
      universal);

  if(category==='flexibility'||category==='mobility'||category==='yoga')
    return plan('alternative','Band as a gentle mobility strap',
      'A long, low-tension band may work as a flexible strap for positioning; it should not force range or hold an inverted pose.',
      ['Use it as a soft extension of the hands where you can safely release tension slowly.','Keep the stretch comfortable and stop before joints are pulled beyond their own controlled range.'],
      'Improve control and active range before changing stretch intensity.',
      'Do not secure a taut loop around the neck, head or unstable joint; use yoga blocks or a regular non-elastic strap if easier.');

  if(category==='grip')
    return plan('alternative','Band finger-extension accessory',
      'A small finger-extension band trains the opening muscles of the hand but does not reduce the load of a loaded hang or pinch hold.',
      ['Use a light finger-extension band for controlled opening and closing.','For an easier hang, keep feet supported or shorten the hold instead of suspending your body in a band.'],
      'Progress your actual grip movement by improving control and reducing foot support; treat finger extensions as separate work.',
      universal);

  if(category==='core')
    return plan('alternative','Bands add resistance; shorten the lever instead',
      'In many core holds and leg lifts, bands add resistance rather than making the movement easier.',
      ['Use bent knees, shorter limbs, floor support or a shorter controlled hold first.','If doing separate anti-rotation band work, use a low-tension band at a rated, stable anchor.'],
      'Extend the lever gradually once you can repeat the easier movement with controlled trunk position.',
      'Do not hook elastic loops to an inverted body or use a band as fall protection.');

  return skip('This movement has no reliable catalog-specific assisted-band setup.','Choose the named lower-demand variation or reduce range and bodyweight support.');
}

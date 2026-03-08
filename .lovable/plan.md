

# Atomic UI/UX Overhaul + Music Fix + Loading Screen Replacement

## Diagnosis Summary

**What's broken:**
1. **LoadingScreen** — still references the old uploaded photo and "TLC's Hybrid" branding. It's not actually used anywhere in `App.tsx` or `main.tsx` (never imported), so it's dead code but still exists.
2. **Music doesn't play** — The YouTube iframe approach relies on `postMessage` to control playback via the YouTube IFrame API. However, the iframe is rendered with `enablejsapi=1` but never loads the YouTube IFrame Player API script (`https://www.youtube.com/iframe_api`). The `postMessage` JSON format used is incorrect — YouTube's IFrame API expects the iframe to be initialized through the API, not via raw postMessage. The iframe also gets re-created on every state change (since `embedSrc` changes when `isPlaying` toggles, causing React to unmount/remount the iframe).
3. **Old uploaded photo** — Still referenced in `Auth.tsx`, `NotFound.tsx`, and `LoadingScreen.tsx`.
4. **Settings page** — Works fine (verified code), but the music section only appears after login (Settings redirects to `/auth` if not logged in).

## Plan

### Phase 1: Fix Music System (Critical)
**Problem**: The MusicProvider creates a hidden YouTube iframe and tries to control it via `postMessage`, but the YouTube IFrame Player API is never loaded. The iframe src also changes on play/pause, causing remounts.

**Fix**:
- Rewrite `MusicProvider.tsx` to use the **YouTube IFrame Player API** properly:
  - Load the `https://www.youtube.com/iframe_api` script dynamically
  - Create the player via `new YT.Player()` with event handlers
  - Use `player.playVideo()`, `player.pauseVideo()`, `player.setVolume()` directly instead of postMessage
  - Keep iframe stable (don't change src on play/pause)
  - Store player ref and only create once

### Phase 2: Full Persistent Mini-Player Bar
**Current**: Tiny 2-button floating control in bottom-right corner.

**Upgrade to**: A full-width mini-player bar fixed above MobileNav with:
- Play/Pause button with animated equalizer bars when playing
- Track name display (or "I Got The Power" default)
- Volume slider (collapsible)
- On/Off toggle switch
- Source indicator (YouTube icon)
- Positioned `bottom-14` on mobile (above nav), `bottom-0` on desktop

Rewrite `MusicControl.tsx` as a proper bar component.

### Phase 3: Replace Loading Screen
**Current**: Dead component with old branding and uploaded photo.

**Replace with**: A brutalist, on-brand loading screen used during auth initialization:
- Black background with the Zap icon logo (matching Index page)
- "I GOT THE POWA" text
- Animated progress bar using category colors cycling through
- "Loading..." in mono uppercase
- Wire it into `App.tsx` — show while `AuthProvider.loading` is true

### Phase 4: Remove Old Uploaded Photo References
- `Auth.tsx` line 10: Replace `const logo = '/lovable-uploads/...'` with the Zap icon component (consistent with Index/Dashboard)
- `NotFound.tsx` lines 17-22: Replace img with Zap icon in purple box
- Delete or fully rewrite `LoadingScreen.tsx`

### Phase 5: Landing Page Redesign
**Current issues**: Functional but static. The progression paths and calendar preview are hardcoded and non-interactive.

**Upgrades**:
- Add animated entrance transitions using CSS keyframes (already defined in index.css)
- Make the feature grid cards interactive with hover color fills matching category
- Add a "Now Playing" indicator if music is active (visible on landing too)
- Improve the CTA section with more visual weight
- Add a "scroll down" indicator between hero and paths section
- Make progression path steps animate in sequentially on scroll

### Phase 6: Colorful Brutalist Evolution Across All Pages

**Dashboard**:
- Stats cards: Add subtle pulse animation on streak when active
- Category grid: Add exercise count per category from DB
- Quick actions: Add gradient color fills on hover instead of solid

**Library**:
- Exercise cards: Larger thumbnails, better fallback with category-colored gradient backgrounds instead of plain gray
- Search: Add live result count feedback

**Auth page**:
- Replace the logo img with Zap icon
- Add category color accents to the left panel stats

**AI Lab**:
- Apply brutalist card styling to chat bubbles (borders instead of rounded)
- Message input: brutalist border treatment

**Settings**:
- Add the music section visual polish (playing indicator)

**All pages**:
- Consistent header treatment with category accent strip

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/providers/MusicProvider.tsx` | Rewrite with YouTube IFrame Player API |
| `src/components/Music/MusicControl.tsx` | Full mini-player bar |
| `src/components/LoadingScreen.tsx` | Complete rewrite with brutalist splash |
| `src/App.tsx` | Add loading screen during auth init |
| `src/pages/Auth.tsx` | Remove uploaded photo, use Zap icon |
| `src/pages/NotFound.tsx` | Remove uploaded photo, use Zap icon |
| `src/pages/Index.tsx` | Enhanced animations and interactions |
| `src/pages/Dashboard.tsx` | Category counts, animation polish |
| `src/pages/Library.tsx` | Better card fallbacks, search UX |
| `src/pages/AILab.tsx` | Brutalist chat styling |
| `src/components/AILab/AILabChat.tsx` | Brutalist message bubbles |

## Technical Notes

- **YouTube IFrame API** requires a global `onYouTubeIframeAPIReady` callback. The provider will set this up and create the player instance once.
- The player div needs to be visible in DOM (not `display:none`) — use `position:absolute; width:0; height:0; overflow:hidden` instead of `className="hidden"`.
- No new dependencies needed — the YouTube API is loaded via script tag.
- Music state persists in localStorage + profiles table (already working).


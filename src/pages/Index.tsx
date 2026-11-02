import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Dumbbell, Headphones, Library, MapPin, Play, Target, Volume2, VolumeX, Zap, Crown, Video } from 'lucide-react';
import { useMusic, POWER_ANTHEM_VIDEO_ID } from '@/providers/MusicProvider';
import { InstallPowerApp } from '@/components/InstallPowerApp';

/**
 * An original TLC cartoon mascot and black/gold entrance. No unverifiable personal photograph.
 * The third-party official music video is embedded IN the page, not a floating player.
 */
export default function Index() {
  const navigate = useNavigate();
  const { playIntroAnthem, playbackError, isPlaying, playerVisible, togglePlay, dismissPlayer } = useMusic();
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('power-intro-sound') !== 'off');
  const [requested, setRequested] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('power-music-inline-target', {
      detail: document.getElementById('power-inline-youtube'),
    }));
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(frame);
      window.dispatchEvent(new CustomEvent('power-music-inline-target', { detail: null }));
    };
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem('power-intro-sound', next ? 'on' : 'off');
    if (!next && playerVisible) dismissPlayer();
  }
  function startAnthem() {
    setRequested(true);
    setSoundOn(true);
    localStorage.setItem('power-intro-sound', 'on');
    playIntroAnthem();
  }
  function enter(path: string) {
    // Initiated from a user tap: browser may allow playback, but never silently claim success.
    if (soundOn && !playerVisible) startAnthem();
    navigate(path);
  }

  return (
    <main className="power-entry power-entry-gold" aria-label="I Got the Power opening experience">
      <div className="power-entry-frame" aria-hidden="true">
        <span className="power-entry-rail power-entry-rail-one" />
        <span className="power-entry-rail power-entry-rail-two" />
        <span className="power-entry-cross power-entry-cross-top">+</span>
        <span className="power-entry-cross power-entry-cross-bottom">+</span>
      </div>

      <div className={`power-entry-content ${visible ? 'is-visible' : ''}`}>
        <header className="power-entry-top">
          <div className="power-entry-brand">
            <span className="power-entry-brandmark" aria-hidden="true"><Zap size={22} fill="currentColor"/></span>
            <span className="power-entry-brand-text"><strong>POWER</strong><small>CALISTHENICS TRAINING / TLC</small></span>
          </div>
          <div className="power-entry-top-actions">
            <InstallPowerApp compact />
            <button type="button" aria-pressed={soundOn} onClick={toggleSound}
              className="power-entry-audio-switch" aria-label={soundOn ? 'Turn intro music off' : 'Turn intro music on'}>
              {soundOn ? <Volume2 size={17}/> : <VolumeX size={17}/>}
              <span>{soundOn ? 'SOUND ON' : 'SOUND OFF'}</span>
            </button>
          </div>
        </header>

        <section className="power-entry-hero" aria-label="Master human strength">
          <div className="power-entry-hero-copy">
            <p className="power-entry-kicker"><span className="power-entry-live" aria-hidden="true" /> ENGINEERED HUMAN MOVEMENT <span className="power-entry-version">/ 001</span></p>
            <div className="power-entry-wordmark">
              <span className="power-entry-wordmark-top">I GOT THE</span>
              <h1>POWER<span className="power-entry-stop">.</span></h1>
            </div>
            <div className="power-entry-message">
              <span className="power-entry-message-bar" />
              <p>MASTER <strong>HUMAN STRENGTH.</strong></p>
              <p className="power-entry-message-alt">BUILD CONTROL. UNLOCK THE EXTRAORDINARY.</p>
            </div>
            <p className="power-entry-description">Train like the version of yourself you're becoming. Real calisthenics. Real progressions. Powered by TLC.</p>
            <button type="button" onClick={() => enter('/planner')} className="power-entry-primary">
              <span className="power-entry-primary-icon"><Play size={21} fill="currentColor"/></span>
              <span className="power-entry-primary-label"><strong>START WORKING OUT</strong><small>GO STRAIGHT TO TRAINING</small></span>
              <ArrowUpRight className="power-entry-primary-arrow" size={22} aria-hidden="true"/>
            </button>
            <div className="power-entry-quiet-options">
              <button type="button" onClick={() => enter('/build?skill=planche')}><Target size={17}/> Build by skill <ArrowRight size={15}/></button>
              <button type="button" onClick={() => enter('/library')}><Library size={17}/> Browse 215 exercises <ArrowRight size={15}/></button>
            </div>
          </div>

          <div className="power-entry-visual">
            <div className="power-entry-mascot-stage">
              <div className="power-entry-mascot-legend"><span>THE TLC ATHLETE</span><span>01 / CONCEPT</span></div>
              <img src="/power-mascot.svg" alt="Original black-and-gold cartoon athlete mascot, a concept character rather than a portrait of you" className="power-entry-mascot" decoding="async" fetchPriority="high" />
              <div className="power-entry-mascot-caption"><Crown size={15}/> STRENGTH IS BUILT. <span>NOT BORN.</span></div>
            </div>
          </div>
        </section>

        <section className="power-entry-paths" aria-label="Choose your training focus">
          <button type="button" className="power-entry-path" onClick={() => enter('/build?skill=planche')}>
            <span className="power-entry-path-index">01 / POWER</span>
            <span className="power-entry-path-title">SUPERHUMAN <strong>STRENGTH</strong></span>
            <span className="power-entry-path-desc">Planche & elite bodyweight progressions</span>
            <Zap className="power-entry-path-icon" size={22} aria-hidden="true"/>
          </button>
          <button type="button" className="power-entry-path" onClick={() => enter('/build?skill=handstand')}>
            <span className="power-entry-path-index">02 / MASTERY</span>
            <span className="power-entry-path-title">MASTER <strong>HUMAN STRENGTH</strong></span>
            <span className="power-entry-path-desc">Handstands, balance & body control</span>
            <Crown className="power-entry-path-icon" size={22} aria-hidden="true"/>
          </button>
        </section>

        <section className="power-entry-music-panel" aria-label="Embedded POWER soundtrack">
          <div className="power-entry-music-details">
            <div className="power-entry-music-meta">
              <span className="power-entry-small-label">OFFICIAL SONG / EMBEDDED VIDEO</span>
              <h2 className="power-entry-track">SNAP! — THE POWER</h2>
              <p className="power-entry-track-status" aria-live="polite">
                {playbackError || (isPlaying ? 'Now playing through the official YouTube embed.' : requested ? 'If sound is blocked, tap Play in the embedded video.' : 'Tap below to play the anthem. Audio needs a gesture on most phones.')}
              </p>
            </div>
            <div className="power-entry-music-actions">
              <button type="button" className="power-entry-soundtrack-icon" onClick={() => {
                if (isPlaying) togglePlay(); else startAnthem();
              }} aria-label={isPlaying ? 'Pause I Got the Power anthem' : 'Play I Got the Power anthem'}>
                {isPlaying ? <Headphones size={18}/> : <Play size={18} fill="currentColor"/>}
                <span>{isPlaying ? 'PAUSE ANTHEM' : 'PLAY ANTHEM'}</span>
              </button>
              {playerVisible && <button type="button" className="power-entry-music-stop" onClick={dismissPlayer}>Stop / Close</button>}
            </div>
            <p className="power-entry-music-note">The original commercial song is not copied or hidden as background audio. YouTube requires visible playback; the integrated player appears right here.</p>
            <p className="power-entry-music-source">Playback courtesy of <a href={`https://www.youtube.com/watch?v=${POWER_ANTHEM_VIDEO_ID}`} target="_blank" rel="noopener noreferrer">the official YouTube source</a>.</p>
          </div>
          <div className="power-entry-inline-youtube" id="power-inline-youtube">
            {!playerVisible && <div className="power-entry-audio-placeholder"><Video size={30}/><span>IN-APP VIDEO PLAYER</span><small>Press Play Anthem to start</small></div>}
          </div>
        </section>

        <footer className="power-entry-footer">
          <div className="power-entry-footer-links">
            <button type="button" onClick={() => navigate('/library')}><Dumbbell size={16}/> Exercises</button>
            <button type="button" onClick={() => navigate('/build')}><Target size={16}/> Skill Tree</button>
            <button type="button" onClick={() => navigate('/dashboard')}><MapPin size={16}/> More</button>
          </div>
          <p className="power-entry-powered">POWERED BY <strong>TLC</strong><span className="power-entry-powered-dot">.</span></p>
        </footer>
      </div>
    </main>
  );
}

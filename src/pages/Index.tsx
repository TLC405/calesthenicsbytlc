import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Dumbbell, Headphones, Library, MoveUpRight, Play, Target, Volume2, VolumeX, Zap } from 'lucide-react';
import { useMusic, POWER_ANTHEM_VIDEO_ID } from '@/providers/MusicProvider';
import { InstallPowerApp } from '@/components/InstallPowerApp';

/**
 * POWER's opening stage. The official SNAP! video stays on YouTube.
 * Sound starts from a real tap where the browser permits it; never bundle/copy the track.
 */
export default function Index() {
  const navigate = useNavigate();
  const { playIntroAnthem, playbackError, isPlaying, togglePlay } = useMusic();
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('power-intro-sound') !== 'off');
  const [musicRequested, setMusicRequested] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem('power-intro-sound', next ? 'on' : 'off');
    if (!next && isPlaying) togglePlay();
  }
  function startAnthem() {
    setMusicRequested(true);
    playIntroAnthem();
  }
  function enter(path: string) {
    if (soundOn && !isPlaying) startAnthem();
    if (!soundOn && isPlaying) togglePlay();
    navigate(path);
  }

  return (
    <main className="power-entry" aria-label="I Got the Power opening experience">
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
            <span className="power-entry-brand-text"><strong>POWER</strong><small>TRAINING SYSTEM / TLC</small></span>
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
            <p className="power-entry-description">Real calisthenics. Real progressions. Your next rep starts here.</p>
            <button type="button" onClick={() => enter('/planner')}
              className="power-entry-primary">
              <span className="power-entry-primary-icon"><Play size={21} fill="currentColor"/></span>
              <span className="power-entry-primary-label"><strong>START WORKING OUT</strong><small>GO STRAIGHT TO TRAINING</small></span>
              <ArrowUpRight className="power-entry-primary-arrow" size={22} aria-hidden="true"/>
            </button>
            <div className="power-entry-quiet-options">
              <button type="button" onClick={() => enter('/build?skill=planche')}><Target size={17}/> Build by skill <ArrowRight size={15}/></button>
              <button type="button" onClick={() => enter('/library')}><Library size={17}/> Browse 215 exercises <ArrowRight size={15}/></button>
            </div>
          </div>

          <div className="power-entry-visual" aria-hidden="true">
            <div className="power-entry-instrument">
              <span className="power-entry-instrument-title">HUMAN / POTENTIAL</span>
              <div className="power-entry-orbit power-entry-orbit-outer" />
              <div className="power-entry-orbit power-entry-orbit-inner" />
              <div className="power-entry-instrument-axis power-entry-instrument-axis-x" />
              <div className="power-entry-instrument-axis power-entry-instrument-axis-y" />
              <div className="power-entry-instrument-core">
                <Dumbbell className="power-entry-instrument-icon" strokeWidth={1.4} />
              </div>
              <span className="power-entry-instrument-detail power-entry-detail-top">STRENGTH / CONTROL</span>
              <span className="power-entry-instrument-detail power-entry-detail-bottom">BODYWEIGHT / TRAINING</span>
              <div className="power-entry-signal"><span/><span/><span/><span/><span/><span/><span/><span/><span/></div>
            </div>
          </div>
        </section>

        <section className="power-entry-paths" aria-label="Pick your training focus">
          <button type="button" className="power-entry-path" onClick={() => enter('/build?skill=planche')}>
            <span className="power-entry-path-index">01 / STRENGTH</span>
            <span className="power-entry-path-title">SUPERHUMAN <strong>STRENGTH</strong></span>
            <span className="power-entry-path-desc">Planche & advanced bodyweight skills</span>
            <MoveUpRight className="power-entry-path-icon" size={22} aria-hidden="true"/>
          </button>
          <button type="button" className="power-entry-path" onClick={() => enter('/build?skill=handstand')}>
            <span className="power-entry-path-index">02 / MASTERY</span>
            <span className="power-entry-path-title">MASTER <strong>HUMAN STRENGTH</strong></span>
            <span className="power-entry-path-desc">Handstands, balance & control</span>
            <MoveUpRight className="power-entry-path-icon" size={22} aria-hidden="true"/>
          </button>
        </section>

        <footer className="power-entry-footer">
          <div className="power-entry-soundtrack">
            <button type="button" onClick={() => {
              if (isPlaying) togglePlay();
              else { setSoundOn(true); localStorage.setItem('power-intro-sound', 'on'); startAnthem(); }
            }} className="power-entry-soundtrack-icon"
              aria-label={isPlaying ? 'Pause I Got the Power anthem' : 'Play I Got the Power anthem'}>
              {isPlaying ? <Headphones size={19}/> : <Play size={18} fill="currentColor"/>}
            </button>
            <div className="power-entry-soundtrack-copy">
              <span className="power-entry-small-label">INTRO SOUNDTRACK / OFFICIAL YOUTUBE VIDEO</span>
              <span className="power-entry-track">SNAP! — THE POWER</span>
              <span className="power-entry-track-status" aria-live="polite">
                {playbackError || (isPlaying ? 'Now playing in POWER' : musicRequested ? 'Starting… use the music controls if playback is blocked' : 'Tap play or enter with sound on')}
              </span>
            </div>
            <div className="power-entry-equalizer" aria-hidden="true"><i/><i/><i/><i/><i/></div>
          </div>
          <p className="power-entry-powered">POWERED BY <strong>TLC</strong><span className="power-entry-powered-dot">.</span></p>
        </footer>

        <p className="power-entry-legal">Embedded soundtrack: SNAP! — The Power. YouTube may restrict playback; sound usually requires a tap. <a href={`https://www.youtube.com/watch?v=${POWER_ANTHEM_VIDEO_ID}`} target="_blank" rel="noopener noreferrer">Official track <ArrowUpRight size={11} className="inline-block"/></a></p>
      </div>
    </main>
  );
}

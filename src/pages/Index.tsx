import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { PowerAthleteArt } from '@/components/Brand/PowerAthleteArt';
import {
  ArrowRight, CircleDot, Hand, Dumbbell, Move, Shield, Sparkles,
  FileText, GitBranch, Zap
} from 'lucide-react';

const disciplines = [
  { name: 'Rings', search: 'rings', icon: CircleDot },
  { name: 'Handstand', search: 'handstand', icon: Hand },
  { name: 'Muscle-up', search: 'muscle-up', icon: Dumbbell },
  { name: 'Mobility', search: 'mobility', icon: Move },
  { name: 'Core', search: 'core', icon: Shield },
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);

  return (
    <div className="power-shell power-splash">
      <header className="power-topbar">
        <div className="power-container power-topinner">
          <div className="power-brand">
            <span className="power-mark">TLC</span>
            <span className="power-brand-line"/>
            <span className="power-brand-label">Performance system</span>
          </div>
          <button className="power-icon-button" onClick={() => navigate('/auth')} aria-label="Sign in">
            <span className="power-smallprint uppercase" style={{ color: '#E9BC68', fontWeight: 800 }}>Sign in</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      <main className="power-container power-splash-main">
        <section className="power-hero power-splash-hero" aria-labelledby="landing-title">
          <PowerAthleteArt/>
          <div className="power-hero-content">
            <p className="power-kicker">I got the power</p>
            <h1 id="landing-title" className="power-hero-title"><span>Build</span><span>Your</span><span>Power</span></h1>
            <p className="power-hero-copy">Calisthenics by TLC <span aria-hidden="true">·</span> Train <span aria-hidden="true">·</span> Master <span aria-hidden="true">·</span> Evolve</p>
            <div className="power-hero-actions">
              <button onClick={() => navigate('/auth')} className="power-button power-button-primary">
                Enter the system <ArrowRight size={19}/>
              </button>
              <button onClick={() => navigate('/library')} className="power-button power-button-outline">
                Explore skills <GitBranch size={17}/>
              </button>
            </div>
          </div>
        </section>

        <section className="power-rail" aria-label="Explore disciplines">
          <p className="power-rail-label">Master your movement</p>
          <div className="power-rail-grid">
            {disciplines.map(({ name, search, icon: Icon }) => (
              <button key={name} className="power-skill" onClick={() => navigate('/library', { state: { search } })} title={'Browse ' + name}>
                <span className="power-skill-icon"><Icon size={30} strokeWidth={1.6}/></span>
                <span className="power-skill-name">{name}</span>
                <span className="power-skill-underline" aria-hidden="true"/>
              </button>
            ))}
          </div>
        </section>

        <section className="power-main">
          <div className="power-section-heading"><h2>Inside the system</h2></div>
          <div className="power-feature-grid">
            <button className="power-feature" onClick={() => navigate('/auth')}>
              <FileText size={31} strokeWidth={1.6} className="power-feature-icon"/>
              <span className="power-feature-title">Build workouts</span>
              <span className="power-feature-desc">Your training, your way</span>
              <ArrowRight className="power-feature-arrow" size={16}/>
            </button>
            <button className="power-feature" onClick={() => navigate('/library')}>
              <Zap size={31} strokeWidth={1.6} className="power-feature-icon"/>
              <span className="power-feature-title">Skill paths</span>
              <span className="power-feature-desc">Explore progressions</span>
              <ArrowRight className="power-feature-arrow" size={16}/>
            </button>
            <button className="power-feature" onClick={() => navigate('/auth')}>
              <Sparkles size={31} strokeWidth={1.6} className="power-feature-icon"/>
              <span className="power-feature-title">AI coach</span>
              <span className="power-feature-desc">Plan with guidance</span>
              <ArrowRight className="power-feature-arrow" size={16}/>
            </button>
          </div>
          <div className="flex items-center justify-between py-4" style={{ borderTop: '1px solid rgba(233,188,104,.3)' }}>
            <span className="power-smallprint uppercase">Strong moves. Clear progress.</span>
            <span className="power-smallprint uppercase">Powered by TLC</span>
          </div>
        </section>
      </main>
    </div>
  );
}

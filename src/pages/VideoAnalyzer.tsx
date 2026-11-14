import { Link } from 'react-router-dom';
import { ArrowLeft, TvMinimal } from 'lucide-react';
import { SocialVideoAnalyzer } from '@/components/Media/SocialVideoAnalyzer';

export default function VideoAnalyzer(){
  return <main className="power-simple-page tlctv-analyzer-page max-w-5xl mx-auto">
    <header className="power-simple-heading">
      <div>
        <p className="power-simple-eyebrow"><TvMinimal size={16}/> TLCtv / SUPER HUMAN STRENGTH</p>
        <h1>Video Analysis Studio</h1>
        <p>Review exercise clips with a clear distinction between visual evidence and coaching suggestions.</p>
      </div>
      <Link to="/skills" className="tlc-analyzer-back"><ArrowLeft size={16}/>Strength skills</Link>
    </header>
    <SocialVideoAnalyzer/>
  </main>;
}

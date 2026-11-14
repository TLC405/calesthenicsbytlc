import { ArrowDownRight, ArrowRight, Check, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { movementModifications } from '@/lib/movementModifications';
import { MovementThumbnail } from './MovementThumbnail';
import { exerciseBySlug } from '@/lib/skillGraph';

export function MovementModifications({slug,onChoose}:{slug:string;onChoose?:(slug:string)=>void}){
  const plan=movementModifications(slug);
  if(plan.kind==='foundation')return null;
  return <details className="tlc-movement-modifications" aria-label="Easier movement options">
    <summary>
      <span className="tlc-modification-icon"><ArrowDownRight size={19}/></span>
      <span className="tlc-modification-heading">
        <strong>{plan.kind==='elite'?'Build toward this elite skill':'Can’t do this exercise yet?'}</strong>
        <small>{plan.kind==='elite'?'Review prerequisites before attempting':'Modified versions, support options and simpler setups'}</small>
      </span>
      <SlidersHorizontal size={17} className="tlc-modification-trailing" aria-hidden="true"/>
    </summary>
    <div className="tlc-modification-detail">
      <p className="tlc-modification-intro">{plan.kind==='elite'?
        'Elite progressions require specific strength and entry/exit skills. These foundation movements are not proof of readiness.':
        'Choose the version you can perform with control. Start easier and progress only after repeating comfortable, technically sound attempts.'}</p>
      {plan.options.length>0?<div className="tlc-modification-options">
        {plan.options.map(option=>{
          const alternative=option.slug?exerciseBySlug.get(option.slug):null;
          return <div className={'tlc-modification-option '+(alternative?'is-linked':'is-setup')} key={option.id}>
            {alternative&&<MovementThumbnail exercise={alternative} className="is-small"/>}
            <div className="tlc-modification-description">
              <span className="tlc-modification-kind">{alternative?'EXERCISE VARIATION':'SETUP MODIFICATION'}</span>
              <strong>{option.title}</strong>
              <p>{option.detail}</p>
            </div>
            {option.slug&&(onChoose?
              <button type="button" onClick={()=>onChoose(option.slug!)} aria-label={'View '+option.title+' instead'}><ArrowRight size={17}/><span>View</span></button>:
              <Link to="/library" state={{search:option.title}} aria-label={'Find '+option.title+' in the library'}><ArrowRight size={17}/><span>View</span></Link>
            )}
          </div>;
        })}
      </div>:<p className="tlc-modification-no-shortcut">There is no suitable direct catalog regression. Build the relevant foundational skills before attempting this movement.</p>}
      <p className="tlc-modification-caution"><ShieldAlert size={16}/>{plan.caution}</p>
      <p className="tlc-modification-small"><Check size={15}/> No preset workouts or automatic difficulty promotion.</p>
    </div>
  </details>;
}

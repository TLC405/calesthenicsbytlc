import { useLocation } from 'react-router-dom';
import FocusPlanner from './FocusPlanner';

/** Home is the working skill-based builder, including setup and session review. */
export default function Index(){
 const location=useLocation();
 return <FocusPlanner key={location.key} home/>;
}

import { Navigate, useLocation } from 'react-router-dom';
import SimpleHome from './SimpleHome';

/** Short, action-first landing page. Legacy workout query links keep working. */
export default function Index(){
 const {search}=useLocation();
 return search?<Navigate replace to={'/build'+search}/>:<SimpleHome/>;
}

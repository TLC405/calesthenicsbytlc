import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { shouldLaunchHome } from '@/lib/launchHome';
export function LaunchHome(){const checked=useRef(false);const navigate=useNavigate();const {pathname}=useLocation();useLayoutEffect(()=>{if(checked.current)return;checked.current=true;const standalone=window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone);if(shouldLaunchHome(standalone,pathname,true))navigate('/',{replace:true});},[pathname,navigate]);return null;}

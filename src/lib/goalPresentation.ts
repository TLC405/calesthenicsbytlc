import type { PowerDiscipline } from '../components/Brand/PowerDisciplineIcon';
export function goalDiscipline(id:string,group=''):PowerDiscipline{return /yoga/.test(id)?'yoga':/ballet/.test(id)?'ballet':/ring/.test(id)?'rings':/handstand|press|stalder|hspu/.test(id)?'handstand':/compression|core|l-sit/.test(id)?'core':/mobility|splits|pancake/.test(id)||group==='Mobility'?'mobility':'planche';}

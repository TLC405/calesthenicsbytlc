import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const css=await readFile('src/styles/theme-material-overhaul.css','utf8');
const app=await readFile('src/App.tsx','utf8');
const chooser=await readFile('src/components/ThemeSwitcher.tsx','utf8');
const skeuo=await readFile('src/styles/skeuomorphic-themes-v4.css','utf8');
const themes=[
  {id:'default',selector:':root:not([data-theme])'},
  {id:'vasa',selector:':root[data-theme="vasa"]'},
  {id:'planet-fitness',selector:':root[data-theme="planet-fitness"]'},
  {id:'ymca',selector:':root[data-theme="ymca"]'},
  {id:'okc-thunder',selector:':root[data-theme="okc-thunder"]'},
];
function themeBody(selector){
  const a=css.indexOf(selector);
  assert(a>=0,'Missing theme '+selector);
  const start=css.indexOf('{',a)+1, end=css.indexOf('}',start);
  assert(end>start,'Unclosed theme '+selector);
  return css.slice(start,end);
}
function hslToken(block,name){
  const value=block.match(new RegExp('--'+name+':\\s*(\\d+)\\s+(\\d+)%\\s+(\\d+)%\\s*;'));
  assert(value,'Missing HSL '+name);
  return value.slice(1).map(Number);
}
function luminosity([h,s,l]){
  s/=100;l/=100;
  const a=s*Math.min(l,1-l);
  const channel=n=>{
    const k=(n+h/30)%12;
    const v=l-a*Math.max(-1,Math.min(k-3,9-k,1));
    return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
  };
  return .2126*channel(0)+.7152*channel(8)+.0722*channel(4);
}
function ratio(x,y){
  const a=luminosity(x),b=luminosity(y);
  return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
const accentSets=new Set();
for(const theme of themes){
  const content=themeBody(theme.selector);
  const bg=hslToken(content,'background'),ink=hslToken(content,'foreground');
  const card=hslToken(content,'card'),sub=hslToken(content,'muted-foreground');
  const accent=hslToken(content,'primary'),buttonInk=hslToken(content,'primary-foreground');
  const results={body:ratio(bg,ink),card:ratio(card,ink),secondary:ratio(card,sub),action:ratio(accent,buttonInk)};
  for(const [part,contrast] of Object.entries(results)){
    assert(contrast>=4.5,theme.id+' '+part+' contrast too low: '+contrast.toFixed(2)+':1');
  }
  for(const variable of [
    'tlc-page','tlc-panel','tlc-panel-inset','tlc-panel-raised','tlc-ink','tlc-secondary-ink',
    'tlc-line','tlc-emphasis','tlc-alt','tlc-tertiary','tlc-control','tlc-shadow','tlc-panel-shadow'
  ])assert(content.includes('--'+variable+':'),theme.id+' missing '+variable);
  assert(chooser.includes("id: '"+theme.id+"'"),'Theme picker missing '+theme.id);
  accentSets.add(content.match(/--tlc-emphasis:([^;]+);/)[1]);
  console.log('THEME',theme.id,'contrast',Object.fromEntries(Object.entries(results).map(([k,v])=>[k,Number(v.toFixed(1))])));
}
assert.equal(accentSets.size,5,'Themes must not share one accent color');
for(const selector of ['.power-app-controls','.power-category-grid>button','.power-mobile-nav','.power-studio-node','.tlc-client-panel','.tlc-client-cta','.su-theme-option']){
  assert(css.includes(selector),'Theme-wide component treatment missing '+selector);
}
assert(css.includes('@media(max-width:420px)'), 'Narrow-screen visual coverage missing');
assert(css.includes('@media(prefers-reduced-motion:reduce)'), 'Reduced motion coverage missing');
assert(!css.includes('linear-gradient('),'Theme layer should not fall back to generic gradients');
assert(app.includes('import "./styles/theme-material-overhaul.css";'),'Overhaul not registered');
assert(app.indexOf('import "./styles/theme-material-overhaul.css";')>app.indexOf('import "./styles/mobile-dock-v3.css";'),'Final style layer must load after legacy overrides');
assert(app.includes('import "./styles/skeuomorphic-themes-v4.css";'),'Skeuomorphic layer not registered');
assert(app.indexOf('import "./styles/skeuomorphic-themes-v4.css";')>app.indexOf('import "./styles/theme-material-overhaul.css";'),'Skeuomorphic layer must load last');
assert(chooser.includes("name: 'Super Human · DBZ Light'"),'Signature theme name not updated');
assert(chooser.includes('Dragon Ball Z-inspired training'),'DBZ light picker preview not updated');
for(const theme of themes){
  assert(skeuo.includes(theme.selector),'Missing skeuomorphic material definition '+theme.id);
}
for(const token of ['tlc-material-top','tlc-material-bottom','tlc-material-rim','tlc-material-shadow','tlc-material-etch',
'tlc-face-accent','tlc-face-secondary','tlc-face-tertiary','tlc-dial-light','tlc-dial-dark']){
  assert(skeuo.split('--'+token+':').length>=6,'Missing five-theme skeuomorphic token '+token);
}
for(const selector of ['.power-app-controls','.power-category-grid>button','.power-mobile-nav',
'.power-view-tabs','.tlc-client-panel','.su-theme-option','.power-simple-heading','.tlctv-inline']){
  assert(skeuo.includes(selector),'Skeuomorphic UI coverage missing '+selector);
}
assert(skeuo.includes('linear-gradient('),'Layered physical material finish missing');
assert(skeuo.includes('@media(prefers-reduced-motion:reduce)'),'Missing reduced-motion preference');
assert(skeuo.includes('@media(max-width:420px)'),'Missing narrow-screen styles');
assert(themeBody(':root:not([data-theme])').includes('color-scheme:light'),'DBZ Signature must be light');

console.log('PASS: five material themes including light DBZ signature, physical depth, accessibility, multi-color controls, and stylesheet order.');

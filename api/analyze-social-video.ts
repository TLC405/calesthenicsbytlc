import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';

type Request = IncomingMessage & { body?: unknown };
type Payload = { url?: unknown; title?: unknown; notes?: unknown; exercise?: unknown; frames?: unknown };
const allowedHosts = ['youtube.com','youtu.be','instagram.com','tiktok.com','facebook.com','fb.watch','x.com','twitter.com','threads.net','vimeo.com','reddit.com'];
function platformUrl(value:unknown):string {
  if(typeof value!=='string'||!value.trim())return '';
  if(value.length>1500)throw Error('Video link is too long.');
  const u=new URL(value.trim());
  const host=u.hostname.toLowerCase().replace(/^(www\.|m\.|mobile\.)/,'');
  if(u.protocol!=='https:'||u.username||u.password||u.port||!allowedHosts.some(h=>host===h||host.endsWith('.'+h)))throw Error('Use a public HTTPS YouTube, TikTok, Instagram, Facebook, X, Vimeo, Threads or Reddit link.');
  u.hash='';return u.toString();
}
function reply(res:ServerResponse,status:number,payload:object){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.end(JSON.stringify(payload));
}
async function readJson(req:Request):Promise<Payload>{
  if(req.body!==undefined){
    const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);
    if(raw.length>1100000)throw Error('Request is too large.');
    return JSON.parse(raw);
  }
  let raw='';for await(const part of req){raw+=part.toString();if(raw.length>1100000)throw Error('Request is too large.');}
  return JSON.parse(raw);
}
export default async function handler(req:Request,res:ServerResponse) {
  const directKey=process.env.OPENAI_API_KEY;
  const headerToken=req.headers['x-vercel-oidc-token'];
  const gatewayKey=process.env.AI_GATEWAY_API_KEY||(typeof headerToken==='string'?headerToken:undefined)||process.env.VERCEL_OIDC_TOKEN;
  const configured=Boolean((directKey||gatewayKey)&&process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY);
  if(req.method==='GET')return reply(res,200,{configured,requiresSignIn:true,visualInput:'User-selected local video frames only',linkMode:'Transcript/caption-based analysis; no social video scraping'});
  if(req.method!=='POST')return reply(res,405,{error:'POST required'});
  if(!configured)return reply(res,503,{error:'AI video analysis is not connected to a provider yet. You can still preview and extract local frames.'});
  const authorization=req.headers.authorization;
  const token=typeof authorization==='string'&&authorization.startsWith('Bearer ')?authorization.slice(7):'';
  if(!token||token.length>5000)return reply(res,401,{error:'Sign in to run an AI analysis.'});
  let body:Payload;
  try{body=await readJson(req);}catch{return reply(res,400,{error:'Invalid video analysis request.'});}
  let url='';
  try{url=platformUrl(body.url);}catch(e){return reply(res,400,{error:e instanceof Error?e.message:'Invalid video URL'});}
  const title=typeof body.title==='string'?body.title.trim().slice(0,140):'';
  const notes=typeof body.notes==='string'?body.notes.trim().slice(0,3500):'';
  const exercise=typeof body.exercise==='string'?body.exercise.trim().slice(0,110):'';
  const frames=Array.isArray(body.frames)?body.frames:[];
  if(frames.length>4||frames.some(f=>typeof f!=='string'||f.length>220000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(f)))return reply(res,400,{error:'Use up to four small JPEG frames from a local video.'});
  if(!frames.length&&notes.length<25)return reply(res,400,{error:'Select a local video to inspect frames or supply at least 25 characters of caption/transcript.'});
  try{
    const supabase=createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_PUBLISHABLE_KEY!,{
      auth:{persistSession:false,autoRefreshToken:false},
      global:{headers:{Authorization:`Bearer ${token}`}},
    });
    const {data,error}=await supabase.auth.getUser(token);
    if(error||!data.user)return reply(res,401,{error:'Please sign in again.'});
    const {data:allowed,error:quotaError}=await supabase.rpc('consume_ai_request');
    if(quotaError){console.error('Video analyzer quota unavailable:',quotaError.code);return reply(res,503,{error:'AI usage quota is currently unavailable.'});}
    if(!allowed)return reply(res,429,{error:'Daily AI limit reached. Try again tomorrow.'});

    const sourceBasis=frames.length?(notes?'sampled-frames-and-user-text':'sampled-frames'):'user-text-only';
    const prompt=`Source: ${sourceBasis}. Exercise focus: ${exercise||'infer cautiously'}. Video title: ${title||'Untitled'}. Social link (metadata only; DO NOT pretend to browse): ${url||'Not supplied'}. User-supplied transcript/caption/notes:\n${notes||'(none)'}\nFor images, frames are sampled at different moments and may not show the full motion. Do not claim to have watched the whole video or heard audio. Give direct, practical calisthenics coaching observations grounded only in visible sampled frames or the supplied text. If the evidence is too weak, say so plainly.`;
    const userContent:Array<Record<string,unknown>>=[{type:'text',text:prompt},...frames.map(frame=>({type:'image_url',image_url:{url:frame,detail:'low'}}))];
    const response=await fetch(directKey?'https://api.openai.com/v1/chat/completions':'https://ai-gateway.vercel.sh/v1/chat/completions',{
      method:'POST',signal:AbortSignal.timeout(45000),
      headers:{Authorization:`Bearer ${directKey||gatewayKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        model:directKey?(process.env.OPENAI_VISION_MODEL||'gpt-4o-mini'):(process.env.AI_GATEWAY_VISION_MODEL||'openai/gpt-4o-mini'),
        store:false,max_tokens:1450,
        messages:[
          {role:'system',content:'You are TLCtv Technique Analyst for TLC\'s Super Human Strength. Analyze only user-provided short frame samples and/or supplied transcript text. Never say you viewed a social-media URL directly. Videos are not retrieved, downloaded, transcribed, or watched via their URLs. Use sport-science-informed, restrained observations for calisthenics skills including handstands, presses, planche, flags, grip and mobility. Do not infer joint angles, medical issues, or competence from inadequate frames. Do not diagnose pain or give medical clearance. Distinguish what the evidence shows from possible technique suggestions; avoid invented timestamps, creators, endorsements or studies. No gamification, no automatic workouts, no claims that the result establishes the athlete\'s level. Max three items per array; use empty arrays if no evidence. Confidence high requires direct, clearly visible evidence, and sampled frames alone rarely justify it.'},
          {role:'user',content:userContent},
        ],
        response_format:{type:'json_schema',json_schema:{name:'tlctv_video_review',strict:true,schema:{
          type:'object',additionalProperties:false,properties:{
            skill:{type:'string'},summary:{type:'string'},
            observations:{type:'array',items:{type:'string'}},
            techniqueCues:{type:'array',items:{type:'string'}},
            suggestedProgressions:{type:'array',items:{type:'string'}},
            safetyConsiderations:{type:'array',items:{type:'string'}},
            evidenceLimits:{type:'string'},
            confidence:{type:'string',enum:['low','medium','high']}
          },required:['skill','summary','observations','techniqueCues','suggestedProgressions','safetyConsiderations','evidenceLimits','confidence']
        }}},
      })
    });
    if(!response.ok){console.error('Video AI provider status',response.status);return reply(res,response.status===429?429:502,{error:response.status===429?'AI is busy. Try again.':'AI video analyzer is currently unavailable.'});}
    const result=await response.json() as {choices?:Array<{message?:{content?:string}}>};
    const raw=JSON.parse(result.choices?.[0]?.message?.content||'{}');
    const safeString=(v:unknown,n:number)=>typeof v==='string'?v.slice(0,n):'';
    const safeList=(v:unknown)=>Array.isArray(v)?v.filter(x=>typeof x==='string').slice(0,3).map(x=>(x as string).slice(0,260)):[];
    if(!safeString(raw.summary,1000))throw Error('Empty structured result');
    return reply(res,200,{sourceBasis,confidence:['low','medium','high'].includes(raw.confidence)?raw.confidence:'low',
      skill:safeString(raw.skill,120),summary:safeString(raw.summary,850),observations:safeList(raw.observations),
      techniqueCues:safeList(raw.techniqueCues),suggestedProgressions:safeList(raw.suggestedProgressions),
      safetyConsiderations:safeList(raw.safetyConsiderations),evidenceLimits:safeString(raw.evidenceLimits,650),
      at:new Date().toISOString(),provider:'ai'});
  }catch(err){console.error('Video analyzer failed',err instanceof Error?err.name:'Unknown');return reply(res,502,{error:'The analysis could not finish. Please retry.'});}
}

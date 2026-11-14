import type { IncomingMessage, ServerResponse } from 'node:http';

type Request = IncomingMessage & {query?:Record<string,string|string[]|undefined>};
type RecordLite={id?:unknown;source?:unknown;title?:unknown;authorString?:unknown;pubYear?:unknown;journalTitle?:unknown;doi?:unknown;pmid?:unknown;pmcid?:unknown;isOpenAccess?:unknown;pubTypeList?:unknown};
const clip=(value:unknown,n:number)=>typeof value==='string'?value.replace(/[<>]/g,'').trim().slice(0,n):'';
function send(res:ServerResponse,status:number,data:object){
 res.statusCode=status;
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Cache-Control',status===200?'public, s-maxage=300, stale-while-revalidate=300':'no-store');
 res.end(JSON.stringify(data));
}
export default async function handler(req:Request,res:ServerResponse){
 if(req.method!=='GET')return send(res,405,{error:'GET required'});
 const q=Array.isArray(req.query?.q)?'':clip(req.query?.q,140);
 const sort=req.query?.sort==='recent'?'recent':'relevance';
 if(q.length<3)return send(res,400,{error:'Enter at least three characters to search research.'});
 if(/[\u0000-\u001F]/.test(q))return send(res,400,{error:'Invalid search text.'});
 const params=new URLSearchParams({query:q,format:'json',pageSize:'8',resultType:'lite'});
 if(sort==='recent')params.set('sort','FIRST_PDATE_D desc');
 const endpoint='https://www.ebi.ac.uk/europepmc/webservices/rest/search?'+params.toString();
 try{
  const result=await fetch(endpoint,{signal:AbortSignal.timeout(12000),headers:{Accept:'application/json'}});
  if(!result.ok)return send(res,502,{error:'The research index is temporarily unavailable.'});
  const raw=await result.json() as {resultList?:{result?:RecordLite[]};hitCount?:number};
  const articles=(raw.resultList?.result||[]).slice(0,8).map(row=>{
   const source=clip(row.source,16),id=clip(row.id,80),pmid=clip(row.pmid,20),pmcid=clip(row.pmcid,24),doi=clip(row.doi,130);
   const url=pmid&&/^\d+$/.test(pmid)?'https://pubmed.ncbi.nlm.nih.gov/'+pmid+'/':
    pmcid&&/^PMC\d+$/i.test(pmcid)?'https://europepmc.org/articles/'+pmcid:
    source&&id?'https://europepmc.org/article/'+encodeURIComponent(source)+'/'+encodeURIComponent(id):'';
   return {
    id:source+':'+id,title:clip(row.title,300),authors:clip(row.authorString,230),
    year:clip(row.pubYear,4),journal:clip(row.journalTitle,150),
    doi,pmid,isOpenAccess:row.isOpenAccess==='Y',url
   };
  }).filter(a=>a.title&&a.url);
  return send(res,200,{query:q,sort,retrievedAt:new Date().toISOString(),count:Math.min(Number(raw.hitCount)||0,100000),articles,source:'Europe PMC'});
 }catch(e){
  console.error('Evidence lookup failed',e instanceof Error?e.name:'Unknown');
  return send(res,502,{error:'Research lookup could not connect. Try again.'});
 }
}

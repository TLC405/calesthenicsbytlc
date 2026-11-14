import { useEffect, useState } from 'react';
import { ClipboardCopy, ClipboardPaste, NotebookPen, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Entry={id:string;focus:string;body:string;at:string};
function read(owner:string):Entry[]{
 try{const r=JSON.parse(localStorage.getItem('tlc-chatgpt-replies-v1:'+owner)||'[]');
 return Array.isArray(r)?r.slice(0,20).filter((x):x is Entry=>Boolean(x&&typeof x.id==='string'&&typeof x.focus==='string'&&typeof x.body==='string'&&typeof x.at==='string')):[];}
 catch{return[];}
}
export function ChatGPTJournal({owner,focus}:{owner:string;focus:string}){
 const [text,setText]=useState('');const [rows,setRows]=useState<Entry[]>(()=>read(owner));const [open,setOpen]=useState(false);
 useEffect(()=>{setRows(read(owner));setText('');},[owner]);
 function persist(next:Entry[]){
  try{localStorage.setItem('tlc-chatgpt-replies-v1:'+owner,JSON.stringify(next));setRows(next);return true;}
  catch{toast.error('This device could not save the ChatGPT note.');return false;}
 }
 function save(){
  if(text.trim().length<12){toast.error('Paste at least a short answer before saving.');return;}
  const next:Entry={id:crypto.randomUUID(),focus,body:text.trim().slice(0,6000),at:new Date().toISOString()};
  if(persist([next,...rows].slice(0,20))){setText('');toast.success('ChatGPT answer saved privately on this device.');}
 }
 async function copy(entry:Entry){
  try{await navigator.clipboard.writeText(entry.body);toast.success('Saved answer copied.');}catch{toast.error('Clipboard unavailable.');}
 }
 return <section className="tlc-chatgpt-journal" aria-label="ChatGPT reply journal">
  <div className="tlc-integration-titleline"><span className="tlc-integration-symbol"><NotebookPen size={21}/></span><div><p className="tlc-integration-kicker">04 / TAKE YOUR INSIGHTS BACK</p><h2>My ChatGPT Notes</h2></div></div>
  <p className="tlc-integration-copy">After ChatGPT replies, paste the answer here to keep useful coaching guidance beside your own training records. Notes stay on this device. Nothing gets added to a workout automatically.</p>
  <label className="tlc-integration-field">Paste a ChatGPT answer
   <textarea value={text} maxLength={6000} rows={5} placeholder="Paste the explanation, technique notes, or progression suggestions from your ChatGPT conversation…" onChange={e=>setText(e.target.value)}/>
  </label>
  <div className="tlc-chatgpt-journal-actions">
   <button className="is-primary" type="button" disabled={text.trim().length<12} onClick={save}><Save size={16}/> Save note</button>
   <button type="button" onClick={()=>setOpen(v=>!v)}><ClipboardPaste size={16}/> {open?'Hide notes':'My notes'} ({rows.length})</button>
  </div>
  {open&&<div className="tlc-chatgpt-journal-list">
   {rows.length===0&&<p>No notes saved yet.</p>}
   {rows.map(entry=><article key={entry.id}>
    <header><span>{entry.focus.replaceAll('-',' ')} · {new Date(entry.at).toLocaleDateString()}</span><div><button type="button" aria-label="Copy saved note" onClick={()=>void copy(entry)}><ClipboardCopy size={16}/></button><button type="button" aria-label="Delete saved note" onClick={()=>persist(rows.filter(x=>x.id!==entry.id))}><Trash2 size={16}/></button></div></header>
    <p>{entry.body}</p>
   </article>)}
  </div>}
 </section>;
}

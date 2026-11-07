"""Read-only public-provider audit. Never equates a thumbnail or title with playback."""
import sys,concurrent.futures,datetime,json,re,urllib.parse,urllib.request,urllib.error,hashlib,io
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
rows=json.loads(Path('/tmp/power-media-sweep-input.json').read_text())
old=json.loads((ROOT/'src/data/videoAudit.json').read_text())
previous={v['videoId']:v for v in old['videos'] if v.get('videoId')}
checked=datetime.datetime.now(datetime.timezone.utc).isoformat()
def vid(url):
 if not url:return None
 m=re.search(r'(?:[?&]v=|youtu.be/|/embed/|/shorts/)([A-Za-z0-9_-]{11})(?:[?&#/]|$)',url)
 return m.group(1)if m else None
urls={}
for e in rows:
 for url in [e.get('youtube_url')]+[s['url'] for s in e['candidates']]:
  ident=vid(url)
  if ident:urls[ident]='https://www.youtube.com/watch?v='+ident

def inspect(pair):
 ident,url=pair
 if '--reuse-recent' in sys.argv and ident in previous and previous[ident].get('availability')!='unchecked':return previous[ident]
 r={'videoId':ident,'url':url,'checkedAt':checked,'availability':'unchecked','playback':'not_tested','movement':'not_reviewed','thumbnail':'not_checked'}
 endpoint='https://www.youtube.com/oembed?url='+urllib.parse.quote(url,safe='')+'&format=json'
 try:
  req=urllib.request.Request(endpoint,headers={'User-Agent':'POWER-Media-Audit/2.0'})
  with urllib.request.urlopen(req,timeout=8)as response:meta=json.load(response)
  r.update(availability='reachable',httpStatus=200,title=meta.get('title','')[:200],creator=meta.get('author_name','')[:160],creatorUrl=meta.get('author_url',''),embedOffered=bool(meta.get('html')))
 except urllib.error.HTTPError as error:
  r.update(httpStatus=error.code,availability='unavailable'if error.code in(404,410)else'unchecked')
 except Exception as error:r['note']='Metadata check incomplete: '+type(error).__name__
 if r['availability']=='unchecked'and ident in previous:
  r['lastKnownAvailability']=previous[ident].get('availability');r['lastKnownCheckedAt']=previous[ident].get('checkedAt');r['title']=previous[ident].get('title','');r['creator']=previous[ident].get('creator','')
 local=ROOT/'public/movement-previews'/f'{ident}.jpg'
 try:
  raw=local.read_bytes()if local.exists()else urllib.request.urlopen('https://i.ytimg.com/vi/'+ident+'/hqdefault.jpg',timeout=8).read()
  with Image.open(io.BytesIO(raw))as image:w,h=image.size
  r.update(thumbnail='available'if w>120 and h>90 else'placeholder',thumbnailWidth=w,thumbnailHeight=h,thumbnailLocation='bundled'if local.exists()else'provider')
 except Exception:r['thumbnail']='unavailable'
 return r
with concurrent.futures.ThreadPoolExecutor(max_workers=10)as pool:records=list(pool.map(inspect,urls.items()))
# Preserve mapping review signals; reachability is a separate fact.
oldEntries={e['slug']:e for e in old['exercises']}
lookup={r['videoId']:r for r in records}
entries=[]
for e in rows:
 entry=dict(oldEntries.get(e['slug'],{}));entry.update(slug=e['slug'],name=e['name'],url=e.get('youtube_url'),availability=lookup.get(vid(e.get('youtube_url')),{}).get('availability','missing'));entries.append(entry)
result={'checkedAt':checked,'method':'All catalog links and eligible fallback sources checked against public YouTube oEmbed; bundled/provider thumbnail dimensions checked. Actual playback and movement identity remain separate.','videos':records,'exercises':entries}
(ROOT/'src/data/videoAudit.json').write_text(json.dumps(result,indent=2)+'\n')
summary={k:sum(r['availability']==k for r in records)for k in['reachable','unavailable','unchecked']}
print(json.dumps({'catalogRecords':len(rows),'uniqueVideos':len(records),'results':summary}))

"""Audit canonical YouTube mappings without claiming playback or movement verification.

Uses YouTube's public oEmbed endpoint and provider thumbnails. A title match is
only a review signal; actual playback and variation identity need human review.
"""
import concurrent.futures
import datetime
import io
import json
from pathlib import Path
import re
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CATALOG = json.loads((ROOT / 'src/data/publicExerciseCatalog.json').read_text())
CHECKED_AT = datetime.datetime.now(datetime.timezone.utc).isoformat()
CACHE_PATH = ROOT / 'src/data/videoAudit.json'
try:
    previous = json.loads(CACHE_PATH.read_text())
    age = datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat(previous['checkedAt'])
    CACHE = {r['url']:r for r in previous['videos']} if age.total_seconds() < 86400 else {}
except (ValueError, KeyError, OSError):
    CACHE = {}

def video_id(url):
    if not url:
        return None
    parsed = urllib.parse.urlparse(url)
    host = parsed.hostname or ''
    if host == 'youtu.be':
        candidate = parsed.path.strip('/').split('/')[0]
    elif host.removeprefix('www.') in ('youtube.com', 'youtube-nocookie.com'):
        candidate = urllib.parse.parse_qs(parsed.query).get('v', [None])[0]
        if not candidate and re.match(r'^/(embed|shorts|live)/', parsed.path):
            candidate = parsed.path.split('/')[2]
    else:
        return None
    return candidate if candidate and re.fullmatch(r'[A-Za-z0-9_-]{11}', candidate) else None

def request(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'POWER-Media-Audit/1.0'})
    with urllib.request.urlopen(req, timeout=15) as response:
        return response.status, response.read()

def inspect(pair):
    url, vid = pair
    if url in CACHE:
        return CACHE[url]
    result = dict(url=url, videoId=vid, checkedAt=CHECKED_AT,
                  availability='invalid' if not vid else 'unchecked',
                  playback='not_tested', movement='not_reviewed',
                  thumbnail='not_checked')
    if not vid:
        return result
    endpoint = 'https://www.youtube.com/oembed?url=' + urllib.parse.quote('https://www.youtube.com/watch?v=' + vid, safe='') + '&format=json'
    try:
        code, raw = request(endpoint)
        meta = json.loads(raw)
        result.update(availability='reachable', httpStatus=code,
                      title=meta.get('title', '')[:200], creator=meta.get('author_name', '')[:160],
                      creatorUrl=meta.get('author_url', ''),
                      thumbnailUrl=meta.get('thumbnail_url', ''),
                      embedOffered=bool(meta.get('html')))
    except urllib.error.HTTPError as error:
        result.update(httpStatus=error.code, availability='unavailable' if error.code in (404, 410) else 'unchecked')
        result['note'] = 'YouTube returned no public oEmbed record.' if error.code in (404, 410) else 'Provider request could not be checked; this is not evidence that the video is deleted.'
    except Exception as error:
        result.update(note='Provider metadata check failed: ' + type(error).__name__)
    try:
        from PIL import Image
        code, raw = request('https://i.ytimg.com/vi/' + vid + '/hqdefault.jpg')
        with Image.open(io.BytesIO(raw)) as image:
            width, height = image.size
        result.update(thumbnail='available' if width > 120 and height > 90 else 'placeholder', thumbnailWidth=width, thumbnailHeight=height)
    except Exception:
        result['thumbnail'] = 'unavailable'
    return result

def name_signal(name, title):
    # A title overlap never marks a movement verified, and no overlap is a flag,
    # not a rejection: comprehensive tutorials can cover many named variations.
    stop = {'the','and','to','with','a','up','ups','hold','assisted','advanced','body','full','single','leg','one','two','arm','arms','knee','knees','tuck','straight','bent','seated','standing','wall','floor','negative','elevated','support','exercise','training'}
    plain = lambda text: ''.join(ch for ch in unicodedata.normalize('NFD', text.lower()) if unicodedata.category(ch) != 'Mn')
    if len(re.sub(r'[^a-z]', '', plain(name))) >= 3 and re.sub(r'[^a-z]', '', plain(name)) in re.sub(r'[^a-z]', '', plain(title)):
        return 'title_overlap'
    tokens = lambda text: {x.rstrip('s') for x in re.findall(r'[a-z]+', plain(text)) if x not in stop and len(x) > 2}
    expected, actual = tokens(name), tokens(title)
    return 'title_overlap' if expected & actual else 'title_needs_review'

urls = dict.fromkeys(e.get('youtube_url') for e in CATALOG if e.get('youtube_url'))
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
    records = list(executor.map(inspect, [(url, video_id(url)) for url in urls]))
lookup = {x['url']: x for x in records}
entries = []
for exercise in CATALOG:
    record = lookup.get(exercise.get('youtube_url'))
    entries.append(dict(slug=exercise['slug'], name=exercise['name'], url=exercise.get('youtube_url'),
                        availability=record['availability'] if record else 'missing',
                        titleSignal=name_signal(exercise['name'], record['title']) if record and record.get('title') else 'not_checked'))
audit = dict(checkedAt=CHECKED_AT, method='YouTube oEmbed and thumbnail HTTP checks; playback and movement identity are separate.', videos=records, exercises=entries)
(ROOT / 'src/data/videoAudit.json').write_text(json.dumps(audit, indent=2) + '\n')
counts = {key: sum(e['availability'] == key for e in entries) for key in ('reachable','unavailable','unchecked','invalid','missing')}
report = ['# POWER exercise video audit', '', 'Checked: ' + CHECKED_AT, '',
          'Every canonical exercise mapping was included. HTTP reachability does not prove embedded playback or movement identity.', '',
          f'{len(CATALOG)} exercises; {len(records)} unique video URLs.', '',
          '| Result | Exercise mappings |','|---|---:|']
report += [f'| {key} | {value} |' for key, value in counts.items()]
report += ['', '## Review queue', '', '| Exercise | Provider result | Title signal | Source title |', '|---|---|---|---|']
for entry in entries:
    record = lookup.get(entry['url'], {})
    title = record.get('title', '').replace('|', '/')
    report.append(f"| {entry['name']} | {entry['availability']} | {entry['titleSignal']} | {title} |")
report += ['', '## Mapping interventions', '', '| Exercise | Decision | Reason | Source |', '|---|---|---|---|']
for repair in json.loads((ROOT / 'src/data/videoRepairs.json').read_text()):
    report.append(f"| {repair['name']} | {repair['decision']} | {repair['reason']} | {repair['sourceUrl']} |")
(ROOT / 'audits/EXERCISE_VIDEO_AUDIT.md').write_text('\n'.join(report) + '\n')
print(json.dumps(dict(exercises=len(entries), uniqueVideos=len(records), results=counts, titleReview=sum(e['titleSignal']=='title_needs_review' for e in entries))))

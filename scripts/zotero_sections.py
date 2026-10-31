"""Mirror a reading list's site sections as Zotero subcollections.

For the queer data list this:
  1. creates one subcollection per section (named as in src/data/lists.js)
     under the list's Zotero collection, reusing any that already exist;
  2. moves each reading out of the parent collection into its section's
     subcollection (other collections the item is in are left alone);
  3. moves empty standalone notes in the parent collection to the trash;
  4. rewrites each book's "zotero" link to open it inside its subcollection.

Dry run (reads the public API, changes nothing):
  python scripts/zotero_sections.py
Apply (needs a key with write access in ZOTERO_API_KEY):
  python scripts/zotero_sections.py --apply
"""
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
USER_ID = 17836825
WEB = 'https://www.zotero.org/ljconnolly211743/collections'
API = f'https://api.zotero.org/users/{USER_ID}'
PARENT = '55HJFZDW'
BOOKS_FILE = ROOT / 'src/data/books/queer-critical-data-studies.json'
LIST_ID = 'queer-critical-data-studies'

APPLY = '--apply' in sys.argv
KEY = os.environ.get('ZOTERO_API_KEY')
if APPLY and not KEY:
    raise SystemExit('Set ZOTERO_API_KEY (a key with write access) to use --apply.')


def call(method, path, body=None, headers=None):
    h = {'Zotero-API-Version': '3', **(headers or {})}
    if KEY:
        h['Zotero-API-Key'] = KEY
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        h['Content-Type'] = 'application/json'
    req = urllib.request.Request(API + path, data=data, method=method, headers=h)
    with urllib.request.urlopen(req) as r:
        raw = r.read()
        return json.loads(raw) if raw else None


def section_titles():
    """Read the list's section ids and titles from src/data/lists.js."""
    src = (ROOT / 'src/data/lists.js').read_text()
    block = src[src.index(f"id: '{LIST_ID}'"):]
    block = block[block.index('sections: ['):block.index('],')]
    return dict(re.findall(r"\{\s*id: '([^']+)',\s*title: '([^']+)'", block))


titles = section_titles()
books = json.loads(BOOKS_FILE.read_text())
print('Sections:', titles)

# 1. Subcollections
subs = {c['data']['name']: c['key'] for c in call('GET', f'/collections/{PARENT}/collections?limit=100')}
for sid, name in titles.items():
    if name in subs:
        print(f'exists   {name} ({subs[name]})')
    elif APPLY:
        res = call('POST', '/collections', [{'name': name, 'parentCollection': PARENT}])
        if res.get('failed'):
            raise SystemExit(f'Could not create {name}: {res["failed"]}')
        subs[name] = res['successful']['0']['key']
        print(f'created  {name} ({subs[name]})')
    else:
        print(f'would create  {name}')

# 2. Move readings
items = {i['key']: i for i in call('GET', f'/collections/{PARENT}/items/top?limit=100')}
for b in books:
    key = b['zotero'].rsplit('/', 1)[1]
    name = titles[b['section']]
    item = items.get(key)
    if item is None:
        print(f'SKIP     {key} {b["title"][:50]} (not directly in the parent collection)')
        continue
    cols = [c for c in item['data']['collections'] if c != PARENT]
    sub = subs.get(name)
    if APPLY:
        call('PATCH', f'/items/{key}', {'collections': cols + [sub]},
             {'If-Unmodified-Since-Version': str(item['version'])})
        print(f'moved    {b["title"][:50]} -> {name}')
    else:
        print(f'would move  {b["title"][:50]} -> {name}')

# 3. Empty standalone notes
for key, item in items.items():
    d = item['data']
    if d['itemType'] == 'note' and not re.sub(r'<[^>]+>|\s', '', d.get('note', '')):
        if APPLY:
            call('PATCH', f'/items/{key}', {'deleted': 1},
                 {'If-Unmodified-Since-Version': str(item['version'])})
            print(f'trashed  empty note {key}')
        else:
            print(f'would trash  empty note {key}')

# 4. Site links
if APPLY:
    for b in books:
        key = b['zotero'].rsplit('/', 1)[1]
        b['zotero'] = f'{WEB}/{subs[titles[b["section"]]]}/items/{key}'
    BOOKS_FILE.write_text(json.dumps(books, indent=2, ensure_ascii=False) + '\n')
    print('updated zotero links in', BOOKS_FILE.relative_to(ROOT))
else:
    print('would update zotero links in', BOOKS_FILE.relative_to(ROOT))

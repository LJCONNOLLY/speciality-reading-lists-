"""Convert each write-up in public/writeups/<book-id>.docx into an HTML
fragment at src/data/writeups/<book-id>.html, which the book page shows
under "Write-up". Run after adding or updating a write-up:

  python scripts/build_writeups.py

Needs pandoc on the PATH.
"""
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'public/writeups'
OUT = ROOT / 'src/data/writeups'
OUT.mkdir(parents=True, exist_ok=True)

for docx in sorted(SRC.glob('*.docx')):
    html = subprocess.run(
        ['pandoc', '-f', 'docx', '-t', 'html', '--wrap=none', str(docx)],
        check=True, capture_output=True, text=True,
    ).stdout
    # Hanging-indented bullets come through wrapped in blockquotes.
    html = re.sub(r'</?blockquote>\n?', '', html)
    paras = html.split('\n')
    # The first paragraph is the document title, which the page already shows.
    if paras and paras[0].startswith('<p><strong>'):
        paras = paras[1:]
    html = '\n'.join(paras)
    # Paragraphs that are entirely bold are section headings.
    html = re.sub(r'<p><strong>([^<]*)</strong></p>', r'<h4>\1</h4>', html)
    (OUT / f'{docx.stem}.html').write_text(html)
    print('wrote', (OUT / f'{docx.stem}.html').relative_to(ROOT))

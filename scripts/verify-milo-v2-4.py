"""Read-only full-catalog PDF and historical asset audit; no live services."""
from pathlib import Path
import hashlib
import json
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT/'docs/Products/MILO'
QA = ROOT/'.qa/v2.4'
manifest = json.loads((ROOT/'src/lib/milo-v24-packages.server.json').read_text())
baseline = json.loads((ROOT/'tests/fixtures/milo-v2-4-historical-baseline.json').read_text())
for name, sha in baseline.items():
    assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest() == sha, name
assert len(manifest) == 45
results = []
for code, files in manifest.items():
    for file in files:
        assert hashlib.sha256((BASE/file['filename']).read_bytes()).hexdigest() == file['sha256'], file['filename']
    prompt = (BASE/files[0]['filename']).read_text(encoding='utf-8')
    current = PdfReader(BASE/files[1]['filename'])
    previous = PdfReader(BASE/files[1]['filename'].replace('v2.4','v2.3'))
    assert len(current.pages) == 15
    text = '\n'.join(p.extract_text() for p in current.pages)
    assert 'v2.3' not in text and 'First Contact' not in text
    assert files[0]['filename'] in text
    assert 'Monday-Friday, in the morning, customer local time.' in text
    assert 'Contacted? | Email | Phone | Notes' in text
    assert 'never populates, clears, overwrites, or otherwise modifies' in text
    assert 'No only when' in text and 'existing values' in text
    for line in previous.pages[0].extract_text().splitlines():
        if 'Territory:' in line or 'Northeast:' in line:
            assert ' '.join(line.split()) in ' '.join(text.split()), (code,'territory')
    for n, page in enumerate(current.pages,1):
        assert tuple(page.mediabox) == tuple(previous.pages[n-1].mediabox), (code,n)
        if n not in (1,8,10,13,15):
            assert page.extract_text() == previous.pages[n-1].extract_text().replace('v2.3','v2.4'), (code,n)
            assert [im.data for im in page.images] == [im.data for im in previous.pages[n-1].images]
    prefix = files[0]['filename'].split('_Installation_Prompt')[0]
    renders = [QA/f'{prefix}-{n:02}.png' for n in range(1,16)]
    assert all(p.is_file() for p in renders), code
    assert (QA/f'{prefix}-contact.png').is_file()
    results.append({'code':code,'pages':15,'hashesValid':True,'historicalAssetsUnchanged':True,'unchangedPagesAndIllustrationsVerified':True,'renderedPages':15})
(QA/'pdf-audit.json').write_text(json.dumps({'packages':results,'historicalAssetCount':len(baseline)},indent=2)+'\n')
print(f'PASS: 45 packages, 675 rendered pages, {len(baseline)} historical assets unchanged.')

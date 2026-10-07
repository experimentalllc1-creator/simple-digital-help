"""Regenerate v2.4 QA renders only; does not author delivery assets."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json
import subprocess
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT/'.qa/v2.4'
manifest = json.loads((QA/'manifest.json').read_text())
poppler = Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe'
def render(files):
    prefix = QA/files[0]['filename'].split('_Installation_Prompt')[0]
    subprocess.run([str(poppler), '-scale-to', '850', '-png', str(ROOT/'docs/Products/MILO'/files[1]['filename']), str(prefix)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    pages = sorted(QA.glob(prefix.name+'-[0-9][0-9].png')); assert len(pages) == 15
    sheet=Image.new('RGB',(2250,1950),'white'); draw=ImageDraw.Draw(sheet)
    for index,p in enumerate(pages):
        im=Image.open(p).convert('RGB'); im.thumbnail((430,610))
        x,y=index%5*450+10,index//5*650+10
        sheet.paste(im,(x,y));draw.text((x,y+615),f'{prefix.name} / {index+1}',fill='black')
    sheet.save(QA/(prefix.name+'-contact.png'))
    print(prefix.name,flush=True)
with ThreadPoolExecutor(max_workers=4) as pool: list(pool.map(render,manifest.values()))
print('Rendered 675 pages and 45 contact sheets.')

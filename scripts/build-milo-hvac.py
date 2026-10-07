"""Clone the approved regional Roofing v2.3 structure without editing its assets."""
from pathlib import Path
import hashlib, json, re, subprocess
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream, TextStringObject, ByteStringObject, ArrayObject, NameObject
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
base = ROOT / 'docs/Products/MILO'
qa = ROOT / '.qa/hvac'
qa.mkdir(parents=True, exist_ok=True)
regions = [('FL','florida','Florida'), ('TX','texas','Texas'), ('CA','california','California'),
 ('Northeast','northeast','Northeast'), ('Southeast','southeast','Southeast'), ('Midwest','midwest','Midwest'),
 ('Southwest','southwest','Southwest'), ('Mountain_West','mountain-west','Mountain West'),
 ('Pacific_Northwest','pacific-northwest','Pacific Northwest')]
before = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in base.glob('*') if p.is_file() and 'HVAC' not in p.name}
(qa / 'roofing-before.json').write_text(json.dumps(before, indent=2))
manifest = {}
for token, region_id, name in regions:
    code = 'PD-HVAC-' + (token if token in ('FL','TX','CA') else region_id.upper())
    prompt = (base / f'Milo_{token}_Roofing_Installation_Prompt_v2.3.txt').read_text(encoding='utf-8')
    prompt = prompt.replace('PD-ROOF-', 'PD-HVAC-').replace('Roofing', 'HVAC').replace('roofing', 'HVAC')
    prompt = prompt.replace('Never repeat a business already recorded in Prospects.', 'Never repeat a business already recorded in Prospects under Customer Type = HVAC Contractors.')
    prompt = prompt.replace('- HVAC is a meaningful part of its business.', '- HVAC/heating/ventilation/air-conditioning/refrigeration service or installation is a meaningful part of its business.')
    prompt = prompt.replace('- Current public evidence supports the business identity, city, and a website clearly attributable to that business.', '- Current public evidence supports the business identity, location/service area, and a verified website clearly attributable to that business.')
    prompt = prompt.replace('- It is absent from Prospects after checking business identity and website domain.', '- It is absent from Prospects under Customer Type = HVAC Contractors after checking business identity and website domain across all regions.')
    prompt = prompt.replace('Residential and commercial contractors are eligible. Do not favor a HVAC material, system, specialization, or contractor type.', 'Residential and commercial contractors are eligible. A company may also offer plumbing, electrical, or other trades and still qualify when HVAC is a meaningful part of its business.')
    prompt = prompt.replace('Format both tabs for comfortable everyday use and automatically resize columns so the information is easy to read.', 'Preserve the current working spreadsheet formatting. Do not automatically resize columns.')
    prompt = prompt.replace('A business already appearing in Prospects must not be added again as a new discovery, even if it later appears under another region or customer type.', 'Do not add the same business twice under Customer Type = HVAC Contractors. The same company may already exist under Roofing Contractors, Plumbing Contractors, or another Customer Type; that does not disqualify it from being added once as HVAC. Region alone does not make an existing HVAC business a new record.')
    prompt = prompt.replace('Before researching, read Prospects to prevent duplicates.', 'Before researching, read Prospects and check business identity and website domain under Customer Type = HVAC Contractors across all regions to prevent duplicates.')
    prompt = prompt.replace('Create one recurring scheduled task named:', 'Leave existing Roofing scheduled tasks untouched. Create or reuse only this HVAC assignment.\n\nDo not send outreach.\n\nCreate one recurring scheduled task named:')
    txt = f'Milo_{token}_HVAC_Installation_Prompt_v2.3.txt'
    (base / txt).write_text(prompt, encoding='utf-8', newline='\n')
    source_name = 'Milo_Illustrated_Installation_Guide_v2.3.pdf' if token == 'FL' else f'Milo_{token}_Roofing_Installation_Guide_v2.3.pdf'
    source = PdfReader(base / source_name)
    writer = PdfWriter()
    for index, page in enumerate(source.pages):
        stream = ContentStream(page.get_contents(), source)
        def adapt(value):
            if isinstance(value, (TextStringObject, ByteStringObject)):
                text = (value.decode('latin1') if isinstance(value, ByteStringObject) else str(value)).replace('Roofing', 'HVAC').replace('ROOFING', 'HVAC').replace('roofing', 'HVAC')
                text = text.replace('Milo checks the existing Prospects list before each run so the same business is not added again.', 'Milo checks HVAC records across all regions; other customer types do not block an HVAC entry.')
                return ByteStringObject(text.encode('latin1')) if isinstance(value, ByteStringObject) else TextStringObject(text)
            if isinstance(value, ArrayObject): return ArrayObject([adapt(item) for item in value])
            return value
        stream.operations = [([adapt(value) for value in operands], operator) for operands, operator in stream.operations]
        page[NameObject('/Contents')] = stream
        writer.add_page(page)
    writer.add_metadata({'/Title': f'Milo HVAC - {name} Illustrated Installation Guide v2.3'})
    pdf = f'Milo_{token}_HVAC_Illustrated_Installation_Guide_v2.3.pdf'
    with (base / pdf).open('wb') as output: writer.write(output)
    check = PdfReader(base / pdf)
    assert len(check.pages) == 15
    text = '\n'.join(page.extract_text() for page in check.pages)
    assert '9:00' not in text and 'Roofing' not in text and 'ROOFING' not in text
    assert 'Monday-Friday, in the morning, customer local time.' in text
    assert txt in text
    assert 'HVAC records across all regions' in text
    for index, page in enumerate(check.pages):
        assert [im.data for im in page.images] == [im.data for im in source.pages[index].images]
    manifest[code] = [{'filename': filename, 'sha256': hashlib.sha256((base / filename).read_bytes()).hexdigest()} for filename in (txt, pdf)]
    poppler = 'C:/Users/henry/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe'
    prefix = qa / f'Milo_{token}_HVAC'
    subprocess.run([poppler, '-scale-to', '500', '-png', str(base / pdf), str(prefix)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    sheet = Image.new('RGB', (1650, 1395), 'white'); draw = ImageDraw.Draw(sheet)
    for index, image_path in enumerate(sorted(qa.glob(prefix.name + '-*.png'))):
        thumb = Image.open(image_path).convert('RGB'); thumb.thumbnail((310, 430))
        x, y = index % 5 * 330 + 10, index // 5 * 465 + 10
        sheet.paste(thumb, (x, y)); draw.text((x, y + 432), f'{name} / {index+1}', fill='black')
    sheet.save(qa / f'{token}-contact.png')
for filename, sha in before.items(): assert hashlib.sha256((base / filename).read_bytes()).hexdigest() == sha
(qa / 'manifest.json').write_text(json.dumps(manifest, indent=2))
print('Nine HVAC TXT/PDF pairs created and rendered; existing assets unchanged.')

"""Clone the approved regional HVAC v2.3 structure without editing its assets."""
from pathlib import Path
import hashlib, json, re, subprocess
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream, TextStringObject, ByteStringObject, ArrayObject, NameObject, FloatObject
from reportlab.pdfbase.pdfmetrics import stringWidth
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
base = ROOT / 'docs/Products/MILO'
qa = ROOT / '.qa/plumbing'
qa.mkdir(parents=True, exist_ok=True)
regions = [('FL','florida','Florida'), ('TX','texas','Texas'), ('CA','california','California'),
 ('Northeast','northeast','Northeast'), ('Southeast','southeast','Southeast'), ('Midwest','midwest','Midwest'),
 ('Southwest','southwest','Southwest'), ('Mountain_West','mountain-west','Mountain West'),
 ('Pacific_Northwest','pacific-northwest','Pacific Northwest')]
before = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in base.glob('*') if p.is_file() and 'Plumbing' not in p.name}
(qa / 'existing-before.json').write_text(json.dumps(before, indent=2))
manifest = {}
for token, region_id, name in regions:
    code = 'PD-PLUMB-' + (token if token in ('FL','TX','CA') else region_id.upper())
    prompt = (base / f'Milo_{token}_HVAC_Installation_Prompt_v2.3.txt').read_text(encoding='utf-8')
    prompt = prompt.replace('PD-HVAC-', 'PD-PLUMB-').replace('HVAC', 'Plumbing')
    prompt = prompt.replace('Plumbing/heating/ventilation/air-conditioning/refrigeration service or installation', 'Plumbing service, installation, repair, piping, drain/sewer, water-heater, or closely related plumbing work')
    prompt = prompt.replace('plumbing, electrical, or other trades', 'HVAC, electrical, mechanical, or other trades')
    prompt = prompt.replace('Roofing Contractors, Plumbing Contractors, or another Customer Type', 'HVAC Contractors, Roofing Contractors, or another Customer Type')
    prompt = prompt.replace('Leave existing Roofing scheduled tasks untouched', 'Leave existing Roofing and HVAC scheduled tasks untouched')
    txt = f'Milo_{token}_Plumbing_Installation_Prompt_v2.3.txt'
    (base / txt).write_text(prompt, encoding='utf-8', newline='\n')
    source = PdfReader(base / f'Milo_{token}_HVAC_Illustrated_Installation_Guide_v2.3.pdf')
    writer = PdfWriter()
    for index, page in enumerate(source.pages):
        stream = ContentStream(page.get_contents(), source)
        def adapt(value):
            if isinstance(value, (TextStringObject, ByteStringObject)):
                text = (value.decode('latin1') if isinstance(value, ByteStringObject) else str(value)).replace('HVAC', 'Plumbing')
                text = text.replace('Plumbing CONTRACTORS', 'PLUMBING CONTRACTORS')
                return ByteStringObject(text.encode('latin1')) if isinstance(value, ByteStringObject) else TextStringObject(text)
            if isinstance(value, ArrayObject): return ArrayObject([adapt(item) for item in value])
            return value
        original_ops = stream.operations
        adjusted_ops = [([adapt(value) for value in operands], operator) for operands, operator in original_ops]
        for op_index, (operands, operator) in enumerate(adjusted_ops):
            if operator == b'Tj' and 'INSTALLATION GUIDE' in str(operands):
                old_text = str(original_ops[op_index][0][0])
                new_text = str(operands[0])
                delta = stringWidth(new_text, 'Helvetica', 7) - stringWidth(old_text, 'Helvetica', 7)
                position = next(i for i in range(op_index - 1, -1, -1) if adjusted_ops[i][1] == b'Tm')
                adjusted_ops[position][0][4] = FloatObject(float(adjusted_ops[position][0][4]) - delta)
        stream.operations = adjusted_ops
        page[NameObject('/Contents')] = stream
        writer.add_page(page)
    writer.add_metadata({'/Title': f'Milo Plumbing - {name} Illustrated Installation Guide v2.3'})
    pdf = f'Milo_{token}_Plumbing_Illustrated_Installation_Guide_v2.3.pdf'
    with (base / pdf).open('wb') as output: writer.write(output)
    check = PdfReader(base / pdf)
    assert len(check.pages) == 15
    text = '\n'.join(page.extract_text() for page in check.pages)
    assert '9:00' not in text and 'Roofing' not in text and 'ROOFING' not in text
    assert 'Monday-Friday, in the morning, customer local time.' in text
    assert txt in text
    assert 'Plumbing records across all regions' in text
    for index, page in enumerate(check.pages):
        assert [im.data for im in page.images] == [im.data for im in source.pages[index].images]
    manifest[code] = [{'filename': filename, 'sha256': hashlib.sha256((base / filename).read_bytes()).hexdigest()} for filename in (txt, pdf)]
    poppler = 'C:/Users/henry/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe'
    prefix = qa / f'Milo_{token}_Plumbing'
    subprocess.run([poppler, '-scale-to', '500', '-png', str(base / pdf), str(prefix)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    sheet = Image.new('RGB', (1650, 1395), 'white'); draw = ImageDraw.Draw(sheet)
    for index, image_path in enumerate(sorted(qa.glob(prefix.name + '-*.png'))):
        thumb = Image.open(image_path).convert('RGB'); thumb.thumbnail((310, 430))
        x, y = index % 5 * 330 + 10, index // 5 * 465 + 10
        sheet.paste(thumb, (x, y)); draw.text((x, y + 432), f'{name} / {index+1}', fill='black')
    sheet.save(qa / f'{token}-contact.png')
for filename, sha in before.items(): assert hashlib.sha256((base / filename).read_bytes()).hexdigest() == sha
(qa / 'manifest.json').write_text(json.dumps(manifest, indent=2))
print('Nine Plumbing TXT/PDF pairs created and rendered; existing assets unchanged.')

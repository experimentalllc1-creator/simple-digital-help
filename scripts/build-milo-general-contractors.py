"""Create nine private General Contractors packages from Electrical v2.3."""
from pathlib import Path
import hashlib, json, subprocess
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream, TextStringObject, ByteStringObject, ArrayObject, NameObject, FloatObject
from reportlab.pdfbase.pdfmetrics import stringWidth
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
base = ROOT / 'docs/Products/MILO'
qa = ROOT / '.qa/general-contractors'
qa.mkdir(parents=True, exist_ok=True)
regions = [('FL','florida','Florida'), ('TX','texas','Texas'), ('CA','california','California'),
 ('Northeast','northeast','Northeast'), ('Southeast','southeast','Southeast'), ('Midwest','midwest','Midwest'),
 ('Southwest','southwest','Southwest'), ('Mountain_West','mountain-west','Mountain West'),
 ('Pacific_Northwest','pacific-northwest','Pacific Northwest')]
before = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in base.glob('*') if p.is_file() and 'General_Contractors' not in p.name}
baseline = ROOT / 'tests/fixtures/milo-existing-general-contractors-baseline.json'
if not baseline.exists(): baseline.write_text(json.dumps(before, indent=2) + '\n')
qualification = '''Residential, commercial, industrial, institutional, and mixed-market general contractors are eligible.

A company may self-perform specialty trades or also offer roofing, HVAC, plumbing, electrical, concrete, carpentry, restoration, development, or other construction services and still qualify when general contracting is a meaningful part of its business.

Do NOT qualify a business merely because it uses the word "contractor" or performs one specialty trade. Specialty-only subcontractors should remain in their appropriate specialty category unless public evidence clearly shows that the company also performs genuine general contracting / prime-contractor work.

Builders or homebuilders may qualify as General Contractors only when current public evidence clearly shows that general contracting or comparable whole-project contracting is a meaningful service. Do not automatically treat every builder, developer, or homebuilder as a General Contractor because Builders / Homebuilders is a separate Simple Digital Help customer type.'''
manifest = {}
for token, region_id, name in regions:
    code = 'PD-GC-' + (token if token in ('FL','TX','CA') else region_id.upper())
    prompt = (base / f'Milo_{token}_Electrical_Installation_Prompt_v2.3.txt').read_text(encoding='utf-8')
    prompt = prompt.replace('PD-ELEC-', 'PD-GC-').replace('Electrical Contractors', 'General Contractors')
    prompt = prompt.replace('Electrical contractors', 'general contractors').replace('Electrical contractor', 'general contractor')
    prompt = prompt.replace('Electrical Prospect Discovery', 'General Contractors Prospect Discovery')
    prompt = prompt.replace('Electrical installation, repair, service, wiring, panel/service upgrades, lighting, generators, controls, low-voltage, or closely related electrical contracting work', 'General contracting, construction management, design-build, new construction, renovation/remodeling, tenant improvement, or comparable whole-project construction responsibility')
    original_qualification = 'Residential, commercial, and industrial electrical contractors are eligible. A company may also offer HVAC, plumbing, mechanical, solar, or other trades and still qualify when Electrical is a meaningful part of its business.'
    assert original_qualification in prompt
    prompt = prompt.replace(original_qualification, qualification)
    prompt = prompt.replace('HVAC Contractors, Roofing Contractors, Plumbing Contractors, or another Customer Type', 'HVAC Contractors, Roofing Contractors, Plumbing Contractors, Electrical Contractors, or another Customer Type')
    prompt = prompt.replace('added once as Electrical', 'added once as General Contractors')
    prompt = prompt.replace('existing Electrical business', 'existing General Contractor')
    prompt = prompt.replace('Electrical activity', 'general contracting activity')
    prompt = prompt.replace('Leave existing Roofing, HVAC, and Plumbing scheduled tasks untouched. Create or reuse only this Electrical assignment.', 'Leave existing Roofing, HVAC, Plumbing, and Electrical scheduled tasks untouched. Create or reuse only this General Contractors assignment.')
    txt = f'Milo_{token}_General_Contractors_Installation_Prompt_v2.3.txt'
    (base / txt).write_text(prompt, encoding='utf-8', newline='\n')
    source = PdfReader(base / f'Milo_{token}_Electrical_Illustrated_Installation_Guide_v2.3.pdf')
    writer = PdfWriter()
    for page in source.pages:
        stream = ContentStream(page.get_contents(), source)
        def adapt(value):
            if isinstance(value, (TextStringObject, ByteStringObject)):
                text = value.decode('latin1') if isinstance(value, ByteStringObject) else str(value)
                text = text.replace('_Electrical_', '_General_Contractors_').replace('ELECTRICAL CONTRACTORS','GENERAL CONTRACTORS').replace('Electrical Contractors', 'General Contractors').replace('Electrical contractors', 'general contractors')
                text = text.replace('Milo checks Electrical records across all regions; other customer types do not block an Electrical entry.', 'Milo checks General Contractors across all regions; other customer types do not block a new entry.')
                text = text.replace('Electrical region', 'General Contractors region')
                return ByteStringObject(text.encode('latin1')) if isinstance(value, ByteStringObject) else TextStringObject(text)
            if isinstance(value, ArrayObject): return ArrayObject([adapt(item) for item in value])
            return value
        original_ops = stream.operations
        adjusted_ops = [([adapt(value) for value in operands], operator) for operands, operator in original_ops]
        for op_index, (operands, operator) in enumerate(adjusted_ops):
            if operator == b'Tj' and 'INSTALLATION GUIDE' in str(operands):
                delta = stringWidth(str(operands[0]), 'Helvetica', 7) - stringWidth(str(original_ops[op_index][0][0]), 'Helvetica', 7)
                position = next(i for i in range(op_index - 1, -1, -1) if adjusted_ops[i][1] == b'Tm')
                adjusted_ops[position][0][4] = FloatObject(float(adjusted_ops[position][0][4]) - delta)
        stream.operations = adjusted_ops
        page[NameObject('/Contents')] = stream
        writer.add_page(page)
    writer.add_metadata({'/Title': f'Milo General Contractors - {name} Illustrated Installation Guide v2.3'})
    pdf = f'Milo_{token}_General_Contractors_Illustrated_Installation_Guide_v2.3.pdf'
    with (base / pdf).open('wb') as output: writer.write(output)
    check = PdfReader(base / pdf)
    assert len(check.pages) == 15
    text = '\n'.join(page.extract_text() for page in check.pages)
    assert '9:00' not in text and 'Electrical' not in text and 'ELECTRICAL' not in text
    assert 'Monday-Friday, in the morning, customer local time.' in text
    assert txt in text and 'General Contractors across all regions' in text
    for index, page in enumerate(check.pages):
        assert [im.data for im in page.images] == [im.data for im in source.pages[index].images]
    manifest[code] = [{'filename': filename, 'sha256': hashlib.sha256((base / filename).read_bytes()).hexdigest()} for filename in (txt, pdf)]
    poppler = 'C:/Users/henry/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe'
    prefix = qa / f'Milo_{token}_General_Contractors'
    subprocess.run([poppler, '-scale-to', '700', '-png', str(base / pdf), str(prefix)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    sheet = Image.new('RGB', (2250, 1950), 'white'); draw = ImageDraw.Draw(sheet)
    for index, image_path in enumerate(sorted(qa.glob(prefix.name + '-*.png'))):
        thumb = Image.open(image_path).convert('RGB'); thumb.thumbnail((430, 610))
        x, y = index % 5 * 450 + 10, index // 5 * 650 + 10
        sheet.paste(thumb, (x, y)); draw.text((x, y + 615), f'{name} / {index+1}', fill='black')
    sheet.save(qa / f'{token}-contact.png')
for filename, sha in before.items(): assert hashlib.sha256((base / filename).read_bytes()).hexdigest() == sha
(qa / 'manifest.json').write_text(json.dumps(manifest, indent=2))
print('Nine General Contractors TXT/PDF pairs created and rendered; existing assets unchanged.')

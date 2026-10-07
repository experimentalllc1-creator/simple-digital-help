"""Create v2.4 packages only. Historical inputs and builders are immutable.

Run with the bundled Python runtime. --render generates all 675 QA pages.
Existing v2.4 outputs are accepted only when their bytes match this build.
"""
from pathlib import Path
from io import BytesIO
import argparse
import hashlib
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from xml.sax.saxutils import escape
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream, TextStringObject, ByteStringObject, ArrayObject, NameObject
from reportlab.pdfgen import canvas
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'docs/Products/MILO'
QA = ROOT / '.qa/v2.4'
REGIONS = ['FL', 'TX', 'CA', 'Northeast', 'Southeast', 'Midwest', 'Southwest', 'Mountain_West', 'Pacific_Northwest']
FAMILIES = {'Roofing': 'ROOF', 'HVAC': 'HVAC', 'Plumbing': 'PLUMB', 'Electrical': 'ELEC', 'General_Contractors': 'GC'}
HEADERS = 'Date Added\nBusiness Name\nCity\nRegion\nCustomer Type\nWebsite\nContacted?\nEmail\nPhone\nNotes'
OWNERSHIP = '''COLUMN OWNERSHIP AND SAFE WRITES

A-F (Date Added, Business Name, City, Region, Customer Type, Website) are Milo-managed.
G (Contacted?) is initialized to No by Milo only when a new prospect is created and is customer-owned thereafter.
H-J (Email, Phone, Notes) are entirely customer-owned. Milo must never populate, clear, overwrite, or otherwise modify them, including their existing values, formulas, formatting, or validation. Creating the three header labels in a new or safely upgraded workspace is the only setup exception; never write their data cells.

For a new prospect, write only A:G in the next unused row after all existing data, including customer-only content in H:J. Initialize G to No once. Never send an A:J row payload, even with blank values in H:J. If the tool cannot limit a write to A:G, stop and report the limitation. Do not use a whole-sheet replacement, clear operation, or full-row update.
For an existing prospect, preserve G:J exactly, including Yes, No, blanks, custom customer values, and formulas. Never reset Contacted? on installation, repair, retry, reinstallation, or an additional Milo assignment. Never backfill No into existing rows. On an uncertain write result, read back and check identity before retrying; do not append a duplicate or rewrite customer-owned cells.
Read-back verifies the new prospect's A:F and persistence. G is initialized to No at creation, but a subsequent customer change must be preserved, not corrected. H:J must remain untouched. Existing records must not be rewritten as part of a discovery run.
Configure a No/Yes selector for G only on a brand-new workspace or the new prospect cell, without changing existing values or validation. Never apply column-wide formatting, resizing, or validation to G:J in an existing workspace.

SAFE WORKSPACE REUSE AND UPGRADE

Reuse the same spreadsheet ID and Prospects and Needs Attention tab IDs. Preserve all existing records, customer content, formulas, formatting, and validation. Inspect headers and data before making changes.
If A:G already match the standard seven-column layout and H:J are unused, add only Email, Phone, Notes to H1:J1. If all ten headers already match, make no schema changes. Never move, delete, reorder, or overwrite existing columns or headers. If any required header is missing from A:G, H:J contain conflicting content, or the layout is unexpected, stop and report the exact conflict for a preservation plan. Do not silently repair it.
If the worksheet grid is narrower than ten columns, extend only the grid at its right edge without shifting existing cells. Do not create a replacement spreadsheet or tabs.
Installing v2.4 must not automatically change an already-installed automation. A live instruction upgrade is a separate explicitly authorized in-place operation preserving the automation ID, schedule, timezone, enabled state, activation date, and original service end date. Never restart the 52-week term.
'''


def put(path, data):
    if isinstance(data, str):
        data = data.encode('utf-8')
    if path.exists():
        if path.read_bytes() != data:
            raise RuntimeError(f'Refusing to overwrite existing asset: {path}')
        return
    assert 'v2.4' in path.name or QA in path.parents or path.parent.name == 'fixtures', path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def upgrade_prompt(text):
    text = text.replace('Prompt Version: 2.3', 'Prompt Version: 2.4')
    text = re.sub(r'A separate Simple Digital Help First Contact Agent.*?assigned\.\n', 'Do not send outreach or perform contact-data research. Customers may maintain their own contact details and notes.\n', text, flags=re.S)
    text = text.replace('No email or phone research or fields are part of this product.', 'Email, Phone, and Notes are customer-owned fields. Milo does not research contact data or modify these fields.')
    text = text.replace('exactly SEVEN columns', 'exactly TEN standard columns')
    text = text.replace('Date Added\nBusiness Name\nCity\nRegion\nCustomer Type\nWebsite\nContacted?', HEADERS)
    text = text.replace('- Contacted? = No.', '- Contacted? = No only when creating a new prospect; preserve all later customer changes.')
    text = text.replace('- Contacted? should support only No and Yes as user-selectable values.', '- Contacted? supports No and Yes for customer selection; never replace existing customer values or validation.')
    text = text.replace('Needs Attention is reserved for compatible Simple Digital Help Sales agents such as First Contact or Follow-Up to record exceptions they cannot resolve automatically, for example an unavailable public contact method or a failed contact attempt.', 'Needs Attention remains reserved for separately assigned Sales-agent exceptions. Milo must not write to it during discovery or alter its existing layout or data.')
    text = text.replace('If it exists but a required tab or required column is missing, preserve all existing customer data and make only the minimum safe changes needed to support the shared layout. Do not delete or overwrite existing records.', 'If an existing required tab or column is missing, follow the safe workspace reuse and upgrade rules below. Never replace tabs or overwrite records.')
    text = text.replace('Format both tabs for comfortable everyday use and automatically resize columns so the information is easy to read.', 'Preserve existing workspace formatting. Format only Milo-managed A:F on a new workspace; do not automatically resize existing columns.')
    text = text.replace('- The only routine customer edit in Prospects should be the final Contacted? column, using Yes or No.', '- Customers may edit G:J: Contacted?, Email, Phone, and Notes. A:F are Milo-managed. Milo never changes H:J data cells or existing Contacted? values.')
    text = text.replace('SPREADSHEET SAFETY\n', OWNERSHIP + '\nSPREADSHEET SAFETY\n')
    text = text.replace('4. Verify the seven required Prospects columns in the required order.', '4. Verify the ten standard Prospects columns in the required order; apply only the safe header-only upgrade described above.')
    text = text.replace('6. Configure Contacted? as described.', '6. Configure Contacted? only as permitted by the ownership rules; do not initialize existing rows.')
    text = text.replace('- The spreadsheet layout should not be changed. The only routine customer edit in Prospects is Yes or No in Contacted?.', '- Keep the spreadsheet structure unchanged. Customers may edit Contacted?, Email, Phone, and Notes; Milo preserves these customer-owned fields.')
    text = text.replace('append to Prospects using only the seven-column shared layout', 'append to Prospects using only A:G of the ten-column shared layout, initializing Contacted? to No only for the new prospect and leaving H:J untouched')
    assert 'First Contact' not in text and 'exactly SEVEN' not in text and 'seven required' not in text
    return text


def replacement_page(number, family, region, txt, source_text, pagesize):
    out = BytesIO()
    width, height = pagesize
    c = canvas.Canvas(out, pagesize=pagesize, invariant=1)
    c.setFillColorRGB(.08, .23, .19); c.rect(0, height-41, width, 41, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1); c.setFont('Helvetica', 7)
    c.drawString(28, height-24, 'simple digital help. / MILO')
    c.drawRightString(width-27, height-24, f'{region.upper()} / {family.upper().replace("_", " ")} / v2.4')
    c.setFillColorRGB(.08, .14, .13); y = height-76
    style = ParagraphStyle('body', fontName='Helvetica', fontSize=11, leading=16, textColor='#182824')
    def para(text, heading=False):
        nonlocal y
        p = Paragraph(escape(text), ParagraphStyle('h', parent=style, fontName='Helvetica-Bold', fontSize=14, leading=19) if heading else style)
        _, paragraph_height = p.wrap(width-84, 750)
        assert y - paragraph_height > 55, (number, text)
        p.drawOn(c, 42, y-paragraph_height); y -= paragraph_height + (15 if heading else 11)
    if number == 1:
        para('Install Milo', True)
        customer_type = 'General Contractors' if family == 'General_Contractors' else family + ' Contractors'
        para(f'Automated Prospect Discovery - {region} {customer_type}', True)
        para('What Milo does', True)
        para('Milo finds and files up to five new qualified businesses with verified websites per scheduled workday when available. It checks for duplicates and runs Monday-Friday, in the morning, customer local time, during the original 52-week service term.')
        boundary = next((line for line in source_text.splitlines() if 'Territory:' in line or 'territory:' in line or f'{region}:' in line), '')
        if boundary: para(boundary)
        para('Your prospect list and your customer workspace', True)
        para('Milo manages Date Added, Business Name, City, Region, Customer Type, and Website. It initializes Contacted? to No only when creating a new prospect. Contacted? is customer-owned thereafter.')
        para('Email, Phone, and Notes are entirely customer-owned. Milo never populates, clears, overwrites, or otherwise modifies their data cells. You may enter your own contact details and notes.')
        para('Milo does not research email addresses or phone numbers, send outreach, or follow up.')
        para('What you need', True)
        para('Your Milo installation email, access to ChatGPT, and the Google account where your prospect spreadsheet will live. Follow the illustrated Google connection steps in this guide.')
    elif number == 8:
        para('07A - Milo creates your prospect spreadsheet', True)
        para('If you already have Simple Digital Help - Sales Prospects, Milo reuses it. Do not create another spreadsheet. The following page explains reuse.')
        para('For a new workspace, Milo creates Prospects with these ten standard columns:', True)
        labels = ['Date Added', 'Business Name', 'City', 'Region', 'Customer Type', 'Website', 'Contacted?', 'Email', 'Phone', 'Notes']
        widths = [46, 66, 36, 39, 62, 65, 49, 52, 43, 53]
        for row in range(4):
            x = 42
            values = labels if row == 0 else ['2026-10-07', f'Example Roofer {row}', 'Tampa', 'Florida', 'Roofing', 'roofer.example', 'No', '', '', '']
            for col, cell_width in enumerate(widths):
                c.setFillColorRGB(*((.86,.93,.90) if col < 6 else (.95,.90,.80) if col == 6 else (.91,.88,.94)))
                c.rect(x, y-25, cell_width, 25, fill=1, stroke=0)
                c.setStrokeColorRGB(.7,.77,.73); c.rect(x,y-25,cell_width,25,fill=0,stroke=1)
                c.setFillColorRGB(.08,.14,.13); c.setFont('Helvetica-Bold' if row == 0 else 'Helvetica', 5.8)
                c.drawString(x+3,y-15,values[col]); x += cell_width
            y -= 25
        y -= 20
        para('Illustrative example: fictional businesses. New prospect writes use A:G only; H:J data cells are never modified.')
        para('Prospects is the master business list. A:F are Milo-managed. Contacted? starts as No only for a new prospect, and is customer-owned thereafter. Email, Phone, and Notes belong entirely to you.')
        para('Needs Attention retains its existing eight-column layout. Milo does not write discovery candidates there.')
        para('Already have this spreadsheet?', True)
        para('Milo must preserve the existing spreadsheet, tab IDs, records, Contacted? values, and customer workspace. A safe seven-column upgrade adds only the three missing header labels in unused H1:J1.')
    elif number == 10:
        para('08 - Check your prospect list', True)
        para('Spreadsheet: Simple Digital Help - Sales Prospects. Keep the Prospects and Needs Attention tab names unchanged.')
        para('A-F: Milo-managed columns', True)
        para('Date Added | Business Name | City | Region | Customer Type | Website')
        para('G-J: Your customer workspace', True)
        para('Contacted? | Email | Phone | Notes')
        para('Milo sets Contacted? to No only when it creates a new prospect. You own that value afterward. Milo preserves your later changes and never resets existing rows.')
        para('Email, Phone, and Notes belong entirely to you. Milo never populates, clears, overwrites, or otherwise modifies those data cells, formulas, formatting, or validation.')
        para('Keep the structure stable', True)
        para('Do not rename the spreadsheet or tabs, or delete, add, or rearrange columns yourself. You may edit G:J. Leave Needs Attention unchanged; Milo does not use it for discovery.')
        para('An existing standard seven-column workspace can receive only the three missing headers in unused H1:J1. Existing records and Contacted? values stay unchanged. Conflicting layouts require a preservation plan.')
        para('Find the spreadsheet later', True)
        para('Bookmark the direct link Milo provides. Otherwise, open Google Drive and search for Simple Digital Help - Sales Prospects.')
    elif number == 13:
        para('11 - Review the result', True)
        para('Open your existing spreadsheet using the direct link. Confirm that new prospects appear in Prospects with verified business websites and the correct Region and Customer Type.')
        duplicate = next((line for line in source_text.splitlines() if 'Milo checks' in line), 'Milo checks existing prospects before each run to prevent duplicates.')
        para(duplicate.lstrip('\x7f'))
        para('Milo adds up to five qualified prospects per scheduled workday when available. It keeps searching when a website cannot be reliably verified, and reports shortfalls honestly.')
        para('Your routine spreadsheet actions', True)
        para('Use Contacted? to record your own contact status. You may enter or edit Email, Phone, and Notes. Keep the column order, spreadsheet name, and tab names unchanged.')
        para('Milo writes only A:G for newly created prospects. Contacted? starts as No only for a new prospect; existing customer values are never reset. Milo never modifies H:J data cells.')
        para('Installation, repairs, retries, and additional Milo assignments must preserve existing prospects and customer-owned values. Report any unexpected changes before continuing.')
    else:
        para('Final check - Before you are done', True)
        for item in ['I saved and uploaded the v2.4 installation TXT file in ChatGPT.', 'The required Google connection is available and authorized.', 'I selected Always allow when available and appropriate.', 'Milo created or reused Simple Digital Help - Sales Prospects.', 'Prospects has all ten standard columns; Needs Attention is unchanged.', 'I understand A:F are Milo-managed and G:J are my customer workspace.', 'Contacted? starts as No only for new prospects; my existing values remain unchanged.', 'Milo never populates, clears, overwrites, or otherwise modifies Email, Phone, or Notes data cells.', 'I bookmarked the spreadsheet link.', 'The task is enabled, has a next run, and uses my verified timezone.', 'The schedule is Monday-Friday, in the morning, customer local time.', 'Only one task exists for this assignment, with the original 52-week service end date.', 'The first discovery succeeded, or I know how to request it.']:
            para('- ' + item)
        para('Existing installations require a separate authorized in-place upgrade. Uploading this file must not replace a spreadsheet or task, or restart the service term.')
    c.setFont('Helvetica', 8); c.drawRightString(width-30, 28, str(number)); c.save()
    return PdfReader(BytesIO(out.getvalue())).pages[0]


def upgrade_pdf(source_path, target, family, region, txt):
    reader = PdfReader(source_path); writer = PdfWriter()
    for number, page in enumerate(reader.pages, 1):
        if number in (1, 8, 10, 13, 15):
            writer.add_page(replacement_page(number, family, region, txt, page.extract_text(), (float(page.mediabox.width),float(page.mediabox.height))))
            continue
        stream = ContentStream(page.get_contents(), reader)
        def adapt(value):
            if isinstance(value, (TextStringObject, ByteStringObject)):
                text = value.decode('latin1') if isinstance(value, ByteStringObject) else str(value)
                text = text.replace('v2.3', 'v2.4').replace(' such as First Contact or Follow-Up', '')
                return ByteStringObject(text.encode('latin1')) if isinstance(value, ByteStringObject) else TextStringObject(text)
            if isinstance(value, ArrayObject): return ArrayObject([adapt(x) for x in value])
            return value
        stream.operations = [([adapt(v) for v in operands], op) for operands, op in stream.operations]
        page[NameObject('/Contents')] = stream; writer.add_page(page)
    writer.add_metadata({'/Title': f'Milo {region} {family.replace("_", " ")} Installation Guide v2.4'})
    data = BytesIO(); writer.write(data); put(target, data.getvalue())
    check = PdfReader(target)
    text = '\n'.join(page.extract_text() for page in check.pages)
    assert len(check.pages) == 15 and 'v2.3' not in text and 'First Contact' not in text
    assert 'Contacted? | Email | Phone | Notes' in text and txt in text
    for n in range(15):
        if n + 1 not in (1, 8, 10, 13, 15):
            assert check.pages[n].extract_text() == reader.pages[n].extract_text().replace('v2.3', 'v2.4').replace(' such as First Contact or Follow-Up', '')
            assert [im.data for im in check.pages[n].images] == [im.data for im in reader.pages[n].images]


def main():
    args = argparse.ArgumentParser(); args.add_argument('--render', action='store_true'); opts = args.parse_args()
    QA.mkdir(parents=True, exist_ok=True)
    historical = {str(p.relative_to(ROOT)).replace('\\', '/'): hashlib.sha256(p.read_bytes()).hexdigest() for p in BASE.rglob('*') if p.is_file() and re.search(r'v2\.[23]', p.name)}
    put(ROOT/'tests/fixtures/milo-v2-4-historical-baseline.json', json.dumps(historical, indent=2) + '\n')
    manifest = {}; render_jobs = []
    for family, code_prefix in FAMILIES.items():
        for token in REGIONS:
            source_txt = f'Milo_{token}_{family}_Installation_Prompt_v2.3.txt'
            source_pdf = 'Milo_Illustrated_Installation_Guide_v2.3.pdf' if family == 'Roofing' and token == 'FL' else f'Milo_{token}_{family}_{"" if family == "Roofing" else "Illustrated_"}Installation_Guide_v2.3.pdf'
            txt, pdf = source_txt.replace('v2.3', 'v2.4'), source_pdf.replace('v2.3', 'v2.4')
            prompt = upgrade_prompt((BASE/source_txt).read_text(encoding='utf-8'))
            put(BASE/txt, prompt)
            region = {'FL': 'Florida', 'TX': 'Texas', 'CA': 'California'}.get(token, token.replace('_', ' '))
            upgrade_pdf(BASE/source_pdf, BASE/pdf, family, region, txt)
            code = f'PD-{code_prefix}-{token.upper().replace("_", "-")}'
            manifest[code] = [{'filename': name, 'sha256': hashlib.sha256((BASE/name).read_bytes()).hexdigest()} for name in (txt, pdf)]
            if opts.render:
                render_jobs.append((pdf, token, family, region))
    put(QA/'manifest.json', json.dumps(manifest, indent=2)+'\n')
    florida = (BASE/'Milo_FL_Roofing_Installation_Prompt_v2.4.txt').read_text(encoding='utf-8')
    put(BASE/'Milo_Roofing_Installation_Prompt_Template_v2.4.txt', florida.replace('Florida', '{{REGION}}').replace('PD-ROOF-FL', '{{PRODUCT_CODE}}'))
    spec = (BASE/'Milo_FL_Roofing_Product_Spec_v2.3.md').read_text(encoding='utf-8').replace('2.3', '2.4')
    spec = spec.replace(' such as First Contact or Follow-Up', '').replace('- Contacted? defaults to No', '- Contacted? is initialized to No only when creating a new prospect; customer-owned thereafter')
    spec = spec.replace('Needs Attention is reserved for downstream Sales-agent exceptions being unable to complete an assigned action automatically.', 'Needs Attention is reserved for exceptions recorded by separately assigned Sales agents. Milo does not use it for discovery.')
    spec = spec.replace('7. Contacted?', '7. Contacted?\n8. Email\n9. Phone\n10. Notes')
    spec = spec.replace('The only routine manual change should be Contacted? = No / Yes.', 'Customers may edit Contacted?, Email, Phone, and Notes. A:F are Milo-managed.')
    spec = re.sub(r'## Contact-Data Explanation\n.*?(?=## Customer Delivery Package)', '## Column ownership\n'+OWNERSHIP+'\n', spec, flags=re.S)
    spec = spec.replace('seven Prospect columns correct', 'ten Prospect columns correct and existing G:J preserved')
    put(BASE/'Milo_FL_Roofing_Product_Spec_v2.4.md', spec)
    for name, sha in historical.items(): assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest() == sha, name
    print(f'Created/verified {len(manifest)} v2.4 TXT/PDF pairs; {len(historical)} historical assets unchanged.')
    def render(job):
        pdf, token, family, region = job
        poppler = Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe'
        prefix = QA/f'Milo_{token}_{family}'
        subprocess.run([str(poppler), '-scale-to', '850', '-png', str(BASE/pdf), str(prefix)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        sheet = Image.new('RGB', (2250, 1950), 'white'); draw = ImageDraw.Draw(sheet)
        pages = sorted(QA.glob(prefix.name+'-[0-9][0-9].png')); assert len(pages) == 15
        for index, p in enumerate(pages):
            im = Image.open(p).convert('RGB'); im.thumbnail((430, 610))
            x, y = index%5*450+10, index//5*650+10
            sheet.paste(im, (x,y)); draw.text((x,y+615), f'{region} {family} / {index+1}', fill='black')
        sheet.save(QA/(prefix.name+'-contact.png'))
        print(f'Rendered {region} {family}', flush=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(render, render_jobs))


if __name__ == '__main__': main()

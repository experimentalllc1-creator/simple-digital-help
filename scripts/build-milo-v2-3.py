"""Schedule-only v2.3 packages; retain v2.2 inputs for historical purchases."""
from pathlib import Path
import hashlib
import json
import re
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DecodedStreamObject, NameObject
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'docs/Products/MILO'
SCHEDULE = 'Monday-Friday, in the morning, customer local time.'
OLD_SCHEDULE = "Run every Monday through Friday at 9:00 AM in the user's local time zone."
NEW_SCHEDULE = '''Schedule: Monday-Friday, in the morning, customer local time.

Use the platform's native flexible/daypart "morning" scheduling capability when available. Do not promise an exact execution time. A scheduler-displayed next-run time is an estimate, not a guaranteed execution time.

Confirm the customer's local timezone from the platform or customer before scheduling. Do not infer it from the prospecting region. Ask only if the timezone cannot be verified.'''
OLD_NATIVE = "Use the native scheduler's end-date or recurrence-ending capability. Calculate and report the exact service end date when activation succeeds."
NEW_NATIVE = '''Use the native scheduler's weekday-morning and end-date controls directly when available. Do not manually construct a fragile RRULE when the native scheduler can represent weekday mornings and the 52-week end date directly. Calculate and report the exact service end date when activation succeeds.

If flexible/daypart scheduling is unavailable, use the platform's supported native weekday recurrence in the customer's morning, with the same enforced end date. Describe the schedule as morning, without promising an exact execution time.'''
OLD_EXISTING = "If an active task with the exact same name already exists for this assignment, do not create a duplicate. Verify that the existing task points to the correct assignment and shared workspace and that its end date reflects the current purchased service term."
NEW_EXISTING = '''Before creating a task, inspect existing tasks for this Milo assignment, including tasks with a different name but the same assignment. Reuse the single existing task; do not create a duplicate or restart the service term. Do not alter an already-installed customer automation to adopt this version. Verify its assignment, shared workspace, enabled status, next scheduled run, customer timezone, and original service end date. Report any mismatch or multiple active tasks; do not claim installation is complete or silently modify existing tasks.

For a new installation, verify after creation that the task is enabled and not paused, a next scheduled run exists within the 52-week term, the customer timezone is correct, the service end date is exactly 52 weeks after successful activation, and only one active task exists for this Milo assignment. If any check fails, report the limitation and do not claim installation is complete.'''

def upgrade_prompt(text):
    for old, new in [("Prompt Version: 2.2", "Prompt Version: 2.3"), (OLD_SCHEDULE, NEW_SCHEDULE), (OLD_NATIVE, NEW_NATIVE), (OLD_EXISTING, NEW_EXISTING),
        ('7. Create the recurring weekday scheduled task with the 52-week end date.', '7. Create or verify the single recurring weekday-morning task with the 52-week end date, using the scheduling rules above.'),
        ('9. Verify that the scheduled task associated with this assignment is active and not paused.', '9. Verify that exactly one active task exists for this Milo assignment and that it is enabled and not paused.'),
        ('10. Verify the exact activation date, first scheduled run, and service end date.', '10. Verify that a next scheduled run exists, the customer timezone is correct, and the service end date is correct for the original 52-week term. Confirm the activation date.'),
        ('- The recurring Monday-Friday schedule is active.', '- The recurring schedule is enabled: ' + SCHEDULE),
        ('- first scheduled run date and time,', '- next scheduled run as displayed by the scheduler (an estimate, not a promised execution time),\n- verified customer timezone,\n- confirmation that only one active task exists for this Milo,')]:
        assert text.count(old) == 1, old
        text = text.replace(old, new)
    return text

def line(text, x, y, size=10.5, bold=False):
    assert stringWidth(text, 'Helvetica-Bold' if bold else 'Helvetica', size) <= 497, text
    text = text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
    return f'BT /F{2 if bold else 1} {size} Tf 1 0 0 1 {x} {y} Tm ({text}) Tj ET\n'.encode('ascii')

manifest = {}
for code, stem, pdf_stem in [('PD-ROOF-FL', 'Milo_FL_Roofing', 'Milo_Illustrated'), ('PD-ROOF-TX', 'Milo_TX_Roofing', 'Milo_TX_Roofing'), ('PD-ROOF-CA', 'Milo_CA_Roofing', 'Milo_CA_Roofing'), ('PD-ROOF-NORTHEAST', 'Milo_Northeast_Roofing', 'Milo_Northeast_Roofing')]:
    txt_name = f'{stem}_Installation_Prompt_v2.3.txt'
    (BASE / txt_name).write_text(upgrade_prompt((BASE / txt_name.replace('2.3', '2.2')).read_text(encoding='utf-8')), encoding='utf-8', newline='\n')
    pdf_name = f'{pdf_stem}_Installation_Guide_v2.3.pdf'
    reader = PdfReader(BASE / pdf_name.replace('2.3', '2.2'))
    writer = PdfWriter()
    for index, page in enumerate(reader.pages):
        raw = page.get_contents().get_data()
        for escaped, literal in [(b'\\056', b'.'), (b'\\055', b'-'), (b'\\072', b':'), (b'\\054', b',')]:
            raw = raw.replace(escaped, literal)
        raw = raw.replace(b'v2.2', b'v2.3')
        if index == 10:
            raw = raw[:raw.index(b'q\n1 0 0 1 42 512 cm')]
            raw += b'q\n.933333 .956863 .941176 rg 42 476 496.8 150 re f\n.803922 .847059 .831373 RG .7 w 42 476 496.8 150 re S\n.090196 .137255 .133333 rg\n'
            lines = [('Milo must verify these items before installation is complete', True), ('Schedule: ' + SCHEDULE, False), ('Task is enabled and not paused; exactly one active task for this Milo', False), ('Next scheduled run exists within the service term', False), ('Customer timezone is correct (not inferred from the roofing region)', False), ('Activation date and service end date: 52 weeks after activation', False), ('A displayed next-run time is an estimate, not a guaranteed execution time.', False)]
            for n, (text, bold) in enumerate(lines): raw += line(text, 56, 604 - n * 18, 10.5, bold)
            raw += b'Q\nq .090196 .137255 .133333 rg\n'
            for y, text, bold in [(447, 'Milo uses native weekday-morning and end-date controls when available.', False), (429, 'You do not need to build an RRULE or create the schedule yourself.', False), (398, 'If a verification is missing, type this', True), (377, "Please verify Milo is enabled, has a next run, uses my correct timezone,", False), (359, 'ends after 52 weeks, and has only one active task.', False), (325, 'The platform may use a flexible morning window. No exact time is promised.', False), (307, 'If native daypart scheduling is unavailable, Milo uses a supported native', False), (289, 'weekday recurrence in your morning with an enforced 52-week end date.', False), (255, 'Existing installed tasks are not changed by this package update.', True), (237, 'Milo checks an existing task and its original end date without duplicating it.', False), (219, 'If a check fails or duplicate tasks exist, setup is not complete.', False), (185, 'To check later, ask: What is Milo\'s current schedule?', False)]: raw += line(text, 42, y, 10.5, bold)
            raw += b'Q\n'
        elif index == 14:
            old = b'(Milo confirmed Monday-Friday at 9:00 AM local time, the activation date, first scheduled run, and 52-week) Tj T* (service end date.)'
            new = b'(Milo confirmed Monday-Friday, in the morning, customer local time.) Tj T* (The task is enabled, its next run exists, and my timezone and 52-week end date are correct.)'
            pattern = re.escape(old).replace(rb'\ ', rb'\s+')
            raw, count = re.subn(pattern, lambda match: new, raw)
            assert count == 1
            raw = raw.replace(b'42 412 cm', b'42 390 cm').replace(b'42 391 cm', b'42 369 cm').replace(b'42 292 cm', b'42 270 cm')
            raw += b'q .090196 .137255 .133333 rg\n' + line('Only one active task exists for this Milo; no duplicate task was created.', 54, 418) + b'Q\n'
        stream = DecodedStreamObject(); stream.set_data(raw)
        page[NameObject('/Contents')] = stream
        writer.add_page(page)
    writer.add_metadata({'/Title': f'Milo {code} Installation Guide v2.3'})
    with (BASE / pdf_name).open('wb') as output: writer.write(output)
    check = PdfReader(BASE / pdf_name)
    assert len(check.pages) == 15
    extracted = '\n'.join(page.extract_text() for page in check.pages)
    assert '9:00' not in extracted and 'v2.2' not in extracted and SCHEDULE in extracted
    for index in range(15):
        if index not in (10, 14): assert check.pages[index].extract_text() == reader.pages[index].extract_text().replace('v2.2', 'v2.3')
        assert [image.data for image in check.pages[index].images] == [image.data for image in reader.pages[index].images]
    manifest[code] = [{'filename': name, 'sha256': hashlib.sha256((BASE / name).read_bytes()).hexdigest()} for name in (txt_name, pdf_name)]

spec = (BASE / 'Milo_FL_Roofing_Product_Spec_v2.2.md').read_text(encoding='utf-8').replace('2.2', '2.3')
spec = spec.replace('- Monday-Friday\n- 9:00 AM in the customer\'s local time', '- ' + SCHEDULE).replace('- Monday-Friday\n- 9:00 AM customer local time', '- ' + SCHEDULE)
spec = spec.replace('Installation must report:\n- activation date\n- first scheduled run\n- service end date', 'Prefer native flexible/daypart morning scheduling and native 52-week end-date controls. Do not promise an exact execution time or manually build a fragile RRULE when native controls represent the schedule and end date. If daypart scheduling is unavailable, use a supported native weekday recurrence in the customer\'s morning with the enforced end date.\n\nInstallation must verify and report:\n- task is enabled and not paused\n- next scheduled run exists within the service term (displayed time is an estimate)\n- correct customer timezone\n- activation date and correct service end date, exactly 52 weeks after activation\n- only one active task exists for this Milo\n\nInspect and reuse an existing task; do not duplicate it, restart its service term, or alter an already-installed customer automation to adopt v2.3. Report mismatches or duplicate tasks without claiming installation is complete.')
spec = spec.replace('- `Milo_Installation_Video_v2.3.mp4`\n', '')
spec += '\n## Regional gold master\nThe v2.3 Florida prompt and guide are the future-region master. Clone only product code, region, and the established state boundary. Preserve all prospecting, qualification, spreadsheet, pricing, and delivery rules. Texas, California, and Northeast use the same scheduling block. Each purchased Milo receives only its own TXT and PDF in a separate delivery email. No video is part of the active delivery package.\n'
(BASE / 'Milo_FL_Roofing_Product_Spec_v2.3.md').write_text(spec, encoding='utf-8')
template = upgrade_prompt((BASE / 'Milo_FL_Roofing_Installation_Prompt_v2.2.txt').read_text(encoding='utf-8')).replace('Florida', '{{REGION}}').replace('PD-ROOF-FL', '{{PRODUCT_CODE}}')
(BASE / 'Milo_Roofing_Installation_Prompt_Template_v2.3.txt').write_text(template, encoding='utf-8', newline='\n')
(ROOT / '.qa/v2.3').mkdir(parents=True, exist_ok=True)
(ROOT / '.qa/v2.3/manifest.json').write_text(json.dumps(manifest, indent=2))
print('Created four v2.3 TXT/PDF packages, Florida gold-master spec, and future-region prompt template. Preserved all v2.2 source files and PDF illustrations.')

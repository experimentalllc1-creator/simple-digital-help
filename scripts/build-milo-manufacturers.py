"""Build the nationwide manufacturer package without changing any existing package."""
from pathlib import Path
from io import BytesIO
from xml.sax.saxutils import escape
import hashlib, json, re, subprocess
from pypdf import PdfReader
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT/'docs/Products/MILO'
QA = ROOT/'.qa/manufacturers'
QA.mkdir(parents=True, exist_ok=True)
TXT = 'Milo_US_Building_Materials_Manufacturers_Installation_Prompt_v2.4.txt'
PDF = 'Milo_US_Building_Materials_Manufacturers_Illustrated_Installation_Guide_v2.4.pdf'
baseline = {p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in BASE.glob('*') if p.is_file()}
baseline.pop(TXT, None); baseline.pop(PDF, None)
source = (BASE/'Milo_FL_Roofing_Installation_Prompt_v2.4.txt').read_text(encoding='utf-8')
prompt = source.replace('PD-ROOF-FL','PD-BMM-US').replace('Florida Roofing Prospect Discovery','U.S. Building Materials Manufacturers').replace('Florida','United States').replace('Roofing Contractors','Building Materials Manufacturer')
assignment = '''YOUR ASSIGNMENT

Find actual manufacturers of building products or construction materials across the entire United States. This is one nationwide assignment, not regional variants.

Once per week, Monday at 9:00 AM customer local time, research current public information and add up to 2 NEW qualified manufacturers to Prospects when available. Stop after two new prospects have been successfully written and verified. Do not artificially fill the quota when qualified manufacturers cannot be verified. Seek useful diversity across product categories and geography over time. Do not favor any particular material or product category.

Do not research, extract, store, or write email addresses or phone numbers.

'''
prompt = re.sub(r'YOUR ASSIGNMENT\n.*?(?=WHY CONTACT DATA)',assignment,prompt,flags=re.S)
qualification = '''QUALIFICATION

A business qualifies only when current public evidence establishes that it is an actual manufacturer of building products or construction materials incorporated into residential, commercial, institutional, industrial, or infrastructure construction.

Require a verified official business website clearly attributable to the company, with evidence that the company itself manufactures qualifying products. A product listing or claim that the business sells, supplies, represents, imports, or installs products is insufficient manufacturing evidence. Verify the business identity and its U.S. headquarters or principal business location using current official evidence. Do not invent locations, manufacturing activity, or websites.

Exclude pure distributors, wholesalers, dealers, retailers, importers, sales agencies, contractors, installers, consultants, and service businesses unless there is clear evidence that the company itself manufactures qualifying building products. Mixed businesses qualify only on verified own manufacturing; reselling another manufacturer's products is insufficient.

Manufacturers from any qualifying material or product category are eligible. Seek diversity across categories and U.S. geography over time without weakening qualification or forcing the weekly quota.

Duplicate prevention applies nationwide across the entire shared Prospects sheet, regardless of Region or Customer Type. Compare business identity, known aliases, and normalized official website domain. Do not add the same business twice or treat its plants, branches, or product brands as new companies without evidence of a distinct business identity. If identity is uncertain, do not add a duplicate.

If manufacturing evidence or the official website cannot be reliably verified, do not add the candidate to Prospects or Needs Attention. Continue to another qualified manufacturer and report an honest shortfall when fewer than two are available.

Email, Phone, and Notes are customer-owned fields. Milo does not research contact data or modify these fields.

'''
prompt = re.sub(r'QUALIFICATION\n.*?(?=SHARED SALES WORKSPACE)',qualification,prompt,flags=re.S)
prompt = prompt.replace('- Region = United States.', '- Region = the U.S. state where the manufacturer is headquartered or principally located, when verifiable. Use the state name; never default Region to United States or invent a state. If not verifiable, leave it blank.\n- City = the verified headquarters or principal-location city when available; do not guess.')
prompt = prompt.replace('Milo - Roofing Contractors - United States','Milo - U.S. Building Materials Manufacturers')
prompt = prompt.replace('Milo - Building Materials Manufacturer - United States','Milo - U.S. Building Materials Manufacturers')
prompt = prompt.replace('Schedule: Monday-Friday, in the morning, customer local time.', 'Schedule: once per week, Monday at 9:00 AM customer local time.')
start = prompt.index('Use the platform\'s native flexible/daypart')
end = prompt.index('Before creating a task', start)
prompt = prompt[:start]+'''Use the supported native weekly schedule with Monday at 9:00 AM in the verified customer's local timezone, preserving local 9:00 AM through daylight-saving changes. Do not infer timezone from a manufacturer location or use a floating UTC time. Confirm the timezone from the platform or customer; ask only if it cannot be verified.

Do not schedule on other days. The recurring task must end exactly 52 weeks after successful activation. Use the scheduler's supported end-date control and verify that no run is scheduled beyond that expiration. The 9:00 AM schedule is the configured trigger; platform processing may occur later. If the platform cannot represent the weekly local-time schedule and enforce the expiration, report the limitation and do not claim installation is complete.

'''+prompt[end:]
prompt = prompt.replace('weekday-morning','Monday-9:00-AM weekly').replace('weekday recurring task','weekly recurring task').replace('weekday-morning task','weekly Monday task')
prompt = prompt.replace('Monday-9:00-AM weekly task','weekly Monday 9:00 AM task')
prompt = prompt.replace('up to 5 new website-verified primary prospects from each scheduled run when available', 'up to 2 new qualified website-verified manufacturers from each scheduled weekly run when available')
prompt = prompt.replace('This Milo assignment writes Region = United States and Customer Type = Building Materials Manufacturer.', 'This Milo assignment writes the verifiable U.S. headquarters or principal-location state to Region and Customer Type = Building Materials Manufacturer.')
prompt = prompt.replace('Monday-Friday, in the morning, customer local time','once per week, Monday at 9:00 AM customer local time')
prompt = prompt.replace('Research candidates sequentially and verify identity, United States city, roofing activity, and the business website from current public evidence.', 'Research candidates sequentially and verify identity, U.S. location, qualifying own manufacturing activity, and the official business website from current public evidence. Apply the nationwide duplicate checks before each new write.')
prompt = prompt.replace('five new Prospects','two new Prospects').replace('reach five','reach two').replace('If fewer than five new website-verified businesses','If fewer than two new qualified website-verified manufacturers')
assert not re.search(r'roofing|Monday-Friday|up to 5|five|weekday',prompt,re.I), [line for line in prompt.splitlines() if re.search(r'roofing|Monday-Friday|up to 5|five|weekday',line,re.I)]
assert 'Contacted?\nEmail\nPhone\nNotes' in prompt
(BASE/TXT).write_text(prompt,encoding='utf-8',newline='\n')

source_pdf = PdfReader(BASE/'Milo_Illustrated_Installation_Guide_v2.4.pdf')
output=BytesIO(); c=canvas.Canvas(output,pagesize=(612,792),invariant=1)
c.setTitle('Milo - U.S. Building Materials Manufacturers - Installation Guide v2.4')
style=ParagraphStyle('body',fontName='Helvetica',fontSize=11,leading=16,textColor='#182824')
def page(n,title,paragraphs,image_page=None):
 c.setFillColorRGB(.08,.23,.19); c.rect(0,751,612,41,fill=1,stroke=0)
 c.setFillColorRGB(1,1,1); c.setFont('Helvetica',8); c.drawString(28,768,'simple digital help. / MILO'); c.drawRightString(584,768,'U.S. MANUFACTURERS / v2.4')
 y=716
 for i,text in enumerate([title]+paragraphs):
  p=Paragraph(escape(text),ParagraphStyle('heading',parent=style,fontName='Helvetica-Bold',fontSize=18,leading=23) if i==0 else style)
  _,h=p.wrap(528,700); assert y-h>60,(n,text); p.drawOn(c,42,y-h); y-=h+16
 if n==2:
  c.setFillColorRGB(.9,.95,.92); c.roundRect(42,y-105,528,100,8,fill=1,stroke=0);c.setFillColorRGB(.08,.23,.19);c.setFont('Helvetica-Bold',13);c.drawString(56,y-29,'Your installation email: two private attachments')
  for j,filename in enumerate([TXT,PDF]):
   p=Paragraph(escape(filename),ParagraphStyle('file',parent=style,fontSize=9,leading=12));_,h=p.wrap(490,50);p.drawOn(c,56,y-55-j*30)
 if n==8:
  widths=[45,64,34,38,63,65,49,56,47,67];labels=['Date Added','Business Name','City','Region','Customer Type','Website','Contacted?','Email','Phone','Notes']
  for row in range(3):
   x=42; values=labels if row==0 else ['2026-10-12',f'Example Maker {row}','Columbus' if row==1 else 'Sacramento','Ohio' if row==1 else 'California','Building Materials Manufacturer',f'maker{row}.example','No','','','']
   for col,w in enumerate(widths):
    c.setFillColorRGB(*((.86,.93,.90) if col<6 else (.95,.9,.8) if col==6 else (.91,.88,.94)));c.rect(x,y-25,w,25,fill=1,stroke=1);c.setFillColorRGB(.08,.14,.13);c.setFont('Helvetica',5.5)
    if col==4 and row>0:
     p=Paragraph(values[col],ParagraphStyle('cell',fontName='Helvetica',fontSize=5.5,leading=6.5));_,h=p.wrap(w-6,25);p.drawOn(c,x+3,y-4-h)
    else:c.drawString(x+3,y-15,values[col])
    x+=w
   y-=25
  c.setFont('Helvetica',9);c.drawString(42,y-22,'Illustration only: fictional manufacturers. Milo writes new records to A:G only.')
 if image_page:
  images=list(source_pdf.pages[image_page-1].images)
  if images:
   im=max((x.image for x in images),key=lambda x:x.width*x.height)
   height=min(340,y-100);width=min(528,height*im.width/im.height);height=width*im.height/im.width
   c.drawImage(ImageReader(im),42+(528-width)/2,y-height-12,width,height,preserveAspectRatio=True)
 c.setFillColorRGB(.08,.14,.13);c.setFont('Helvetica',8);c.drawRightString(582,28,str(n));c.showPage()

page(1,'Install Milo - U.S. Building Materials Manufacturers',[
 'One nationwide product. Milo finds up to 2 new qualified manufacturers per scheduled run when available, across the entire United States.',
 'Your schedule: once per week, Monday at 9:00 AM customer local time. Your service lasts 52 weeks from successful activation.',
 'Milo manages A:F, initializes Contacted? to No only for a new prospect, and preserves customer changes thereafter. Email, Phone, and Notes belong entirely to you.',
 'You need your installation email, ChatGPT, and the Google account where your shared Sales prospect spreadsheet lives.'])
page(2,'01 - Save your installation file',[
 'Open your Simple Digital Help purchase email. Save the attached installation TXT somewhere easy to find, such as your Desktop. Keep this illustrated PDF guide open.',
 'The TXT contains the complete assigned product instructions. The PDF walks you through installing them. No regional selection or material-category configuration is required.'])
page(3,'02 - Upload the file in ChatGPT',[
 'Open a new ChatGPT conversation. Use the attachment control to upload the saved TXT. Wait until the attachment is visible.',
 'Type: Install Milo using the attached file.',
 'Milo is already assigned to U.S. Building Materials Manufacturers. Let it check Google access and continue setup.'],3)
page(4,'03 - Connect Google',[
 'If the required Google service is unavailable, follow the connection controls ChatGPT presents. Milo should guide you through the next specific action.',
 'Choose the Google account that owns your existing Sales prospect spreadsheet, or where a new workspace should live. Screens may change; follow the current requested Drive or Sheets connection.'],4)
page(5,'04 - An optional Google reminder',[
 'Some accounts see an extra reminder before continuing. If the required connection is already selected and Continue is available, continue.',
 'Do not enable unrelated Google services. If Google specifically requires a Drive or Sheets permission for this workspace, complete that requested permission.'],5)
page(6,'05 - Choose your Google account',[
 'Use the same Google account as your other Milo assignments. Milo reuses Simple Digital Help - Sales Prospects rather than creating one sheet per product.',
 'Account sign-in and permission decisions are yours. Setup is not complete until Milo can actually read and update the required workspace.'],6)
page(7,'06 - Allow future spreadsheet work',[
 'When ChatGPT asks permission to read or update the sheet, select Always allow when available and appropriate for this assigned workflow.',
 'This supports future weekly runs. If setup still lacks the required capability, follow the specific remaining connection step; do not assume authorization succeeded.'],7)
page(8,'07 - Your ten-column workspace',[
 'Prospects columns: Date Added | Business Name | City | Region | Customer Type | Website | Contacted? | Email | Phone | Notes.',
 'A:F are Milo-managed. G starts as No only when a new prospect is created and is customer-owned afterward. H:J are entirely customer-owned.',
 'Region is the verified U.S. headquarters or principal-location state; Customer Type is Building Materials Manufacturer. A state is never guessed.',
 'Milo never populates, clears, overwrites, or otherwise modifies H:J data cells, formulas, formatting, or validation.'])
page(9,'08 - Reuse an existing prospect list',[
 'Keep the same spreadsheet and Prospects and Needs Attention tab IDs. All existing prospects, Contacted? values, customer details, formulas, formatting, and validation are preserved.',
 'If the standard A:G headers are correct and H:J are unused, Milo adds only Email, Phone, Notes to H1:J1. If all ten headers match, no schema change is needed.',
 'Unexpected headers, conflicting H:J content, or a missing required tab require a specific preservation plan. Milo stops instead of replacing or clearing anything.',
 'Installing this product does not modify any existing Milo automation or restart another assignment\'s term. Needs Attention is unchanged.'])
page(10,'09 - What qualifies as a manufacturer?',[
 'Require an official business website with clear evidence that the company itself manufactures building products or construction materials used in residential, commercial, institutional, industrial, or infrastructure construction.',
 'Exclude pure distributors, wholesalers, dealers, retailers, importers, sales agencies, contractors, installers, consultants, and service businesses unless their own qualifying manufacturing is clearly evidenced.',
 'A sales catalog alone is not manufacturing evidence. Milo never favors a particular material and seeks useful category and geographic diversity over time.',
 'Nationwide duplicates are checked against every business in the shared Prospects sheet, including aliases and official website domains. Branches and brands are not automatically distinct companies.'])
page(11,'10 - Verify the weekly schedule',[
 'Task name: Milo - U.S. Building Materials Manufacturers.',
 'Once per week: Monday at 9:00 AM in your verified local timezone, including daylight-saving changes. Do not use a generic morning window, a weekday-daily schedule, or a fixed UTC substitute.',
 'Verify one task for this assignment, enabled status, the displayed next run, your timezone, activation date, and expiration exactly 52 weeks after successful activation.',
 'The configured trigger is 9:00 AM; platform processing may occur later. If the platform cannot enforce this schedule and the expiration, Milo must report the limitation. Existing assignments keep their schedules and expiration.'])
page(12,'11 - Run the first discovery',[
 'After verified setup, Milo may ask whether you want an immediate first run. Choose Yes if you want to check it now; otherwise wait for the next scheduled Monday.',
 'The first run follows the same limit: up to 2 new qualified manufacturers when available. An immediate run does not reset the weekly schedule or service term.',
 'Milo reads the shared prospect list before researching, verifies manufacturing evidence and official websites, writes A:G only, and reads back to confirm persistence.'])
page(13,'12 - Review the result',[
 'Open the spreadsheet link Milo provides. Verify new manufacturers, official websites, available city/state evidence, and Customer Type = Building Materials Manufacturer.',
 'New Contacted? cells start as No. Your existing statuses remain unchanged. You may edit Contacted?, Email, Phone, and Notes; Milo preserves them.',
 'Fewer than two verified manufacturers is a legitimate result. Milo reports the actual count and any shortfall; it never fabricates businesses or lowers qualification to fill the quota.',
 'On uncertain writes Milo reads back before retrying, rather than adding duplicates or rewriting customer cells.'])
page(14,'13 - Keep your workspace usable',[
 'Bookmark the sheet. If needed, search Google Drive for Simple Digital Help - Sales Prospects.',
 'Keep the spreadsheet name, tab names, and column order unchanged. Edit your customer workspace in G:J. Leave Needs Attention unchanged unless a separately assigned agent instructs otherwise.',
 'Use the same Google account for additional Milo assignments. They reuse the workspace, while this product checks duplicates nationwide across the entire sheet.',
 'Milo does not research email addresses or phone numbers, send outreach, or follow up.'])
page(15,'Final installation checks',[
 'The correct v2.4 TXT was uploaded, and Google access is available.',
 'The shared sheet and required tabs are accessible, with ten standard Prospects columns and all existing records preserved.',
 'A:F are Milo-managed. G is customer-owned after creation. Milo never modifies Email, Phone, or Notes data cells.',
 'Exactly one manufacturer task exists and is enabled: weekly Monday 9:00 AM in the verified customer timezone.',
 'The activation date, next run, and exact 52-week expiration are verified. Other Milo tasks remain unchanged.',
 'New businesses have verified own manufacturing evidence and official websites. Up to two are added per run; nationwide duplicates are prevented.',
 'The first run was reviewed or the next scheduled run is known. Any platform limitation has been reported honestly.'])
c.save();(BASE/PDF).write_bytes(output.getvalue())
reader=PdfReader(BASE/PDF);text='\n'.join(p.extract_text() for p in reader.pages)
assert len(reader.pages)==15 and '9:00 AM' in text and 'Building Materials Manufacturer' in text
assert not re.search('Roofing|Monday-Friday|up to five|First Contact',text,re.I)
for name,sha in baseline.items():assert hashlib.sha256((BASE/name).read_bytes()).hexdigest()==sha,name
manifest=json.loads((ROOT/'src/lib/milo-v24-packages.server.json').read_text())
manifest['PD-BMM-US']=[{'filename':n,'sha256':hashlib.sha256((BASE/n).read_bytes()).hexdigest()} for n in (TXT,PDF)]
(ROOT/'src/lib/milo-v24-packages.server.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8',newline='\n')
(QA/'existing-assets-baseline.json').write_text(json.dumps(baseline,indent=2)+'\n')
poppler=Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe'
subprocess.run([str(poppler),'-scale-to','1000','-png',str(BASE/PDF),str(QA/'guide')],check=True)
sheet=Image.new('RGB',(2250,2100),'white');draw=ImageDraw.Draw(sheet)
for i,p in enumerate(sorted(QA.glob('guide-[0-9][0-9].png'))):
 im=Image.open(p);im.thumbnail((430,650));x=i%5*450+10;y=i//5*700+10;sheet.paste(im,(x,y));draw.text((x,y+660),str(i+1),fill='black')
sheet.save(QA/'guide-contact.png')
print(f'Built manufacturer TXT/PDF; {len(baseline)} existing package files unchanged; 15 pages rendered.')

// Offline canvas rendering only; no app, Google account or remote service is used.
const { chromium } = require('C:/Users/henry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { writeFileSync } = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    const result = await page.evaluate(async () => {
      const mime = 'video/mp4;codecs=avc1.42001E';
      if (!MediaRecorder.isTypeSupported(mime)) throw Error('MP4 recording unsupported');
      const canvas = document.createElement('canvas'); canvas.width = 1800; canvas.height = 800;
      const ctx = canvas.getContext('2d');
      const widths = [130,245,120,120,180,240,130,200,160,215];
      const labels = ['Date Added','Business Name','City','Region','Customer Type','Website','Contacted?','Email','Phone','Notes'];
      function draw(count) {
        ctx.fillStyle = '#f7faf8'; ctx.fillRect(0,0,1800,800);
        ctx.fillStyle = '#163e32'; ctx.fillRect(0,0,1800,100);
        ctx.fillStyle = 'white'; ctx.font = 'bold 29px Arial'; ctx.fillText('Simple Digital Help - Sales Prospects',30,48);
        ctx.font = '18px Arial'; ctx.fillText('Milo v2.4 / Illustrative workspace / Fictional examples',30,80);
        ctx.fillStyle='#173c32'; ctx.font='bold 22px Arial'; ctx.fillText('A-F: Milo-managed',30,145);
        ctx.fillStyle='#715228'; ctx.fillText('G: No at creation, then yours',965,145);
        ctx.fillStyle='#624777'; ctx.fillText('H-J: entirely yours',1350,145);
        const rows = [['2026-10-01','Example Existing Roofer','Tampa','Florida','Roofing Contractors','https://existing.example','Yes','owner@example.test','Customer phone','Customer notes']];
        for(let i=0;i<count;i++) rows.push(['2026-10-07',`Example Roofing ${i+1}`,['Tampa','Orlando','Miami','Naples','Ocala'][i],'Florida','Roofing Contractors',`https://roofer${i+1}.example`,'No','','','']);
        for(let r=0;r<9;r++) {
          let x=30; const y=185+r*51;
          for(let col=0;col<10;col++) {
            ctx.fillStyle=r===0?(col<6?'#dcece7':col===6?'#f4e8cf':'#e9e0ef'):(r===1?'#f0f4f1':'white');
            ctx.fillRect(x,y,widths[col],51); ctx.strokeStyle='#c8d4ce'; ctx.strokeRect(x,y,widths[col],51);
            ctx.save(); ctx.beginPath(); ctx.rect(x+3,y+2,widths[col]-6,47); ctx.clip();
            ctx.fillStyle='#1e332b'; ctx.font=(r===0?'bold ':'')+'17px Arial';
            ctx.fillText(r===0?labels[col]:(rows[r-1]?.[col]??''),x+8,y+31); ctx.restore(); x+=widths[col];
          }
        }
        ctx.fillStyle='#163e32'; ctx.font='bold 23px Arial'; ctx.fillText('Prospects',30,697);
        ctx.fillStyle='#596d61'; ctx.font='20px Arial'; ctx.fillText('Needs Attention',190,697);
        ctx.font='20px Arial'; ctx.fillText('Milo adds new prospects in A:G. Existing Contacted? values and all Email, Phone, and Notes cells stay untouched.',30,752);
      }
      draw(3);
      const poster=canvas.toDataURL('image/png').split(',')[1];
      const stream=canvas.captureStream(10), chunks=[];
      const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:1600000});
      const done=new Promise(resolve=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=resolve;});
      recorder.start();
      for(let frame=0;frame<70;frame++) {draw(Math.min(5,Math.floor(frame/10)));await new Promise(r=>setTimeout(r,100));}
      recorder.stop(); await done; stream.getTracks().forEach(t=>t.stop());
      const bytes=new Uint8Array(await new Blob(chunks,{type:mime}).arrayBuffer());
      let binary=''; for(const byte of bytes) binary+=String.fromCharCode(byte);
      return {poster,video:btoa(binary)};
    });
    writeFileSync('public/milo-spreadsheet-v2-4.png',Buffer.from(result.poster,'base64'));
    writeFileSync('public/milo-spreadsheet-v2-4.mp4',Buffer.from(result.video,'base64'));
    console.log('Created v2.4 poster and MP4; historical media unchanged.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

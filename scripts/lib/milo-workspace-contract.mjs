// Executable QA reference for the instructions shipped in Milo v2.4.
// This is not a live Google Sheets adapter or a scheduled worker.
export const headers = ['Date Added', 'Business Name', 'City', 'Region', 'Customer Type', 'Website', 'Contacted?', 'Email', 'Phone', 'Notes'];
export function headerUpgrade(sheet) {
  if (headers.every((h, i) => sheet[0]?.[i] === h)) return [];
  if (!headers.slice(0, 7).every((h, i) => sheet[0]?.[i] === h) ||
      sheet.some(row => row.slice(7).some(value => value !== '' && value !== undefined && value !== null))) {
    throw Error('Conflicting layout requires a preservation plan');
  }
  return [{ range: 'H1:J1', values: [headers.slice(7)] }];
}
export function newProspectWrite(sheet, prospect, customerTypeScoped) {
  if (!headers.every((h, i) => sheet[0]?.[i] === h)) throw Error('Verify all ten headers before discovery');
  const domain = url => new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  const duplicate = sheet.slice(1).some(row => (!customerTypeScoped || row[4] === prospect[4]) &&
    (String(row[1]).trim().toLowerCase() === String(prospect[1]).trim().toLowerCase() || (row[5] && domain(row[5]) === domain(prospect[5]))));
  if (duplicate) return [];
  if (prospect.length !== 6 || prospect.some(v => typeof v !== 'string' || !v)) throw Error('Require verified A:F prospect data');
  // Never reuse a row containing customer-only data, including beyond J.
  let last = sheet.length - 1;
  while (last > 0 && !sheet[last].some(v => v !== '' && v !== null && v !== undefined)) last--;
  return [{ range: `A${last + 2}:G${last + 2}`, values: [[...prospect, 'No']] }];
}

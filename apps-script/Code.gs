/* =============================================================================
   Code.gs — the lead sheet behind Jennifer's guide funnel.

   A stripped fork of the Indio Kaizandu funnel script. This one does exactly
   one job: receive a lead from the Netlify Function (server to server) and
   append it to the sheet. No MailApp, no Twilio: email is the Function's job,
   so nothing here touches Gmail quotas.

   SETUP, once, in Jennifer's (or Kevin's) Google account:
     1. sheets.new  ->  name it:  Jennifer Barragan - Leads
     2. Extensions > Apps Script, paste this file.
     3. Set TOKEN below to a long random string.
     4. Run setupSheet() once from the editor and grant permissions.
     5. Deploy > New deployment > Web app:
          Execute as: Me.  Who has access: Anyone.
        Copy the /exec URL.
     6. In Netlify: set SHEET_WEBHOOK_URL to that URL and SHEET_TOKEN to the
        same string as TOKEN.

   THE DEPLOY WARNING THAT MATTERS (learned the hard way on the Indio build):
   after editing this script, use Deploy > MANAGE deployments > edit > new
   VERSION on the EXISTING deployment. Creating a NEW deployment mints a NEW
   /exec URL and silently orphans the Netlify env var. Because email keeps
   working when the sheet leg dies, nobody notices until the spreadsheet is
   weeks stale. If the URL ever changes, update SHEET_WEBHOOK_URL in Netlify
   the same minute.

   Columns:
     timestamp | name | email | phone | guide | guideTitle | source | page |
     referrer | status | contacted_ts | notes

   status is a dropdown: NEW / CONTACTED / APPOINTMENT / CLIENT / NO REPLY /
   DEAD. onEdit() stamps contacted_ts the first time status leaves NEW, which
   is the speed to lead number: how long between the lead arriving and
   Jennifer reaching out. She should aim for minutes, not days.
   ========================================================================== */

var TOKEN = 'CHANGE-ME-to-a-long-random-string';

var SHEET_NAME = 'Leads';

var HEADERS = [
  'timestamp', 'name', 'email', 'phone', 'guide', 'guideTitle',
  'source', 'page', 'referrer', 'status', 'contacted_ts', 'notes',
];

var STATUS_VALUES = ['NEW', 'CONTACTED', 'APPOINTMENT', 'CLIENT', 'NO REPLY', 'DEAD'];

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Entry point for the Netlify Function. Expects a JSON body with `token`
   plus the lead fields. Returns ok either way for bots and bad tokens, so a
   probe learns nothing; real failures throw and show in executions. */
function doPost(e) {
  var d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut({ ok: false });
  }
  if (!d || d.token !== TOKEN) return jsonOut({ ok: true });

  appendLead({
    name: String(d.name || '').slice(0, 200),
    email: String(d.email || '').slice(0, 200),
    phone: String(d.phone || '').slice(0, 50),
    guide: String(d.guide || '').slice(0, 50),
    guideTitle: String(d.guideTitle || '').slice(0, 200),
    source: String(d.source || '').slice(0, 200),
    page: String(d.page || '').slice(0, 300),
    referrer: String(d.referrer || '').slice(0, 300),
  });
  return jsonOut({ ok: true });
}

function appendLead(lead) {
  // Two leads arriving in the same second must not race the row append.
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" not found. Run setupSheet() once.');
    sheet.appendRow([
      new Date(), lead.name, lead.email, lead.phone, lead.guide,
      lead.guideTitle, lead.source, lead.page, lead.referrer,
      'NEW', '', '',
    ]);
  } finally {
    lock.releaseLock();
  }
}

/* Stamps contacted_ts the first time a row's status moves off NEW. Simple
   trigger, runs automatically on any manual edit. */
function onEdit(e) {
  var sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;
  var statusCol = HEADERS.indexOf('status') + 1;
  var contactedCol = HEADERS.indexOf('contacted_ts') + 1;
  if (e.range.getColumn() !== statusCol || e.range.getRow() < 2) return;
  var newValue = String(e.range.getValue() || '');
  if (newValue === 'NEW' || newValue === '') return;
  var contactedCell = sheet.getRange(e.range.getRow(), contactedCol);
  if (!contactedCell.getValue()) contactedCell.setValue(new Date());
}

/* Run once from the editor. Idempotent: safe to run again after edits. */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setBackground('#1f2422').setFontColor('#efeeec');
  sheet.setFrozenRows(1);

  var statusCol = HEADERS.indexOf('status') + 1;
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUS_VALUES, true).setAllowInvalid(false).build();
  sheet.getRange(2, statusCol, sheet.getMaxRows() - 1, 1).setDataValidation(rule);

  // Readable defaults; widen by hand if a column feels cramped.
  var widths = [150, 160, 220, 130, 90, 240, 140, 200, 200, 120, 150, 260];
  for (var i = 0; i < widths.length; i++) sheet.setColumnWidth(i + 1, widths[i]);

  sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm');
  sheet.getRange('K2:K').setNumberFormat('yyyy-mm-dd hh:mm');
}

/* Optional: a quick self test from the editor. Appends one obviously fake
   row you can delete. */
function testAppend() {
  appendLead({
    name: 'Test Lead DELETE ME', email: 'test@example.com', phone: '(000) 000-0000',
    guide: 'relocate', guideTitle: 'Relocating to the Bradenton Area',
    source: '/g/relocate', page: '/g/relocate.html', referrer: 'test',
  });
}

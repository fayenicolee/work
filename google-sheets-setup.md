## Google Sheets setup

1. Create a Google Sheet and add this header row:

```text
participantName,participantGroup,character,characterIndex,submittedAt,notes,positivity,scariness,creativity
```

2. Open `Extensions -> Apps Script` and paste this script:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var payload = JSON.parse(e.postData.contents);

  sheet.appendRow([
    payload.participantName || "",
    payload.participantGroup || "",
    payload.character || "",
    payload.characterIndex || "",
    payload.submittedAt || "",
    payload.notes || "",
    payload.positivity || "",
    payload.scariness || "",
    payload.creativity || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy the script:

- Click `Deploy -> New deployment`
- Choose `Web app`
- Set access to `Anyone`
- Copy the web app URL

4. Open [config.js](/Users/fellis/Documents/GitHub/work/config.js) and set:

```javascript
window.APP_CONFIG = {
  sheetsEndpoint: "YOUR_WEB_APP_URL_HERE"
};
```

If `sheetsEndpoint` is blank, [dating.html](/Users/fellis/Documents/GitHub/work/dating.html) still works, but submissions stay in local browser storage instead of going to Google Sheets.

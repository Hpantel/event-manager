// ================================================================
// PANTELIDIS EVENT MANAGER — Google Apps Script API
// ================================================================
// ΟΔΗΓΙΕΣ ΕΓΚΑΤΑΣΤΑΣΗΣ:
// 1. Πήγαινε στο: https://sheets.google.com
// 2. Δημιούργησε νέο spreadsheet με όνομα "Pantelidis Event Manager"
// 3. Μετονόμασε το Sheet1 σε "EVENTS"
// 4. Πρόσθεσε headers στη γραμμή 1:
//    A1=ID  B1=Date  C1=Customer  D1=Type  E1=Hall  F1=People  G1=Status
// 5. Πήγαινε Extensions > Apps Script
// 6. Διέγραψε τον υπάρχοντα κώδικα, κάνε paste αυτόν
// 7. Deploy > New Deployment > Web App
//    - Execute as: Me (sales.pantelidis@gmail.com)
//    - Who has access: Anyone
// 8. Αντέγραψε το URL που σου δίνει — το βάζεις στην PWA
// ================================================================

const SHEET_NAME = "EVENTS";

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // CORS headers
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    const action = e.parameter.action || (e.postData ? JSON.parse(e.postData.contents).action : null);
    const data   = e.postData ? JSON.parse(e.postData.contents) : e.parameter;
    
    let result;
    switch(action) {
      case "getEvents":   result = getEvents();           break;
      case "addEvent":    result = addEvent(data);        break;
      case "deleteEvent": result = deleteEvent(data.id);  break;
      case "updateEvent": result = updateEvent(data);     break;
      case "getStats":    result = getStats();            break;
      default:            result = { error: "Unknown action: " + action };
    }
    
    output.setContent(JSON.stringify({ success: true, data: result }));
  } catch(err) {
    output.setContent(JSON.stringify({ success: false, error: err.toString() }));
  }
  
  return output;
}

// ── READ all events ─────────────────────────────────────────────
function getEvents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws = ss.getSheetByName(SHEET_NAME);
  const lastRow = ws.getLastRow();
  
  if (lastRow < 2) return [];
  
  const data = ws.getRange(2, 1, lastRow - 1, 7).getValues();
  
  return data
    .filter(row => row[0] !== "")
    .map(row => ({
      id:       row[0],
      date:     row[1] ? Utilities.formatDate(new Date(row[1]), "Europe/Athens", "yyyy-MM-dd") : "",
      customer: row[2],
      type:     row[3],
      hall:     row[4],
      people:   row[5],
      status:   row[6] || "Confirmed"
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ── ADD event ───────────────────────────────────────────────────
function addEvent(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws = ss.getSheetByName(SHEET_NAME);
  const lastRow = ws.getLastRow();
  const newId   = lastRow; // header is row 1, so lastRow = count of events
  
  const newRow = [
    newId,
    new Date(data.date),
    data.customer,
    data.type,
    data.hall    || "",
    data.people  || 0,
    data.status  || "Confirmed"
  ];
  
  ws.appendRow(newRow);
  
  // Format date column
  const dateCell = ws.getRange(lastRow + 1, 2);
  dateCell.setNumberFormat("dd/mm/yyyy");
  
  return { id: newId, message: "Event added successfully" };
}

// ── DELETE event ────────────────────────────────────────────────
function deleteEvent(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws = ss.getSheetByName(SHEET_NAME);
  const lastRow = ws.getLastRow();
  
  if (lastRow < 2) return { error: "No events found" };
  
  const data = ws.getRange(2, 1, lastRow - 1, 1).getValues();
  let deleteRow = -1;
  
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      deleteRow = i + 2;
      break;
    }
  }
  
  if (deleteRow === -1) return { error: "Event not found: " + id };
  
  ws.deleteRow(deleteRow);
  
  // Re-number IDs
  const newLast = ws.getLastRow();
  for (let r = 2; r <= newLast; r++) {
    ws.getRange(r, 1).setValue(r - 1);
  }
  
  return { message: "Event deleted successfully" };
}

// ── UPDATE event ────────────────────────────────────────────────
function updateEvent(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws = ss.getSheetByName(SHEET_NAME);
  const lastRow = ws.getLastRow();
  
  const rows = ws.getRange(2, 1, lastRow - 1, 1).getValues();
  let targetRow = -1;
  
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.id)) {
      targetRow = i + 2;
      break;
    }
  }
  
  if (targetRow === -1) return { error: "Event not found" };
  
  ws.getRange(targetRow, 2).setValue(new Date(data.date));
  ws.getRange(targetRow, 3).setValue(data.customer);
  ws.getRange(targetRow, 4).setValue(data.type);
  ws.getRange(targetRow, 5).setValue(data.hall    || "");
  ws.getRange(targetRow, 6).setValue(data.people  || 0);
  ws.getRange(targetRow, 7).setValue(data.status  || "Confirmed");
  ws.getRange(targetRow, 2).setNumberFormat("dd/mm/yyyy");
  
  return { message: "Event updated successfully" };
}

// ── STATS for dashboard ─────────────────────────────────────────
function getStats() {
  const events = getEvents();
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcoming = events.filter(e => new Date(e.date) >= today);
  const past     = events.filter(e => new Date(e.date) <  today);
  
  // Events by type
  const byType = {};
  events.forEach(e => {
    byType[e.type] = (byType[e.type] || 0) + 1;
  });
  
  // Events by month (next 6 months)
  const byMonth = {};
  upcoming.forEach(e => {
    const d = new Date(e.date);
    const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  
  // Next event
  const nextEvent = upcoming.length > 0 ? upcoming[0] : null;
  
  return {
    total:     events.length,
    upcoming:  upcoming.length,
    past:      past.length,
    byType:    byType,
    byMonth:   byMonth,
    nextEvent: nextEvent
  };
}

// ── LISTS (event types & halls) ─────────────────────────────────
function getLists() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Try LISTS sheet, fallback to defaults
  try {
    const ws = ss.getSheetByName("LISTS");
    if (ws) {
      const last = ws.getLastRow();
      const data = ws.getRange(1, 1, last, 2).getValues();
      const types = data.map(r => r[0]).filter(v => v !== "");
      const halls = data.map(r => r[1]).filter(v => v !== "");
      return { types, halls };
    }
  } catch(e) {}
  
  return {
    types: ["Wedding", "Baptism", "Corporate Event", "Birthday", "Conference", "Other"],
    halls: ["Main Hall", "Garden", "VIP Room", "Terrace"]
  };
}

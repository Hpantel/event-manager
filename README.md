# Pantelidis Event Manager — PWA Setup Guide

## Τι περιέχει αυτό το φάκελο

| Αρχείο | Περιγραφή |
|--------|-----------|
| `index.html` | Η mobile web app |
| `manifest.json` | PWA manifest (icon, όνομα) |
| `sw.js` | Service Worker (offline support) |
| `Code.gs` | Google Apps Script (backend API) |

---

## ΒΗΜΑ 1 — Google Sheets (backend)

1. Πήγαινε στο **https://sheets.google.com**
2. Δημιούργησε νέο spreadsheet → όνομα: **"Pantelidis Event Manager"**
3. Μετονόμασε το **Sheet1** → **EVENTS**
4. Πρόσθεσε headers στη **γραμμή 1**:

```
A1: ID    B1: Date    C1: Customer    D1: Type    E1: Hall    F1: People    G1: Status
```

5. (Προαιρετικό) Πρόσθεσε δεύτερο sheet με όνομα **LISTS**:
   - Στήλη A: τύποι εκδηλώσεων (Wedding, Baptism, κλπ)
   - Στήλη B: αίθουσες

---

## ΒΗΜΑ 2 — Google Apps Script (API)

1. Στο Google Sheet: **Extensions → Apps Script**
2. Διέγραψε τα πάντα στον editor
3. Κάνε **paste** ολόκληρο το `Code.gs`
4. Πάτα **Save** (Ctrl+S)
5. Πάτα **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me** (sales.pantelidis@gmail.com)
   - Who has access: **Anyone**
6. Πάτα **Deploy** → δώσε Google permission
7. **Αντέγραψε το URL** που σου δίνει (μοιάζει με: `https://script.google.com/macros/s/ABC.../exec`)

---

## ΒΗΜΑ 3 — GitHub Pages (hosting)

1. Πήγαινε στο **https://github.com** → Sign up (δωρεάν)
2. Δημιούργησε νέο repository → όνομα: **event-manager**
3. Upload όλα τα αρχεία (index.html, manifest.json, sw.js)
4. **Settings → Pages → Branch: main → Save**
5. Το URL σου θα είναι: `https://[username].github.io/event-manager`

---

## ΒΗΜΑ 4 — Σύνδεση PWA με API

1. Άνοιξε το URL στο κινητό σου
2. Πάτα το **⚙️** (Settings) στο κάτω menu
3. Κάνε paste το **Apps Script URL** από το Βήμα 2
4. Πάτα **Save & Connect**
5. Η app θα κάνει sync αυτόματα!

---

## ΒΗΜΑ 5 — Εγκατάσταση στο κινητό

### Android (Chrome):
- Άνοιξε το URL στο Chrome
- Πάτα τις **3 τελείες** → **"Add to Home Screen"**

### iPhone (Safari):
- Άνοιξε το URL στο Safari
- Πάτα το **Share icon** (□↑) → **"Add to Home Screen"**

---

## Χαρακτηριστικά

- ✅ **Real-time sync** με Google Sheets
- ✅ **Offline mode** — δουλεύει χωρίς internet
- ✅ **Dashboard** με στατιστικά
- ✅ **Search & Filter** εκδηλώσεων
- ✅ **Add / Delete** εκδηλώσεων
- ✅ **Προσαρμόσιμες λίστες** τύπων & αιθουσών
- ✅ Δουλεύει σε **iOS & Android**
- ✅ **Δωρεάν** hosting

---

## Sync με Excel

Για να μεταφέρεις τα υπάρχοντα δεδομένα από το Excel:
1. Άνοιξε το `Event_Management_Pro_v2.xlsm`
2. Πήγαινε στο sheet **ΕΚΔΗΛΩΣΕΙΣ**
3. Κάνε copy τα δεδομένα
4. Κάνε paste στο Google Sheet **EVENTS**
   (ίδια σειρά στηλών: ID, Date, Customer, Type, Hall, People, Status)

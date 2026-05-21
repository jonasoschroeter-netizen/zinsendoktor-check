# Odoo-Integrationsplan

## Empfehlung

Odoo sollte das führende System für Login, Nutzerverwaltung, Dashboard, Verträge, Status und PDF-Ablage sein. Der Finanz-Gesundheitscheck bleibt ein eingebettetes Frontend-Widget.

Warum:

- Odoo hat bereits Website, Portal/Login, Benutzer, Zugriffsrechte, Datenbank, Chatter/Attachments und Dokumentenablage.
- Vertriebs-Dashboards lassen sich in Odoo sauber über eigene Models, Portal-Ansichten und Record Rules abbilden.
- Das Widget bleibt unabhängig und kann in Odoo, IONOS oder anderen Websites eingebettet werden.
- PDF-Berichte und Vertrags-PDFs sollten langfristig als `ir.attachment` an Odoo-Datensätze gehängt werden.

## Zielarchitektur

1. Odoo Website/Portal
   - Anmeldung/Registrierung
   - Zugriff nur für angemeldete Vertriebler
   - Dashboard mit Verträgen

2. Odoo Custom Modul
   - eigene Models für Kundenberichte und Verträge
   - Status: `running`, `open`, `failed`
   - Portal- oder Backend-Dashboard
   - Controller-Endpunkte für das Widget

3. Finanzcheck Widget
   - läuft im Browser in einem Odoo-Tab
   - erzeugt Ergebnis und Kundenbericht
   - ruft später über einen Odoo-Controller einen Speicher-Endpunkt auf
   - aktuell vorbereitet, aber ohne sichtbare Änderung und ohne API-Call

## Vorgeschlagene Odoo Models

### `zd.contract`

Felder:

- `name`
- `salesperson_id` -> `res.users`
- `customer_name`
- `customer_email`
- `status` Selection: `running`, `open`, `failed`
- `contract_type`
- `amount`
- `pdf_attachment_ids` -> `ir.attachment`
- `check_report_id` -> `zd.financial.check.report`
- `create_date`, `write_date`

### `zd.financial.check.report`

Felder:

- `name`
- `salesperson_id` -> `res.users`
- `customer_name`
- `input_json`
- `result_json`
- `report_html`
- `report_pdf_attachment_id` -> `ir.attachment`
- `global_score`
- `global_traffic_light`
- `created_at`

## API/Controller später

Beispiel-Endpunkte:

- `POST /zd/check/report`
  - speichert Ergebnisdaten
  - erzeugt serverseitig PDF oder speichert HTML plus PDF-Anhang
  - gibt Report-ID zurück

- `GET /zd/contracts`
  - liefert Dashboard-Daten für den eingeloggten Vertriebler

- `POST /zd/contracts`
  - legt Vertrag an oder aktualisiert Status

Wichtig: Diese Endpunkte sollten `auth="user"` verwenden, damit nur eingeloggte Odoo-Nutzer schreiben können.

## Bereits im Widget vorbereitet

Das Widget hat jetzt unsichtbare Integrations-Typen:

- `integration.currentUser`
- `integration.endpoints`
- `integration.odooModels`
- `onCustomerReportGenerated(payload)`

Der Payload enthält:

- Eingaben
- Ergebnisse
- HTML-Bericht
- kopierbaren Ergebnistext
- Kundenname
- Berater-/User-Kontext
- Zeitpunkt

Es wird aktuell kein API-Call ausgeführt. Der Hook ist nur vorbereitet.

## Einbettung später in Odoo

```html
<div id="zinsendoktor-check"></div>
<script src="https://zinsendoktor-check.onrender.com/zinsendoktor-check.js"></script>
<script>
  ZinsendoktorCheck.mount("#zinsendoktor-check", {
    mode: "anonymous",
    enableLeadForm: false,
    storage: false,
    integration: {
      provider: "odoo",
      enabled: false,
      currentUser: {
        id: "ODOO_USER_ID",
        name: "ODOO_USER_NAME",
        email: "ODOO_USER_EMAIL",
        role: "sales"
      },
      endpoints: {
        saveReport: "/zd/check/report",
        saveContract: "/zd/contracts",
        listContracts: "/zd/contracts"
      },
      odooModels: {
        report: "zd.financial.check.report",
        contract: "zd.contract",
        attachment: "ir.attachment"
      }
    },
    onCustomerReportGenerated: function(payload) {
      // Später: payload an Odoo Controller senden.
      // Im aktuellen Test bewusst deaktiviert.
    }
  });
</script>
```

## Entscheidung: Odoo oder komplett selber bauen?

Für den beschriebenen Vertriebsfall ist Odoo die bessere Basis, wenn ihr Odoo ohnehin nutzt und dort Login, Website und Dokumente liegen sollen.

Komplett selber bauen lohnt sich nur, wenn:

- Odoo stark eingeschränkt ist,
- ihr keine Custom Modules/Controller nutzen könnt,
- sehr spezielle UX oder externe Systeme wichtiger sind als Odoo-Integration.

Wenn Odoo Online ohne Custom-Module genutzt wird, muss geprüft werden, ob euer Tarif externe API/Custom-Entwicklung erlaubt. Falls nicht, wäre ein separates Backend neben Odoo nötig.

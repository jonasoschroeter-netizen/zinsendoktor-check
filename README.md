# Zinsendoktor.de Finanz-Gesundheitscheck

Ein einbettbares React/TypeScript-Widget für einen anonymen Finanz-Gesundheitscheck. Das MVP arbeitet vollständig clientseitig: kein Login, keine Datenbank, kein Backend, keine Cookies, kein `localStorage`, kein `sessionStorage`, keine API-Calls.

## Entwicklung

```bash
npm install
npm run dev
```

Die Demo läuft anschließend unter der von Vite ausgegebenen lokalen URL.

Der gebaute Einbettungspfad kann lokal über `embed-test.html` geprüft werden. Diese Datei lädt bereits `dist/zinsendoktor-check.js` per Script-Tag.

## Prüfen und bauen

```bash
npm run check
```

Der Build erzeugt:

```text
dist/
  index.html
  einbindung.html
  zinsendoktor-check.js
```

Das CSS wird vom Widget in den Widget-Container injiziert. Für IONOS muss deshalb nur eine JavaScript-Datei hochgeladen und eingebunden werden.

## Render Deployment

Das Projekt ist als Render Static Site vorbereitet.

Render-Einstellungen, falls du manuell im Dashboard deployest:

```text
Service Type: Static Site
Build Command: npm ci && npm run build
Publish Directory: dist
Node Version: 22.16.0
```

Alternativ kann Render die Datei `render.yaml` als Blueprint verwenden:

```yaml
services:
  - type: web
    runtime: static
    name: zinsendoktor-check
    buildCommand: npm ci && npm run build
    staticPublishPath: ./dist
```

Nach dem Deployment:

- Die Render-Startseite zeigt direkt den Finanz-Gesundheitscheck.
- Das Widget-Bundle liegt unter `https://DEINE-RENDER-URL.onrender.com/zinsendoktor-check.js`.
- Die Einbauhilfe liegt unter `https://DEINE-RENDER-URL.onrender.com/einbindung.html`.

## Einbindung

```html
<div id="zinsendoktor-check"></div>
<script src="https://www.DEINE-DOMAIN.de/zinsendoktor-check/zinsendoktor-check.js"></script>
<script>
  ZinsendoktorCheck.mount("#zinsendoktor-check", {
    mode: "anonymous",
    enableLeadForm: false,
    storage: false,
    theme: {
      primaryColor: "#0B1F3A",
      accentColor: "#1FA37A"
    }
  });
</script>
```

## IONOS-Varianten

**IONOS MyWebsite Now / Homepage-Baukasten:** HTML-Modul hinzufügen, den Einbettungscode einfügen und bei der Datenschutz-Option für diesen anonymen Test "Keine Zustimmung erforderlich" wählen. Das gilt nur, solange keine Leads, Cookies, Tracking- oder API-Verbindungen aktiviert werden.

**IONOS Webhosting:** Den Ordner `/zinsendoktor-check/` auf den Webspace hochladen und `dist/zinsendoktor-check.js` darin ablegen. Danach den Einbettungscode auf der gewünschten Seite einfügen.

**IONOS WordPress:** Den gleichen Einbettungscode in einen Custom-HTML-Block oder ein Snippet-Plugin einfügen.

## Architektur

- `src/calculations.ts`: reine Berechnungs- und Textfunktionen
- `src/widget.tsx`: React-UI und Flow
- `src/mount.tsx`: robuste Mount-Funktion mit optionalem Shadow DOM
- `src/styles.ts`: vollständig gescopte `.zd-` Styles
- `src/zinsendoktor-check.tsx`: globaler Widget-Export

Das Widget kann mehrfach gemountet werden. Standardmäßig nutzt es Shadow DOM, fällt bei Bedarf aber auf normales DOM mit stark gescopten Klassen zurück.

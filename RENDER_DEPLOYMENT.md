# Render Deployment

Dieses Projekt ist für Render als Static Site vorbereitet.

## Variante 1: Dashboard

1. Repo zu GitHub/GitLab/Bitbucket hochladen.
2. In Render: **New** > **Static Site**.
3. Repo verbinden.
4. Diese Werte setzen:

```text
Build Command: npm ci && npm run build
Publish Directory: dist
Node Version: 22.16.0
```

5. Deploy starten.

Nach dem Deploy ist der Check direkt auf der Render-Startseite erreichbar:

```text
https://DEINE-RENDER-URL.onrender.com/
```

Das Widget-Bundle liegt hier:

```text
https://DEINE-RENDER-URL.onrender.com/zinsendoktor-check.js
```

Die Einbauhilfe liegt hier:

```text
https://DEINE-RENDER-URL.onrender.com/einbindung.html
```

## Variante 2: Blueprint

Render kann auch die Datei `render.yaml` im Repo verwenden. Dann sind Build Command und Publish Directory bereits vorkonfiguriert.

## Einbettung auf einer anderen Website

```html
<div id="zinsendoktor-check"></div>
<script src="https://DEINE-RENDER-URL.onrender.com/zinsendoktor-check.js"></script>
<script>
  ZinsendoktorCheck.mount("#zinsendoktor-check", {
    mode: "anonymous",
    enableLeadForm: false,
    storage: false
  });
</script>
```

## Datenschutz im aktuellen Test

Keine Speicherung, keine Cookies, kein `localStorage`, kein `sessionStorage`, keine API-Calls, kein Backend. Die Auswertung entsteht nur im Browser.

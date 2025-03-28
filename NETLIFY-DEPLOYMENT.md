# Netlify Deployment Anleitung

Diese Anleitung beschreibt, wie du die YouTube-Gaming-Channel-Webseite auf Netlify deployen kannst.

## Vorbereitungen

1. Erstelle ein kostenloses Konto auf [Netlify](https://www.netlify.com/) falls du noch keines hast.
2. Verknüpfe dein GitHub/GitLab/Bitbucket Repository mit Netlify oder lade das Projekt direkt hoch.

## Umgebungsvariablen einrichten

Füge folgende Umgebungsvariablen in den Netlify-Einstellungen unter "Site settings" → "Environment variables" hinzu:

- `YOUTUBE_API_KEY`: Dein YouTube API-Schlüssel
- `YOUTUBE_CHANNEL_ID`: Die YouTube-Kanal-ID
- `FIREBASE_PROJECT_ID`: Deine Firebase Projekt-ID
- `FIREBASE_CLIENT_EMAIL`: Die Firebase Client-Email
- `FIREBASE_PRIVATE_KEY`: Der Firebase Private Key (WICHTIG: Verwende den kompletten Private Key mit `\n` Zeichen)

Optional, falls du die PostgreSQL-Datenbank verwendest:
- `DATABASE_URL`: Die komplette Datenbank-URL
- `PGUSER`: PostgreSQL Benutzername
- `PGPASSWORD`: PostgreSQL Passwort
- `PGDATABASE`: PostgreSQL Datenbankname
- `PGHOST`: PostgreSQL Host
- `PGPORT`: PostgreSQL Port

## Build-Einstellungen

Setze die Netlify Build-Einstellungen:

- **Build command**: `./build-netlify.sh`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

## Automatische Umleitung

Die Datei `netlify.toml` ist bereits konfiguriert, um alle API-Anfragen zu den Netlify-Funktionen umzuleiten und SPA-Routing zu unterstützen.

## Wichtige Hinweise

- Die Webseite nutzt Firebase als primären Speicher, mit einem Memory-Fallback wenn Firebase nicht verfügbar ist.
- Bei jedem Deployment wird der Memory-Speicher zurückgesetzt. Um persistenten Speicher zu gewährleisten, stelle sicher, dass Firebase oder die PostgreSQL-Datenbank korrekt konfiguriert sind.
- Netlify Functions haben ein Zeitlimit von 10 Sekunden. Stelle sicher, dass deine API-Anfragen schnell genug abgeschlossen werden.

## Problembehebung

Wenn Probleme beim Deployment auftreten:

1. Überprüfe die Logs in der Netlify-Benutzeroberfläche.
2. Stelle sicher, dass alle Umgebungsvariablen korrekt gesetzt sind.
3. Vergewissere dich, dass die Firebase-Konfiguration korrekt ist (insbesondere der Private Key).
4. Wenn du eine PostgreSQL-Datenbank nutzt, prüfe die Verbindung und stelle sicher, dass die Datenbank aus dem Netlify-Netzwerk erreichbar ist.
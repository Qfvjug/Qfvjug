# YouTube Gaming Channel Website

Eine dynamische Webseite für deinen YouTube-Gaming-Kanal, mit einer immersiven und interaktiven Plattform für Gaming-Enthusiasten.

## Funktionen

- Interaktives Dashboard mit YouTube-Integration
- Live-Subscriber-Zähler
- Livestream-Integration
- Download-Bereich für Gaming-Ressourcen
- News-Ticker mit aktuellen Updates
- Admin-Bereich für Content-Management
- Zweisprachig: Deutsch und Englisch (basierend auf Browser-Einstellungen)

## Technologie-Stack

- Frontend: React.js mit TypeScript
- Backend: Express.js
- Datenbank: PostgreSQL mit Drizzle ORM
- Styling: Tailwind CSS mit Shadcn UI
- YouTube API Integration

## Lokale Entwicklung

1. Repository klonen
2. Dependencies installieren: `npm install`
3. Datenbank-URL in eine `.env` Datei setzen: `DATABASE_URL=postgres://...`
4. YouTube API Key hinzufügen: `YOUTUBE_API_KEY=your_api_key`
5. YouTube Channel ID hinzufügen: `YOUTUBE_CHANNEL_ID=your_channel_id`
6. Entwicklungsserver starten: `npm run dev`

## Deployment auf Netlify

1. Ein Netlify-Konto erstellen (falls noch nicht vorhanden)
2. Auf Netlify ein neues Projekt erstellen und mit deinem Git-Repository verbinden
3. Build-Einstellungen konfigurieren:
   - Build-Befehl: `npm run build`
   - Publish-Verzeichnis: `dist`
4. Umgebungsvariablen hinzufügen:
   - `DATABASE_URL`: Deine PostgreSQL-Datenbank-URL (z.B. von Neon.tech)
   - `YOUTUBE_API_KEY`: Dein YouTube API-Schlüssel
   - `YOUTUBE_CHANNEL_ID`: Deine YouTube-Kanal-ID
5. Deployment starten

## Datenbank-Setup

Die Anwendung benötigt eine PostgreSQL-Datenbank. Du kannst einen kostenlosen Datenbankdienst wie [Neon](https://neon.tech) oder [Supabase](https://supabase.com) nutzen.

Nachdem du eine Datenbank erstellt hast:
1. Die Verbindungs-URL zu deiner Netlify-Umgebung hinzufügen
2. Bei der ersten Ausführung werden automatisch alle Tabellen erstellt

## Admin-Zugang

Standardmäßig wird ein Admin-Benutzer erstellt:
- Benutzername: `admin`
- Passwort: `admin123`

Ändere dieses Passwort nach dem ersten Login.

## Lizenz

MIT
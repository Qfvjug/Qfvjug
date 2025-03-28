# Firebase-Only Modus

## Übersicht

Dieses Projekt wurde auf Firebase als primären Datenspeicher umgestellt. Die PostgreSQL-Abhängigkeiten sind in `package.json` noch vorhanden, werden aber nicht mehr verwendet.

## Änderungen

### Folgende Dateien wurden angepasst:

1. `server/index.ts` - Entfernung der PostgreSQL-Initialisierung, jetzt wird nur noch Firebase verwendet
2. `server/db.ts` - Stub-Implementierung, die Fehler wirft, wenn sie aufgerufen wird
3. `server/storage.ts` - Stub-Implementierung, die Fehler wirft, wenn sie aufgerufen wird

### Die Initialisierungslogik verwendet jetzt:

1. Primär: Firebase Firestore
2. Fallback: In-Memory-Speicher (wenn Firebase nicht verfügbar ist)

### PostgreSQL-Abhängigkeiten

Die folgenden Abhängigkeiten werden nicht mehr benötigt, sind aber für Kompatibilitätszwecke in `package.json` belassen:

- `@neondatabase/serverless`
- `connect-pg-simple`
- `postgres`
- `drizzle-orm` 
- `drizzle-zod`
- `drizzle-kit`

## Hintergrund

Die Umstellung auf Firebase als primären Datenspeicher wurde vorgenommen, um die Abhängigkeit von einer PostgreSQL-Datenbank zu entfernen und die Bereitstellung zu vereinfachen. Die Firebase-Implementierung bietet die gleiche Funktionalität wie die PostgreSQL-Implementierung, aber mit einer einfacheren Einrichtung und Wartung.

## Netlify-Bereitstellung

Die Netlify-Bereitstellung funktioniert weiterhin wie zuvor, aber ohne die Notwendigkeit, eine PostgreSQL-Datenbank einzurichten. Die Umgebungsvariable `DATABASE_URL` wird nicht mehr benötigt.
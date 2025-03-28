// Diese Datei ist jetzt ein Stubfile, da wir zu Firebase migriert sind
import * as schema from "@shared/schema";

// Stub für die Drizzle-Datenbank, die jetzt nicht mehr genutzt wird
// Wird nur für Typisierung benötigt
const db = {
  select: () => {
    throw new Error('PostgreSQL DB is not used anymore, using Firebase instead');
  },
  insert: () => {
    throw new Error('PostgreSQL DB is not used anymore, using Firebase instead');
  },
  update: () => {
    throw new Error('PostgreSQL DB is not used anymore, using Firebase instead');
  },
  delete: () => {
    throw new Error('PostgreSQL DB is not used anymore, using Firebase instead');
  }
};

export { db };

// Leere Migration-Funktion, da wir keine PostgreSQL mehr verwenden
export async function runMigrations() {
  console.log("PostgreSQL migrations skipped, using Firebase instead");
  return;
}